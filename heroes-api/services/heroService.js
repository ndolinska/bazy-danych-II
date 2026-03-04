// services/heroService.js
const heroRepository = require('../repositories/heroRepository');

// DTO — decyduje co trafia do klienta, co zostaje w bazie
const toDTO = (row) => ({
  id:        row.id,
  name:      row.name,
  power:     row.power,
  heroStatus: row.herostatus
});

const makeError = (message, code) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

const findAll = async ({ power, heroStatus } = {}) => {
  const rows = await heroRepository.findAll({ power, heroStatus });
  return rows.map(toDTO);
};
const findOne = async (id) => {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw makeError('Invalid id', 'VALIDATION_ERROR');
  }

  const row = await heroRepository.findOne(parsedId);
  if (!row) throw makeError('Hero not found', 'NOT_FOUND');
  return toDTO(row);
};

const create = async ({ name, power, heroStatus }) => {
  const allowedPowers = ['flight', 'strength', 'telepathy', 'speed', 'invisibility'];
  const allowedStatus = ['available', 'busy']
  // Walidacja domenowa
  if (!name?.trim())           throw makeError('Name is required',         'VALIDATION_ERROR');
  if (!allowedPowers.includes(power))   throw makeError('Invalid power',     'VALIDATION_ERROR');
  if (!allowedStatus.includes(heroStatus))  throw makeError('Invalid status',     'VALIDATION_ERROR');

  const row = await heroRepository.create({ name: name.trim(), power, heroStatus });
  return toDTO(row);
};

module.exports = { findAll, findOne, create };