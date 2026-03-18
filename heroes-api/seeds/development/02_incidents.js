const { faker } = require('@faker-js/faker');

exports.seed = async function(knex) {
  faker.seed(7);

  const levels = ['low', 'medium', 'critical'];
  const statuses = ['open', 'assigned', 'resolved'];

  // Pobieramy ID wygenerowanych przed chwilą bohaterów, żeby móc ich przypisać
  const heroes = await knex('heroes').select('id');
  const heroIds = heroes.map(h => h.id);

  const incidents = Array.from({ length: 60 }).map(() => {
    const status = faker.helpers.arrayElement(statuses);
    let hero_id = null;
    let assigned_at = null;
    let resolved_at = null;

    // Logika relacyjna: jeśli incydent nie jest 'open', musi mieć przypisanego bohatera
    if (status !== 'open') {
      hero_id = faker.helpers.arrayElement(heroIds);
      assigned_at = faker.date.recent();
      
      if (status === 'resolved') {
        resolved_at = faker.date.between({ from: assigned_at, to: new Date() });
      }
    }

    return {
      location: faker.location.streetAddress(),
      district: faker.location.county(), // Nowa kolumna z migracji addytywnej
      level: faker.helpers.arrayElement(levels),
      status: status,
      hero_id: hero_id,
      assigned_at: assigned_at,
      resolved_at: resolved_at
    };
  });

  await knex('incidents').insert(incidents);
};