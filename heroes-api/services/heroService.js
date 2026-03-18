const heroRepository = require('../repositories/heroRepository');

// Zaktualizowane DTO pod nową strukturę z migracji
const toDTO = (row) => ({
  id: row.id,
  name: row.name,
  power: row.power,
  status: row.status,
  missionsCount: row.missions_count,
  createdAt: row.created_at
});

const makeError = (message, code) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

const findAll = async (params) => {
  // Wyciąganie parametrów z wartościami domyślnymi
  let { page = 1, pageSize = 10, power, status, sortBy = 'name', sortDir = 'asc' } = params;

  // Walidacja logiki biznesowej dla paginacji
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10)); // max 50

  const allowedSortFields = ['name', 'missions_count', 'created_at'];
  if (!allowedSortFields.includes(sortBy)) sortBy = 'name';

  const { data, total } = await heroRepository.findAll({ power, status, sortBy, sortDir, page, pageSize });

  return {
    data: data.map(toDTO),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

const findOne = async (id) => {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) throw makeError('Invalid id', 'VALIDATION_ERROR');

  const row = await heroRepository.findOne(parsedId);
  if (!row) throw makeError('Hero not found', 'NOT_FOUND');
  return toDTO(row);
};

const create = async ({ name, power, status }) => {
  const allowedPowers = ['flight', 'strength', 'telepathy', 'speed', 'invisibility'];
  const allowedStatus = ['available', 'busy', 'retired'];

  if (!name?.trim()) throw makeError('Name is required', 'VALIDATION_ERROR');
  if (!allowedPowers.includes(power)) throw makeError('Invalid power', 'VALIDATION_ERROR');
  // Status w migracji ma domyślne 'available', więc możemy go pominąć
  if (status && !allowedStatus.includes(status)) throw makeError('Invalid status', 'VALIDATION_ERROR');

  const row = await heroRepository.create({ name: name.trim(), power, status: status || 'available' });
  return toDTO(row);
};

const update = async (id, updateData) => {
  // Sprawdzamy czy bohater istnieje
  await findOne(id); 

  // Tu można dodać walidację dozwolonych do edycji pól (np. nie pozwalamy zmienić ID)
  const allowedFields = ['name', 'power', 'status', 'missions_count'];
  const dataToUpdate = {};
  
  for (const key of Object.keys(updateData)) {
    if (allowedFields.includes(key)) {
      dataToUpdate[key] = updateData[key];
    }
  }

  const row = await heroRepository.update(id, dataToUpdate);
  return toDTO(row);
};

module.exports = { findAll, findOne, create, update };