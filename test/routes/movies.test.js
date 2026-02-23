'use strict';

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { init } = require('../../lib/server');

const { describe, it, before, after, beforeEach } = exports.lab = Lab.script();

describe('Movie Routes', () => {

    let server;
    let adminToken;
    let userToken;

    before(async () => {
        server = await init();

        // Seed DB if needed or mock. For now, we rely on fresh DB/transactions or just run it.
        // Ideally we should use a test DB.
    });

    after(async () => {
        await server.stop();
    });

    // We assume some initial setup or we create data on the fly.
    // For a real test, we should mock DB or use a separate test DB file.
    // Given the constraints, I will try to create a user and admin first.

    it('should create an admin and user for testing', async () => {

        // Register Admin
        const adminRes = await server.inject({
            method: 'POST',
            url: '/user/register',
            payload: {
                firstName: 'Admin',
                lastName: 'User',
                email: `admin-${Date.now()}@test.com`,
                password: 'password',
                scope: 'admin'
            }
        });
        expect(adminRes.statusCode).to.equal(200);

        // Login Admin
        const loginRes = await server.inject({
            method: 'POST',
            url: '/user/login',
            payload: {
                email: adminRes.result.email,
                password: 'password'
            }
        });
        adminToken = loginRes.result.token;

        // Register User
        const userRes = await server.inject({
            method: 'POST',
            url: '/user/register',
            payload: {
                firstName: 'Normal',
                lastName: 'User',
                email: `user-${Date.now()}@test.com`,
                password: 'password',
                scope: 'user'
            }
        });

        // Login User
        const userLoginRes = await server.inject({
            method: 'POST',
            url: '/user/login',
            payload: {
                email: userRes.result.email,
                password: 'password'
            }
        });
        userToken = userLoginRes.result.token;
    });

    it('should allow public access to list movies', async () => {
        const res = await server.inject({
            method: 'GET',
            url: '/movies'
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).to.be.an.array();
    });

    it('should block non-admin from creating a movie', async () => {
        const res = await server.inject({
            method: 'POST',
            url: '/movies',
            headers: { Authorization: userToken },
            payload: {
                title: 'Test Movie',
                description: 'Desc',
                releaseDate: '2020-01-01',
                director: 'Director'
            }
        });
        expect(res.statusCode).to.equal(403);
    });

    it('should allow admin to create a movie', async () => {
        const res = await server.inject({
            method: 'POST',
            url: '/movies',
            headers: { Authorization: adminToken },
            payload: {
                title: 'Admin Movie',
                description: 'Created by admin',
                releaseDate: '2023-01-01',
                director: 'Admin Director'
            }
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result.title).to.equal('Admin Movie');
    });
});
