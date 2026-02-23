'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class Movie extends Model {

    static get tableName() {

        return 'movies';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            title: Joi.string().required().min(1).example('Inception'),
            description: Joi.string().required().example('A dream within a dream'),
            releaseDate: Joi.date().required().example('2010-07-16'),
            director: Joi.string().required().example('Christopher Nolan'),
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
        // const Favorite = require('./favorite');
        const User = require('./user');

        return {
            favoritedBy: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'movies.id',
                    through: {
                        from: 'favorites.movieId',
                        to: 'favorites.userId'
                    },
                    to: 'users.id'
                }
            }
        };
    }
};
