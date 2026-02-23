'use strict';

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { init } = require('../../lib/server');

const { describe, it, before, after } = exports.lab = Lab.script();

describe('Favorite Routes', () => {

    let server;
    let userToken;
    let movieId;

    before(async () => {
        server = await init();

        // Create user
        const userRes = await server.inject({
            method: 'POST',
            url: '/user/register',
            payload: {
                firstName: 'Fav',
                lastName: 'User',
                email: `fav-${Date.now()}@test.com`,
                password: 'password',
                scope: 'user'
            }
        });

        // Login
        const loginRes = await server.inject({
            method: 'POST',
            url: '/user/login',
            payload: {
                email: userRes.result.email,
                password: 'password'
            }
        });
        userToken = loginRes.result.token;

        // Create Admin to add a movie
        const adminRes = await server.inject({
            method: 'POST',
            url: '/user/register',
            payload: {
                firstName: 'Admin',
                lastName: 'Fav',
                email: `admin-fav-${Date.now()}@test.com`,
                password: 'password',
                scope: 'admin'
            }
        });

        const adminLogin = await server.inject({
            method: 'POST',
            url: '/user/login',
            payload: { email: adminRes.result.email, password: 'password' }
        });
        const adminToken = adminLogin.result.token;

        // Add Movie
        const movieRes = await server.inject({
            method: 'POST',
            url: '/movies',
            headers: { Authorization: adminToken },
            payload: {
                title: 'Fav Movie',
                description: 'To be favorite',
                releaseDate: '2022-01-01',
                director: 'Fav Director'
            }
        });
        movieId = movieRes.result.id;
    });

    after(async () => {
        await server.stop();
    });

    it('should add a movie to favorites', async () => {
        const res = await server.inject({
            method: 'POST',
            url: `/movies/${movieId}/favorite`,
            headers: { Authorization: userToken }
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result.message).to.equal('Added to favorites');
    });

    it('should error when adding duplicate favorite', async () => {
        const res = await server.inject({
            method: 'POST',
            url: `/movies/${movieId}/favorite`,
            headers: { Authorization: userToken }
        });
        expect(res.statusCode).to.equal(409); // Conflict
    });

    it('should remove a movie from favorites', async () => {
        const res = await server.inject({
            method: 'DELETE',
            url: `/movies/${movieId}/favorite`,
            headers: { Authorization: userToken }
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result.message).to.equal('Removed from favorites');
    });

    it('should error when removing non-existent favorite', async () => {
        const res = await server.inject({
            method: 'DELETE',
            url: `/movies/${movieId}/favorite`,
            headers: { Authorization: userToken }
        });
        expect(res.statusCode).to.equal(404); // Not Found
    });
});
