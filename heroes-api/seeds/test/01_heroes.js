exports.seed = async function(knex) {
  await knex('heroes').insert([
    { id: 1, name: 'Superman Test', power: 'flight', status: 'available', missions_count: 10 },
    { id: 2, name: 'Hulk Test', power: 'strength', status: 'busy', missions_count: 5 }, // Zajęty
    { id: 3, name: 'Flash Test', power: 'speed', status: 'available', missions_count: 0 }, // Dostępny, ale zła moc do critical
    { id: 4, name: 'Prof X Test', power: 'telepathy', status: 'retired', missions_count: 100 }, // Na emeryturze
    { id: 5, name: 'Invisible Man Test', power: 'invisibility', status: 'available', missions_count: 2 }
  ]);
};