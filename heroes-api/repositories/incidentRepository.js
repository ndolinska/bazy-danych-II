// repositories/incidentRepository.js

const { Op } = require('sequelize');
const { Incident, Hero, sequelize, Sequelize } = require('../models');

const findAll = async ({ level, status, district, page = 1, pageSize = 10 }) => {
  const where = {};
  
  if (level) where.level = level;
  if (status) where.status = status;
  // Wyszukiwanie ILIKE przy użyciu operatorów Sequelize
  if (district) where.district = { [Op.iLike]: `%${district}%` };

  const { count, rows } = await Incident.findAndCountAll({
    where,
    order: [['id', 'ASC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return { data: rows, total: count };
};

const findByHeroId = async (heroId, { page = 1, pageSize = 10 }) => {
  const { count, rows } = await Incident.findAndCountAll({
    where: { hero_id: heroId },
    order: [['assigned_at', 'DESC']], // Zgodnie z wymogiem sortowanie malejąco
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return { data: rows, total: count };
};

const findOne = async (id, options = {}) => {
  return await Incident.findByPk(id, {
    ...options,
    // Eager loading: Dołączamy model bohatera w jednym zapytaniu JOIN (brak N+1)
    include: [{
      model: Hero,
      as: 'hero' // Musi się zgadzać z nazwą asocjacji zdefiniowaną w modelu
    }]
  });
};

const create = async (incidentData) => {
  return await Incident.create(incidentData);
};

const getSystemStats = async () => {
  // Zliczanie countem
  const totalHeroes = await Hero.count();
  const totalIncidents = await Incident.count();

  // Grupowanie z użyciem sequelize.fn 
  // Opcja raw: true sprawia, że Sequelize zwraca czyste obiekty zamiast ciężkich instancji Modeli
  const heroesByStatus = await Hero.findAll({
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['status'],
    raw: true
  });

  const heroesByPower = await Hero.findAll({
    attributes: ['power', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['power'],
    raw: true
  });

  const incidentsByStatus = await Incident.findAll({
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['status'],
    raw: true
  });

  const incidentsByLevel = await Incident.findAll({
    attributes: ['level', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['level'],
    raw: true
  });

  //  Średnia (wymóg użycia sequelize.fn)
  const avgMissionsResult = await Hero.findAll({
    attributes: [[sequelize.fn('AVG', sequelize.col('missions_count')), 'avg']],
    raw: true
  });
  const avgMissions = avgMissionsResult[0] ? parseFloat(avgMissionsResult[0].avg) : 0;

  // obieranie dat rozwiązanych incydentów do wyliczenia czasu w minutach w Serwisie
  const resolutionTimes = await Incident.findAll({
    attributes: ['assigned_at', 'resolved_at'],
    where: {
      status: 'resolved',
      // Użycie operatora Op.not z Sequelize do sprawdzenia wartości NULL
      assigned_at: { [Sequelize.Op.not]: null },
      resolved_at: { [Sequelize.Op.not]: null }
    },
    raw: true
  });

  return {
    totalHeroes,
    totalIncidents,
    heroesByStatus,
    heroesByPower,
    incidentsByStatus,
    incidentsByLevel,
    avgMissions,
    resolutionTimes
  };
};

module.exports = { 
  findAll, 
  findByHeroId, 
  findOne, 
  create, 
  getSystemStats 
};