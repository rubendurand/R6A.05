'use strict';

const Joi = require('joi');

module.exports = [
    {
        method: 'POST',
        path: '/movies/export',
        options: {
            auth: { strategy: 'jwt', scope: ['admin'] },
            description: 'Request CSV export',
            tags: ['api']
        },
        handler: async (request, h) => {
            const { exportService } = request.services();
            await exportService.publishExportRequest(request.auth.credentials.email);
            return { message: 'Export request received. You will receive an email shortly.' };
        }
    },
    {
        method: 'GET',
        path: '/movies',
        options: {
            auth: { strategy: 'jwt', mode: 'optional' }, // Public or User
            description: 'List movies',
            tags: ['api'],
            handler: async (request, h) => {
                const { movieService } = request.services();
                return await movieService.findAll();
            }
        }
    },
    {
        method: 'POST',
        path: '/movies',
        options: {
            auth: { strategy: 'jwt', scope: ['admin'] },
            description: 'Create movie',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    title: Joi.string().required().min(1).example('Inception'),
                    description: Joi.string().required().example('Description...'),
                    releaseDate: Joi.date().required().example('2010-07-16'),
                    director: Joi.string().required().example('Christopher Nolan')
                })
            }
        },
        handler: async (request, h) => {
            const { movieService } = request.services();
            return await movieService.create(request.payload);
        }
    },
    {
        method: 'PATCH',
        path: '/movies/{id}',
        options: {
            auth: { strategy: 'jwt', scope: ['admin'] },
            description: 'Update movie',
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                }),
                payload: Joi.object({
                    title: Joi.string().min(1),
                    description: Joi.string(),
                    releaseDate: Joi.date(),
                    director: Joi.string()
                })
            }
        },
        handler: async (request, h) => {
            const { movieService } = request.services();
            const updated = await movieService.update(request.params.id, request.payload);

            if (!updated) {
                return h.response().code(404);
            }
            return updated;
        }
    },
    {
        method: 'DELETE',
        path: '/movies/{id}',
        options: {
            auth: { strategy: 'jwt', scope: ['admin'] },
            description: 'Delete movie',
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            }
        },
        handler: async (request, h) => {
            const { movieService } = request.services();
            await movieService.delete(request.params.id);
            return h.response().code(204);
        }
    },
    {
        method: 'POST',
        path: '/movies/{id}/favorite',
        options: {
            auth: { strategy: 'jwt', scope: ['user'] },
            description: 'Add movie to favorites',
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            }
        },
        handler: async (request, h) => {
            const { userService } = request.services();
            // userId comes from JWT
            return await userService.addFavorite(request.auth.credentials.id, request.params.id);
        }
    },
    {
        method: 'DELETE',
        path: '/movies/{id}/favorite',
        options: {
            auth: { strategy: 'jwt', scope: ['user'] },
            description: 'Remove movie from favorites',
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            }
        },
        handler: async (request, h) => {
            const { userService } = request.services();
            return await userService.removeFavorite(request.auth.credentials.id, request.params.id);
        }
    }
];
