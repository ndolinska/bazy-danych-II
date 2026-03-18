const heroService = require('../services/heroService');

const HTTP_STATUS = {
  NOT_FOUND:        404,
  CONFLICT:         409,
  VALIDATION_ERROR: 422,
  FORBIDDEN:        403,
};

const handleError = (err, res) => {
  const status = HTTP_STATUS[err.code] || 500;
  const body   = status === 500 ? { error: 'Internal Server Error' } : { error: err.message };
  if (status === 500) console.error(err);   
  res.status(status).json(body);
};

const getAll = async (req, res) => {
  try {
    // Przekazujemy wszystkie parametry z URL (query string) do serwisu
    const result = await heroService.findAll(req.query);
    // Zwracamy odpowiedź w idealnym formacie wymaganym przez zadanie
    res.json(result);
  } catch (err) { handleError(err, res); }
};

const getOne = async (req, res) => {
  try {
    const hero = await heroService.findOne(req.params.id);
    res.json({ data: hero });
  } catch (err) { handleError(err, res); }
};

const create = async (req, res) => {
  try {
    const { name, power, status } = req.body || {};
    if (!name || !power) return res.status(400).json({ error: 'name and power are required' });
    
    const hero = await heroService.create({ name, power, status });
    res.status(201)
       .location(`/api/v1/heroes/${hero.id}`)
       .json({ data: hero });
  } catch (err) { handleError(err, res); }
};

const update = async (req, res) => {
  try {
    const hero = await heroService.update(req.params.id, req.body);
    res.json({ data: hero });
  } catch (err) { handleError(err, res); }
};

module.exports = { getAll, getOne, create, update };