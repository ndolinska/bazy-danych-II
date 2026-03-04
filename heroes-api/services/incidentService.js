// services/incidentService.js
const incidentRepository = require('../repositories/incidentRepository');
const heroRepository = require('../repositories/heroRepository');

const toDTO = (row) => ({
  id:       row.id,
  location: row.location,
  level:    row.level,
  status:   row.status,
  heroId:   row.hero_id
});

const makeError = (message, code) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

const findAll = async ({ level, status } = {}) => {
  const rows = await incidentRepository.findAll({ level, status });
  return rows.map(toDTO);
};

const findOne = async (id) => {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw makeError('Invalid id', 'VALIDATION_ERROR');
  }

  const row = await incidentRepository.findOne(parsedId);
  if (!row) throw makeError('Incident not found', 'NOT_FOUND');
  return toDTO(row);
};

const create = async ({ location, level }) => {
  const allowedLevels = ['low', 'medium', 'critical'];

  if (!location?.trim()) throw makeError('Location is required', 'VALIDATION_ERROR');
  if (!allowedLevels.includes(level)) throw makeError('Invalid incident level', 'VALIDATION_ERROR');

  const row = await incidentRepository.create({ location: location.trim(), level, status: 'open' });
  return toDTO(row);
};

const assign = async (incidentId, heroId) => {
  const incident = await findOne(incidentId); // używamy funkcji powyżej, obsłuży błędy 404
  if (incident.status !== 'open') throw makeError('Incident already assigned or resolved', 'CONFLICT');

  const parsedHeroId = Number(heroId);
  if (!Number.isInteger(parsedHeroId) || parsedHeroId <= 0) {
    throw makeError('Invalid hero id', 'VALIDATION_ERROR');
  }

  const hero = await heroRepository.findOne(parsedHeroId);
  if (!hero) throw makeError('Hero not found', 'NOT_FOUND');
  if (hero.herostatus !== 'available') throw makeError('Hero is currently busy', 'CONFLICT');

  if (incident.level === 'critical' && !['flight', 'strength'].includes(hero.power)) {
    throw makeError('Critical incidents require a hero with flight or strength power', 'FORBIDDEN');
  }

  try {
    await incidentRepository.assignHero(incidentId, heroId);
  } catch (err) {
    if (err.message.startsWith('CONCURRENCY')) {
      throw makeError('Resource was modified by another request', 'CONFLICT');
    }
    throw err;
  }
};

const resolve = async (incidentId) => {
  const incident = await findOne(incidentId);
  if (incident.status !== 'assigned') throw makeError('Only assigned incidents can be resolved', 'VALIDATION_ERROR');

  await incidentRepository.resolveIncident(incidentId, incident.heroId);
};

module.exports = { findAll, findOne, create, assign, resolve };