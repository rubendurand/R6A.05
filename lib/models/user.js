'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class User extends Model {

    static get tableName() {

        return 'users';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            firstName: Joi.string().min(3).example('John').description('First name of the user'),
            lastName: Joi.string().min(3).example('Doe').description('Last name of the user'),
            email: Joi.string().email().required().example('john.doe@example.com'),
            password: Joi.string().required(),
            scope: Joi.string().default('user'),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert() {

        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    $beforeUpdate() {

        this.updatedAt = new Date();
    }

    static get relationMappings() {
        const Favorite = require('./favorite');
        const Movie = require('./movie');

        return {
            favorites: {
                relation: Model.HasManyRelation,
                modelClass: Favorite,
                join: {
                    from: 'users.id',
                    to: 'favorites.userId'
                }
            },
            favoriteMovies: {
                relation: Model.ManyToManyRelation,
                modelClass: Movie,
                join: {
                    from: 'users.id',
                    through: {
                        from: 'favorites.userId',
                        to: 'favorites.movieId'
                    },
                    to: 'movies.id'
                }
            }
        };
    }
};
