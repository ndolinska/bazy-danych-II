const incidentRepository = require('../repositories/incidentRepository');
const heroRepository = require('../repositories/heroRepository');
const knex = require('../db/knex'); // Potrzebne tylko do inicjacji transakcji

const toDTO = (row) => ({
  id: row.id,
  location: row.location,
  district: row.district,
  level: row.level,
  status: row.status,
  heroId: row.hero_id,
  assignedAt: row.assigned_at,
  resolvedAt: row.resolved_at
});

const makeError = (message, code) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

const findAll = async (params) => {
  let { page = 1, pageSize = 10, level, status, district } = params;
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));

  const { data, total } = await incidentRepository.findAll({ level, status, district, page, pageSize });

  return {
    data: data.map(toDTO),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  };
};

const findOne = async (id) => {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) throw makeError('Invalid id', 'VALIDATION_ERROR');

  const row = await incidentRepository.findOne(parsedId);
  if (!row) throw makeError('Incident not found', 'NOT_FOUND');
  return toDTO(row);
};

const getHeroIncidents = async (heroId, params) => {
  // Wymóg: błąd 404 jeśli bohater nie istnieje
  const parsedHeroId = Number(heroId);
  const hero = await heroRepository.findOne(parsedHeroId);
  if (!hero) throw makeError('Hero not found', 'NOT_FOUND');

  let { page = 1, pageSize = 10 } = params;
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));

  const { data, total } = await incidentRepository.findByHeroId(parsedHeroId, { page, pageSize });
  return {
    data: data.map(toDTO),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  };
};

const create = async ({ location, district, level }) => {
  const allowedLevels = ['low', 'medium', 'critical'];

  if (!location?.trim()) throw makeError('Location is required', 'VALIDATION_ERROR');
  if (!allowedLevels.includes(level)) throw makeError('Invalid level', 'VALIDATION_ERROR');

  const row = await incidentRepository.create({ location: location.trim(), district: district?.trim(), level, status: 'open' });
  return toDTO(row);
};

const assign = async (incidentId, heroId) => {
  // Uruchamiamy transakcję na poziomie Serwisu
  await knex.transaction(async (trx) => {
    // Odczyty wewnątrz transakcji
    const incident = await incidentRepository.findOne(incidentId, trx);
    if (!incident) throw makeError('Incident not found', 'NOT_FOUND');
    if (incident.status !== 'open') throw makeError('Incident not open', 'CONFLICT');

    const hero = await heroRepository.findOne(heroId, trx);
    if (!hero) throw makeError('Hero not found', 'NOT_FOUND');
    if (hero.status !== 'available') throw makeError('Hero busy', 'CONFLICT');

    if (incident.level === 'critical' && !['flight', 'strength'].includes(hero.power)) {
      throw makeError('Critical incidents require a hero with flight or strength power', 'FORBIDDEN');
    }

    try {
      // Przekazujemy obiekt trx w dół do repozytoriów!
      await heroRepository.updateStatusStrict(heroId, 'available', 'busy', false, trx);
      await incidentRepository.assignHeroStrict(incidentId, heroId, trx);
    } catch (err) {
      if (err.message.includes('CONCURRENCY')) throw makeError('Resource modified by another request', 'CONFLICT');
      throw err; // Jeśli to inny błąd bazy, leci w górę i Knex robi automatyczny ROLLBACK
    }
  }); // Tu następuje automatyczny COMMIT
};

const resolve = async (incidentId) => {
  await knex.transaction(async (trx) => {
    const incident = await incidentRepository.findOne(incidentId, trx);
    if (!incident) throw makeError('Incident not found', 'NOT_FOUND');
    if (incident.status !== 'assigned') throw makeError('Only assigned incidents can be resolved', 'VALIDATION_ERROR');

    try {
      // Bohater wraca na available, a jego missions_count rośnie o 1
      await heroRepository.updateStatusStrict(incident.hero_id, 'busy', 'available', true, trx);
      await incidentRepository.resolveIncidentStrict(incidentId, trx);
    } catch (err) {
      if (err.message.includes('CONCURRENCY')) throw makeError('Resource modified by another request', 'CONFLICT');
      throw err;
    }
  });
};

const getStats = async () => {
  const data = await incidentRepository.getSystemStats();

  const formatGroup = (arr, keyName) => {
    return arr.reduce((acc, curr) => {
      acc[curr[keyName]] = parseInt(curr.count, 10);
      return acc;
    }, {});
  };

  let avgResolutionMinutes = 0;
  if (data.resolutionTimes.length > 0) {
    const totalMs = data.resolutionTimes.reduce((acc, curr) => {
      return acc + (new Date(curr.resolved_at) - new Date(curr.assigned_at));
    }, 0);
    avgResolutionMinutes = Math.round((totalMs / data.resolutionTimes.length) / (1000 * 60));
  }

  return {
    totals: { heroes: data.totalHeroes, incidents: data.totalIncidents },
    performance: {
      averageResolutionTimeMinutes: avgResolutionMinutes,
      averageMissionsPerHero: Number(data.avgMissions.toFixed(2))
    },
    breakdown: {
      heroes: {
        byStatus: formatGroup(data.heroesByStatus, 'status'),
        byPower: formatGroup(data.heroesByPower, 'power')
      },
      incidents: {
        byStatus: formatGroup(data.incidentsByStatus, 'status'),
        byLevel: formatGroup(data.incidentsByLevel, 'level')
      }
    }
  };
};

module.exports = { findAll, findOne, getHeroIncidents, create, assign, resolve, getStats };