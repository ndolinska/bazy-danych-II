'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    faker.seed(7);
    const levels = ['low', 'medium', 'critical'];
    const statuses = ['open', 'assigned', 'resolved'];

    // Pobieramy wygenerowanych bohaterów z bazy by powiązać klucze obce
    const heroes = await queryInterface.sequelize.query('SELECT id from heroes;');
    const heroIds = heroes[0].map(h => h.id);

    const incidents = Array.from({ length: 60 }).map(() => {
      const status = faker.helpers.arrayElement(statuses);
      let hero_id = null;
      let assigned_at = null;
      let resolved_at = null;

      if (status !== 'open') {
        hero_id = faker.helpers.arrayElement(heroIds);
        assigned_at = faker.date.recent();
        if (status === 'resolved') {
          resolved_at = faker.date.between({ from: assigned_at, to: new Date() });
        }
      }

      return {
        location: faker.location.streetAddress(),
        district: faker.location.county(),
        level: faker.helpers.arrayElement(levels),
        status: status,
        hero_id: hero_id,
        assigned_at: assigned_at,
        resolved_at: resolved_at,
        created_at: new Date(),
        updated_at: new Date()
      };
    });

    await queryInterface.bulkInsert('incidents', incidents, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('incidents', null, {});
  }
};