exports.seed = async function(knex) {
  await knex('incidents').insert([
    { id: 1, location: 'Bank', level: 'low', status: 'open', hero_id: null }, // Zwykły, gotowy do przypisania
    { id: 2, location: 'Reaktor', level: 'critical', status: 'open', hero_id: null }, // Krytyczny, gotowy do przypisania
    { id: 3, location: 'Muzeum', level: 'medium', status: 'assigned', hero_id: 2 }, // Przypisany do Hulka (do testu resolve)
    { id: 4, location: 'Sklep', level: 'low', status: 'resolved', hero_id: 1 }, // Już rozwiązany
    { id: 5, location: 'Most', level: 'critical', status: 'assigned', hero_id: 1 }, // Przypisany do Supermana
    { id: 6, location: 'Metro', level: 'medium', status: 'open', hero_id: null },
    { id: 7, location: 'Park', level: 'low', status: 'open', hero_id: null },
    { id: 8, location: 'Port', level: 'critical', status: 'resolved', hero_id: 5 }
  ]);
};