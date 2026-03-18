exports.up = async function(knex) {
  await knex.schema.createTable('heroes', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique(); 
    table.enu('power', ['flight', 'strength', 'telepathy', 'speed', 'invisibility']).notNullable();
    table.enu('status', ['available', 'busy', 'retired']).notNullable().defaultTo('available');
    
    table.timestamps(true, true); 
  });

  await knex.schema.createTable('incidents', (table) => {
    table.increments('id').primary();
    table.string('location').notNullable();
    table.enu('level', ['low', 'medium', 'critical']).notNullable();
    table.enu('status', ['open', 'assigned', 'resolved']).notNullable().defaultTo('open');
    table.integer('hero_id').unsigned().references('id').inTable('heroes').onDelete('SET NULL');
    
    table.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  // Usuwamy w odwrotnej kolejności z powodu klucza obcego! Najpierw incidents, potem heroes.
  await knex.schema.dropTableIfExists('incidents');
  await knex.schema.dropTableIfExists('heroes');
};