const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.js')[env];

const sequelize = new Sequelize(config.url, config);

// Importujemy modele
const Hero = require('./hero')(sequelize, Sequelize.DataTypes);
const Incident = require('./incident')(sequelize, Sequelize.DataTypes);

const db = { Hero, Incident, sequelize, Sequelize };

// Inicjujemy asocjacje (zgodnie z poleceniem)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;