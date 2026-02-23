'use strict';

const { Service } = require('@hapipal/schmervice');

module.exports = class MovieService extends Service {

    async create(movie) {

        const { Movie } = this.server.models();
        const { mailService, userService } = this.server.services();

        const newMovie = await Movie.query().insertAndFetch(movie);

        // Notify all users about new movie
        if (mailService && userService) {
            const User = this.server.models().User;
            const users = await User.query();

            // In a real app, use a queue!
            for (const user of users) {
                await mailService.sendNewMovieNotification(user, newMovie);
            }
        }

        return newMovie;
    }

    async findAll() {

        const { Movie } = this.server.models();
        return await Movie.query();
    }

    async update(id, movie) {

        const { Movie } = this.server.models();
        const { mailService } = this.server.services();

        const updatedMovie = await Movie.query().patchAndFetchById(id, movie);

        if (updatedMovie && mailService) {
            // Fetch users who favorited this movie
            const movieWithUsers = await Movie.query().findById(id).withGraphFetched('favoritedBy');

            if (movieWithUsers && movieWithUsers.favoritedBy) {
                for (const user of movieWithUsers.favoritedBy) {
                    await mailService.sendMovieUpdateNotification(user, updatedMovie);
                }
            }
        }

        return updatedMovie;
    }

    async delete(id) {

        const { Movie } = this.server.models();
        return await Movie.query().deleteById(id);
    }

    async findById(id) {
        const { Movie } = this.server.models();
        return await Movie.query().findById(id);
    }
};
