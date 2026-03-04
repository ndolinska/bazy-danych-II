// controllers/heroController.js
const heroService = require('../services/heroService');

const HTTP_STATUS = {
  NOT_FOUND:        404,
  CONFLICT:         409,
  VALIDATION_ERROR: 422,
  FORBIDDEN:        403,
};

const handleError = (err, res) => {
  const status = HTTP_STATUS[err.code] || 500;
  const body   = status === 500
    ? { error: 'Internal Server Error' }     
    : { error: err.message };
  if (status === 500) console.error(err);   
  res.status(status).json(body);
};

// GET /api/v1/heroes?power=??&heroStatus=??
const getAll = async (req, res) => {
  try {
    const {power, heroStatus } = req.query || {}; 
    const heroes  = await heroService.findAll({ power, heroStatus });
    res.json({ data: heroes, meta: { power, heroStatus, count: heroes.length } });
  } catch (err) { handleError(err,res); }
};
// GET /api/v1/heroes/:id

const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const hero = await heroService.findOne(id);
    res.json({ data: hero });
  } catch (err) { handleError(err, res); }
};

// POST /api/v1/heroes
const create = async (req, res) => {
  try {
    const { name, power, heroStatus } = req.body || {};
    if (!name || !power || !heroStatus)
      return res.status(400).json({ error: 'name and power are required' });
    const hero = await heroService.create({ name, power, heroStatus });
    res.status(201)
       .location(`/api/v1/heroes/${hero.id}`)
       .json({ data: hero });
  } catch (err) { handleError(err, res); }
};

module.exports = { getAll, getOne, create };