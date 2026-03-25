const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Incident extends Model {
    static associate(models) {
      Incident.belongsTo(models.Hero, { foreignKey: 'hero_id', as: 'hero' });
    }
  }

  Incident.init({
    location: { type: DataTypes.STRING(200), allowNull: false },
    district: { type: DataTypes.STRING(100), allowNull: true },
    level: { type: DataTypes.ENUM('low', 'medium', 'critical'), allowNull: false },
    status: { type: DataTypes.ENUM('open', 'assigned', 'resolved'), allowNull: false, defaultValue: 'open' },
    hero_id: { type: DataTypes.INTEGER, allowNull: true }, // ON DELETE SET NULL ustawione w migracji
    assigned_at: { type: DataTypes.DATE, allowNull: true },
    resolved_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    modelName: 'Incident',
    tableName: 'incidents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      afterUpdate: async (incident, options) => {
        if (
          incident.changed('status') && 
          incident.status === 'resolved' && 
          incident.previous('status') === 'assigned'
        ) {
          const hero = await incident.getHero({ transaction: options.transaction });
          if (hero) {
            await hero.increment('missions_count', { by: 1, transaction: options.transaction });
          }
        }
      }
    }
  });

  return Incident;
};