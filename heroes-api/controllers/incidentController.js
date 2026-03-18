const incidentService = require('../services/incidentService');

const HTTP_STATUS = { NOT_FOUND: 404, CONFLICT: 409, VALIDATION_ERROR: 422, FORBIDDEN: 403 };

const handleError = (err, res) => {
  const status = HTTP_STATUS[err.code] || 500;
  const body = status === 500 ? { error: 'Internal Server Error' } : { error: err.message };
  if (status === 500) console.error(err);
  res.status(status).json(body);
};

const getAll = async (req, res) => {
  try {
    const result = await incidentService.findAll(req.query);
    res.json(result);
  } catch (err) { handleError(err, res); }
};

const getOne = async (req, res) => {
  try {
    const incident = await incidentService.findOne(req.params.id);
    res.json({ data: incident });
  } catch (err) { handleError(err, res); }
};

const create = async (req, res) => {
  try {
    const { location, district, level } = req.body || {};
    const incident = await incidentService.create({ location, district, level });
    res.status(201)
       .location(`/api/v1/incidents/${incident.id}`)
       .json({ data: incident });
  } catch (err) { handleError(err, res); }
};

const assign = async (req, res) => {
  try {
    const { id } = req.params;
    const { heroId } = req.body || {};
    if (!heroId) return res.status(400).json({ error: 'heroId is required' });

    await incidentService.assign(id, heroId);
    res.status(200).json({ data: { message: 'Hero assigned successfully' } });
  } catch (err) { handleError(err, res); }
};

const resolve = async (req, res) => {
  try {
    await incidentService.resolve(req.params.id);
    res.status(200).json({ data: { message: 'Incident resolved successfully' } });
  } catch (err) { handleError(err, res); }
};

// Nowy endpoint: GET /api/v1/heroes/:id/incidents
const getHeroHistory = async (req, res) => {
  try {
    const result = await incidentService.getHeroIncidents(req.params.id, req.query);
    res.json(result);
  } catch (err) { handleError(err, res); }
};

const getStats = async (req, res) => {
  try {
    const stats = await incidentService.getStats();
    res.status(200).json({ data: stats });
  } catch (err) { 
    handleError(err, res); 
  }
};

module.exports = { getAll, getOne, create, assign, resolve, getHeroHistory, getStats };