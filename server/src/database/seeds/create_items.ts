import Knex from 'knex';

export async function seed(knex: Knex){
  await knex('items').insert([
    { title: "Lâmpadas", image: 'lightbulbs.svg' },
    { title: "Pilhas e Baterias", image: 'batteries.svg' },
    { title: "Papel e Papelão", image: 'paper-cardboard.svg' },
    { title: "Resíduo Eletrônico", image: 'e-waste.svg' },
    { title: "Resíduo Orgânico", image: 'organic.svg' },
    { title: "Óleo de Cozinha", image: 'oils.svg' },
  ]);
}