'use strict';

const Dotenv = require('dotenv');

Dotenv.config({ path: `${__dirname}/.env` });

module.exports = {
    development: {
        client: process.env.DB_CLIENT || 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: process.env.DB_FILE || 'movie_db.sqlite'
        },
        migrations: {
            directory: './lib/migrations'
        }
    },
    production: {
        client: process.env.DB_CLIENT || 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: process.env.DB_FILE || 'movie_db.sqlite'
        },
        migrations: {
            directory: './lib/migrations'
        }
    }
};
