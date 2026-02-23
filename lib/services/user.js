'use strict';

const { Service } = require('@hapipal/schmervice');
const Jwt = require('jsonwebtoken');
const Boom = require('@hapi/boom');

const Bcrypt = require('bcrypt');

module.exports = class UserService extends Service {

    async create(user) {

        const { User } = this.server.models();
        const { mailService } = this.server.services();

        // Hash password
        user.password = await Bcrypt.hash(user.password, 10);

        const newUser = await User.query().insertAndFetch(user);

        // Send Welcome Email
        if (mailService) {
            await mailService.sendWelcomeEmail(newUser);
        }

        return newUser;
    }

    async login(email, password) {

        const { User } = this.server.models();

        const user = await User.query().findOne({ email });

        if (!user) {
            return null; // Invalid credentials
        }

        const isValid = await Bcrypt.compare(password, user.password);

        if (!isValid) {
            return null;
        }

        // Generate JWT
        const token = Jwt.sign({
            id: user.id,
            scope: user.scope,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return token;
    }

    async addFavorite(userId, movieId) {
        const { Favorite, Movie } = this.server.models();

        // Check if movie exists
        const movie = await Movie.query().findById(movieId);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        // Check availability (already favorited handled by unique constraint, but we want custom error)
        const existing = await Favorite.query().where({ userId, movieId }).first();
        if (existing) {
            throw Boom.conflict('Movie already in favorites');
        }

        await Favorite.query().insert({ userId, movieId });
        return { message: 'Added to favorites' };
    }

    async removeFavorite(userId, movieId) {
        const { Favorite } = this.server.models();

        const deleted = await Favorite.query().delete().where({ userId, movieId });

        if (deleted === 0) {
            // Could check if movie exists, but sticking to "not in favorites"
            throw Boom.notFound('Movie not in favorites');
        }

        return { message: 'Removed from favorites' };
    }
};
