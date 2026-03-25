'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    await queryInterface.bulkInsert('heroes', [
      { id: 1, name: 'Superman Test', power: 'flight', status: 'available', missions_count: 10, created_at: now, updated_at: now },
      { id: 2, name: 'Hulk Test', power: 'strength', status: 'busy', missions_count: 5, created_at: now, updated_at: now },
      { id: 3, name: 'Flash Test', power: 'speed', status: 'available', missions_count: 0, created_at: now, updated_at: now },
      { id: 4, name: 'Prof X Test', power: 'telepathy', status: 'retired', missions_count: 100, created_at: now, updated_at: now },
      { id: 5, name: 'Invisible Man Test', power: 'invisibility', status: 'available', missions_count: 2, created_at: now, updated_at: now }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('heroes', null, {});
  }
};