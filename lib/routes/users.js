'use strict';

const Joi = require('joi');

module.exports = [
    {
        method: 'POST',
        path: '/user/register',
        options: {
            auth: false,
            description: 'Register a new user',
            notes: 'Creates a new user and sends a welcome email',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    firstName: Joi.string().required().min(3).example('John'),
                    lastName: Joi.string().required().min(3).example('Doe'),
                    email: Joi.string().required().email().example('john@example.com'),
                    password: Joi.string().required().min(6).example('password123'),
                    scope: Joi.string().default('user')
                })
            }
        },
        handler: async (request, h) => {
            const { userService } = request.services();
            try {
                return await userService.create(request.payload);
            } catch (err) {
                if (err.code === 'SQLITE_CONSTRAINT' || err.nativeError?.code === 'SQLITE_CONSTRAINT') {
                    throw Boom.conflict('This email is already registered');
                }
                throw err;
            }
        }
    },
    {
        method: 'POST',
        path: '/user/login',
        options: {
            auth: false,
            description: 'User login',
            notes: 'Returns a JWT token',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().required().email().example('john@example.com'),
                    password: Joi.string().required().example('password123')
                })
            }
        },
        handler: async (request, h) => {
            const { userService } = request.services();
            const token = await userService.login(request.payload.email, request.payload.password);

            if (!token) {
                return h.response({ error: 'Invalid credentials' }).code(401);
            }

            return { token };
        }
    }
];
