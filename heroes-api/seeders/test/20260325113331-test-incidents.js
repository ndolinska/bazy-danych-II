'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    await queryInterface.bulkInsert('incidents', [
      { id: 1, location: 'Bank', level: 'low', status: 'open', hero_id: null, created_at: now, updated_at: now },
      { id: 2, location: 'Reaktor', level: 'critical', status: 'open', hero_id: null, created_at: now, updated_at: now },
      { id: 3, location: 'Muzeum', level: 'medium', status: 'assigned', hero_id: 2, assigned_at: now, created_at: now, updated_at: now },
      { id: 4, location: 'Sklep', level: 'low', status: 'resolved', hero_id: 1, assigned_at: now, resolved_at: now, created_at: now, updated_at: now },
      { id: 5, location: 'Most', level: 'critical', status: 'assigned', hero_id: 1, assigned_at: now, created_at: now, updated_at: now },
      { id: 6, location: 'Metro', level: 'medium', status: 'open', hero_id: null, created_at: now, updated_at: now },
      { id: 7, location: 'Park', level: 'low', status: 'open', hero_id: null, created_at: now, updated_at: now },
      { id: 8, location: 'Port', level: 'critical', status: 'resolved', hero_id: 5, assigned_at: now, resolved_at: now, created_at: now, updated_at: now }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('incidents', null, {});
  }
};