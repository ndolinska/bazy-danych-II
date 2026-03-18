const knex = require('../db/knex');

const findAll = async ({ level, status, district, page = 1, pageSize = 10 }) => {
  const query = knex('incidents');

  if (level) query.where('level', level);
  if (status) query.where('status', status);
  if (district) query.where('district', 'ilike', `%${district}%`); // ILIKE - case insensitive w Postgresie

  const countQuery = query.clone().count('* as total').first();

  query.orderBy('id', 'asc')
       .limit(pageSize)
       .offset((page - 1) * pageSize);

  const [data, countResult] = await Promise.all([query, countQuery]);
  const total = parseInt(countResult.total, 10);

  return { data, total };
};

// Pobieranie incydentów konkretnego bohatera (nowy endpoint z zadania)
const findByHeroId = async (heroId, { page = 1, pageSize = 10 }) => {
  const query = knex('incidents').where('hero_id', heroId);
  const countQuery = query.clone().count('* as total').first();

  query.orderBy('assigned_at', 'desc') // Sortowanie malejąco po dacie przypisania
       .limit(pageSize)
       .offset((page - 1) * pageSize);

  const [data, countResult] = await Promise.all([query, countQuery]);
  return { data, total: parseInt(countResult.total, 10) };
};

const findOne = async (id, trx = knex) => {
  return await trx('incidents').where({ id }).first();
};

const create = async (incidentData) => {
  const [incident] = await knex('incidents').insert(incidentData).returning('*');
  return incident;
};

// Metody transakcyjne
const assignHeroStrict = async (incidentId, heroId, trx) => {
  const updatedRows = await trx('incidents')
    .where({ id: incidentId, status: 'open' })
    .update({ 
      status: 'assigned', 
      hero_id: heroId, 
      assigned_at: trx.fn.now(), // Zapisujemy czas przydziału
      updated_at: trx.fn.now()
    });
  
  if (updatedRows === 0) throw new Error('CONCURRENCY_INCIDENT');
};

const resolveIncidentStrict = async (incidentId, trx) => {
  const updatedRows = await trx('incidents')
    .where({ id: incidentId, status: 'assigned' })
    .update({ 
      status: 'resolved', 
      resolved_at: trx.fn.now(), // Zapisujemy czas rozwiązania
      updated_at: trx.fn.now()
    });
    
  if (updatedRows === 0) throw new Error('CONCURRENCY_INCIDENT');
};
const getSystemStats = async () => {
  // Knex.js: count i groupBy
  const totalHeroes = await knex('heroes').count('id as count').first();
  const totalIncidents = await knex('incidents').count('id as count').first();

  const heroesByStatus = await knex('heroes').select('status').count('id as count').groupBy('status');
  const heroesByPower = await knex('heroes').select('power').count('id as count').groupBy('power');
  const incidentsByStatus = await knex('incidents').select('status').count('id as count').groupBy('status');
  const incidentsByLevel = await knex('incidents').select('level').count('id as count').groupBy('level');

  // użycie .avg() z Knex.js
  const avgMissions = await knex('heroes').avg('missions_count as avg').first();

  const resolutionTimes = await knex('incidents')
    .select('assigned_at', 'resolved_at')
    .where('status', 'resolved')
    .whereNotNull('assigned_at')
    .whereNotNull('resolved_at');

  return {
    totalHeroes: parseInt(totalHeroes.count, 10),
    totalIncidents: parseInt(totalIncidents.count, 10),
    heroesByStatus, heroesByPower, incidentsByStatus, incidentsByLevel,
    avgMissions: parseFloat(avgMissions.avg) || 0,
    resolutionTimes
  };
};
module.exports = { findAll, findByHeroId, findOne, create, assignHeroStrict, resolveIncidentStrict, getSystemStats };