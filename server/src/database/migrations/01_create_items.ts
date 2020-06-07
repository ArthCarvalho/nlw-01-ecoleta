import Knex from 'knex';

export async function up(knex: Knex) {
  // Create Tables
  return knex.schema.createTable('items', table => {
    table.increments('id').primary();
    table.string('image').notNullable();
    table.string('title').notNullable();
  });
}

export async function down(knex: Knex) {
  // Revert Tables/Delete
  return knex.schema.dropTable('items');
}