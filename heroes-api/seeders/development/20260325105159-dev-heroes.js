'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    faker.seed(7);
    const powers = ['flight', 'strength', 'telepathy', 'speed', 'invisibility'];
    const statuses = ['available', 'busy', 'retired'];

    const heroes = Array.from({ length: 20 }).map(() => ({
      name: faker.person.fullName(),
      power: faker.helpers.arrayElement(powers),
      status: faker.helpers.arrayElement(statuses),
      missions_count: faker.number.int({ min: 0, max: 50 }),
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('heroes', heroes, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('heroes', null, {});
  }
};