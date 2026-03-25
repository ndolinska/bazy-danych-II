const incidentRepository = require('../repositories/incidentRepository');
const heroRepository = require('../repositories/heroRepository');
const { sequelize, Hero } = require('../models'); // Importujemy sequelize do transakcji i Hero do scope'ów

// DTO musi obsłużyć zagnieżdżonego bohatera z Eager Loadingu
const toDTO = (row) => ({
  id: row.id,
  location: row.location,
  district: row.district,
  level: row.level,
  status: row.status,
  heroId: row.hero_id,
  assignedAt: row.assigned_at,
  resolvedAt: row.resolved_at,
  // Zagnieżdżony bohater (jeśli został pobrany przez include)
  hero: row.hero ? {
    id: row.hero.id,
    name: row.hero.name,
    power: row.hero.power,
    status: row.hero.status
  } : null
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

// --- TRANSAKCJE ZARZĄDZANE ---

const assign = async (incidentId, heroId) => {
  // Rozpoczynamy transakcję Sequelize
  await sequelize.transaction(async (t) => {
    // 1. Pobieramy incydent z blokadą pesymistyczną (lock: true)
    const incident = await incidentRepository.findOne(incidentId, { transaction: t, lock: true });
    if (!incident) throw makeError('Incident not found', 'NOT_FOUND');
    if (incident.status !== 'open') throw makeError('Incident not open', 'CONFLICT');

    // 2. Pobieramy bohatera z użyciem wbudowanego SCOPE'a 'available'
    // Zastępuje to ręczne pisanie where: { status: 'available' }
    const hero = await Hero.scope('available').findByPk(heroId, { transaction: t, lock: true });
    if (!hero) throw makeError('Hero not found or busy/retired', 'CONFLICT');

    if (incident.level === 'critical' && !['flight', 'strength'].includes(hero.power)) {
      throw makeError('Critical incidents require a hero with flight or strength power', 'FORBIDDEN');
    }

    // 3. Aktualizujemy obiekty (dane zapisują się w bazie automatycznie dzięki .update())
    await hero.update({ status: 'busy' }, { transaction: t });
    
    await incident.update({ 
      status: 'assigned', 
      hero_id: hero.id, 
      assigned_at: new Date() 
    }, { transaction: t });
    
    // Brak ręcznego t.commit()! Jeśli kod dotrze tutaj, Sequelize samo zrobi COMMIT.
  }); 
};

const resolve = async (incidentId) => {
  await sequelize.transaction(async (t) => {
    const incident = await incidentRepository.findOne(incidentId, { transaction: t, lock: true });
    if (!incident) throw makeError('Incident not found', 'NOT_FOUND');
    if (incident.status !== 'assigned') throw makeError('Only assigned incidents can be resolved', 'VALIDATION_ERROR');

    const hero = await heroRepository.findOne(incident.hero_id, { transaction: t, lock: true });
    if (hero) {
      await hero.update({ status: 'available' }, { transaction: t });
    }

    // Aktualizacja incydentu. 
    // UWAGA: To wywoła hook afterUpdate na modelu Incident, 
    // który automatycznie zwiększy missions_count bohatera w tej samej transakcji!
    await incident.update({ 
      status: 'resolved', 
      resolved_at: new Date() 
    }, { transaction: t });
  });
};

const getStats = async () => {
  // Statystyki również formatujemy, tak samo jak wcześniej
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