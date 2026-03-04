// repositories/incidentRepository.js
const pool = require('../db');

const findAll = async ({ level, status } = {}) => {
  const { rows } = await pool.query(
    `SELECT id, location, level, status, hero_id
       FROM incidents
      WHERE ($1::text IS NULL OR level = $1)
        AND ($2::text IS NULL OR status = $2)
      ORDER BY id`,
    [level, status]
  );
  return rows;
};

const findOne = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, location, level, status, hero_id
       FROM incidents
      WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ location, level, status }) => {
  const { rows } = await pool.query(
    `INSERT INTO incidents (location, level, status)
     VALUES ($1, $2, $3)
     RETURNING id, location, level, status, hero_id`,
    [location, level, status]
  );
  return rows[0];
};

const assignHero = async (incidentId, heroId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const heroRes = await client.query(
      `UPDATE heroes SET heroStatus = 'busy' 
       WHERE id = $1 AND heroStatus = 'available' 
       RETURNING id`,
      [heroId]
    );
    if (heroRes.rowCount === 0) throw new Error('CONCURRENCY_HERO');
    const incidentRes = await client.query(
      `UPDATE incidents SET status = 'assigned', hero_id = $1 
       WHERE id = $2 AND status = 'open' 
       RETURNING id`,
      [heroId, incidentId]
    );
    if (incidentRes.rowCount === 0) throw new Error('CONCURRENCY_INCIDENT');

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err; 
  } finally {
    client.release();
  }
};

const resolveIncident = async (incidentId, heroId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(
      `UPDATE incidents SET status = 'resolved' WHERE id = $1`, 
      [incidentId]
    );
    await client.query(
      `UPDATE heroes SET heroStatus = 'available' WHERE id = $1`, 
      [heroId]
    );
    
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { findAll, findOne, create, assignHero, resolveIncident };