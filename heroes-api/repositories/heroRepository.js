// repositories/heroRepository.js
const pool = require('../db');

const findAll = async ({ power, heroStatus } = {}) => {
  const { rows } = await pool.query(
    `SELECT id, name, power, heroStatus
       FROM heroes
      WHERE ($1::text IS NULL OR power = $1)
        AND ($2::text IS NULL OR heroStatus = $2)
      ORDER BY id`,
    [power, heroStatus]
  );
  return rows;
};

const findOne = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, name, power, heroStatus
       FROM heroes
      WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ name, power, heroStatus }) => {
  const { rows } = await pool.query(
    `INSERT INTO heroes (name, power, heroStatus)
     VALUES ($1, $2, $3)
     RETURNING id, name, power, heroStatus`,
    [name, power, heroStatus]
  );
  return rows[0];
};

module.exports = { findAll, findOne, create };
