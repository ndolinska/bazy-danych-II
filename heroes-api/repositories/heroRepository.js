const { Hero } = require('../models');

const findAll = async ({ power, status, sortBy = 'name', sortDir = 'asc', page = 1, pageSize = 10 }) => {
  const where = {};
  if (power) where.power = power;
  if (status) where.status = status;
  const { count, rows } = await Hero.findAndCountAll({
    where,
    order: [[sortBy, sortDir]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return { data: rows, total: count };
};

// Dodajemy parametr `options`, by móc później wstrzykiwać transakcje i blokady z poziomu serwisu incydentów
const findOne = async (id, options = {}) => {
  return await Hero.findByPk(id, options);
};

const create = async (heroData) => {
  return await Hero.create(heroData);
};

const update = async (id, updateData, options = {}) => {
  // Najpierw pobieramy instancję, a potem ją aktualizujemy
  const hero = await Hero.findByPk(id, options);
  if (hero) {
    return await hero.update(updateData, options);
  }
  return null;
};
module.exports = { findAll, findOne, create, update };