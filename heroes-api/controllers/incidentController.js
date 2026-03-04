// controllers/incidentController.js
const incidentService = require('../services/incidentService');

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

// GET /api/v1/incidents?level=??&status=??
const getAll = async (req, res) => {
  try {
    const { level, status } = req.query || {}; 
    const incidents = await incidentService.findAll({ level, status });
    res.json({ data: incidents, meta: { level, status, count: incidents.length } });
  } catch (err) { handleError(err, res); }
};

// POST /api/v1/incidents
const create = async (req, res) => {
  try {
    const { location, level } = req.body || {};
    if (!location || !level)
      return res.status(400).json({ error: 'location and level are required' });
    
    const incident = await incidentService.create({ location, level });
    res.status(201)
       .location(`/api/v1/incidents/${incident.id}`)
       .json({ data: incident });
  } catch (err) { handleError(err, res); }
};

// POST /api/v1/incidents/:id/assign
const assign = async (req, res) => {
  try {
    const { id } = req.params;
    const { heroId } = req.body || {};
    
    if (!heroId) return res.status(400).json({ error: 'heroId is required' });

    await incidentService.assign(id, heroId);
    res.status(200).json({ data: { message: 'Hero assigned successfully' } });
  } catch (err) { handleError(err, res); }
};

// PATCH /api/v1/incidents/:id/resolve
const resolve = async (req, res) => {
  try {
    const { id } = req.params;
    await incidentService.resolve(id);
    res.status(200).json({ data: { message: 'Incident resolved successfully' } });
  } catch (err) { handleError(err, res); }
};

module.exports = { getAll, create, assign, resolve };