'use strict';

exports.up = function (knex) {
    return knex.schema.createTable('favorites', (table) => {
        table.increments('id').primary();
        table.integer('userId').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.integer('movieId').unsigned().notNullable().references('id').inTable('movies').onDelete('CASCADE');
        table.unique(['userId', 'movieId']);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('favorites');
};
