const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Hero extends Model {
    static associate(models) {
      Hero.hasMany(models.Incident, { foreignKey: 'hero_id', as: 'incidents' });
    }
  }

  Hero.init({
    name: { 
      type: DataTypes.STRING(120), 
      unique: true, 
      allowNull: false 
    },
    power: { 
      type: DataTypes.ENUM('flight', 'strength', 'telepathy', 'speed', 'invisibility'), 
      allowNull: false 
    },
    status: { 
      type: DataTypes.ENUM('available', 'busy', 'retired'), 
      allowNull: false, 
      defaultValue: 'available' 
    },
    missions_count: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 0,
      validate: { min: 0 } // Walidacja przed zapisem do bazy
    }
  }, {
    sequelize,
    modelName: 'Hero',
    tableName: 'heroes',
    timestamps: true, // Automatyczne created_at i updated_at
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      // Hook czyszczący dane wejściowe
      beforeValidate: (hero, options) => {
        if (hero.name) {
          hero.name = hero.name.trim();
        }
      }
    },
    scopes: {
      available: { where: { status: 'available' } },
      withPower: (power) => ({ where: { power } }),
      withMissions: { order: [['missions_count', 'DESC']] }
    }
  });

  return Hero;
};