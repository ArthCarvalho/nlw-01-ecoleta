import Knex from 'knex';

export async function up(knex: Knex) {
  // Create Tables
  return knex.schema.createTable('points', table => {
    table.increments('id').primary();
    table.string('image').notNullable();
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.string('whatsapp').notNullable();
    table.string('phone');
    table.decimal('latitude').notNullable();
    table.decimal('longitude').notNullable();
    table.string('street').notNullable();
    table.string('reference');
    table.string('city').notNullable();
    table.string('state', 2).notNullable();
  });
}

export async function down(knex: Knex) {
  // Revert Tables/Delete
  return knex.schema.dropTable('points');
}