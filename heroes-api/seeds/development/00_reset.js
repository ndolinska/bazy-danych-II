exports.seed = async function(knex) {
  // Usuwamy wszystkie wpisy
  await knex('incidents').del();
  await knex('heroes').del();
  
  // Resetujemy liczniki ID (przydatne przy testach)
  await knex.raw('ALTER SEQUENCE incidents_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE heroes_id_seq RESTART WITH 1');
};