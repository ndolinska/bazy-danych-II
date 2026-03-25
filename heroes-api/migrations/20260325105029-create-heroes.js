'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('heroes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(120),
        unique: true,
        allowNull: false
      },
      power: {
        type: Sequelize.ENUM('flight', 'strength', 'telepathy', 'speed', 'invisibility'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('available', 'busy', 'retired'),
        allowNull: false,
        defaultValue: 'available'
      },
      missions_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('heroes');
    // W Postgresie typy ENUM zostają po usunięciu tabeli, warto je usunąć, żeby down() było czyste:
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_heroes_power";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_heroes_status";');
  }
};