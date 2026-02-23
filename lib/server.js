'use strict';

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const Jwt = require('hapi-auth-jwt2');
const Schwifty = require('@hapipal/schwifty');
const Schmervice = require('@hapipal/schmervice');
const Dotenv = require('dotenv');

Dotenv.config();

exports.deployment = async (start) => {

    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost'
    });

    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'Movie Library API',
                    version: '1.0.0'
                }
            }
        },
        Jwt
    ]);



    // DB Setup
    await server.register({
        plugin: Schwifty.plugin,
        options: {
            knex: require('../knexfile').development
        }
    });

    // Register generic error handler
    server.register({
        plugin: require('./extensions/error')
    });

    // Services Setup
    await server.register(Schmervice.plugin);

    // Register Models
    server.registerModel([
        require('./models/user'),
        require('./models/movie'),
        require('./models/favorite')
    ]);

    // Register Services
    await server.registerService([
        require('./services/mail'),
        require('./services/user'),
        require('./services/movie'),
        require('./services/export')
    ]);


    // Auth Strategy (Placeholder)
    server.auth.strategy('jwt', 'jwt', {
        key: process.env.JWT_SECRET,
        validate: async (decoded, request, h) => {
            // Validation logic later
            return { isValid: true };
        },
        verifyOptions: { algorithms: ['HS256'] }
    });

    // server.auth.default('jwt'); // Enable later

    // Routes
    server.route([
        ...require('./routes/users'),
        ...require('./routes/movies')
    ]);

    // Serve Static Files
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'public',
                index: ['index.html']
            }
        }
    });

    // server.route({
    //     method: 'GET',
    //     path: '/',
    //     handler: (request, h) => {
    //        // return { message: 'Welcome to Movie Library API' };
    //     }
    // });

    await server.initialize();

    // Initialize RabbitMQ Consumer
    const { exportService } = server.services();
    // Only initialize if not testing? Or let it fail gracefully.
    // In tests, we might not want to connect to RabbitMQ or we mock it.
    // ExportService catches errors so it's fine.
    await exportService.initialize();

    if (start) {
        await server.start();
        console.log(`Server running at: ${server.info.uri}`);
    }

    return server;
};

exports.init = async () => {
    return exports.deployment(false);
};

exports.start = async () => {
    return exports.deployment(true);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});
