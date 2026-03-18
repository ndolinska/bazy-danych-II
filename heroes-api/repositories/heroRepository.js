const knex = require('../db/knex');

const findAll = async ({ power, status, sortBy = 'name', sortDir = 'asc', page = 1, pageSize = 10 }) => {
  // Inicjacja bazowego zapytania (Query Builder)
  const query = knex('heroes');

  // Kompozycyjne dodawanie filtrów (tylko gdy są przekazane)
  if (power) query.where('power', power);
  if (status) query.where('status', status);

  // Klonowanie zapytania, aby policzyć wszystkie pasujące rekordy (niezbędne do paginacji)
  const countQuery = query.clone().count('* as total').first();

  // Nałożenie sortowania i paginacji na oryginalne zapytanie
  query.orderBy(sortBy, sortDir)
       .limit(pageSize)
       .offset((page - 1) * pageSize);

  // Równoległe wykonanie obu zapytań (optymalizacja wydajności)
  const [data, countResult] = await Promise.all([query, countQuery]);
  
  // countResult.total z Postgresa wraca jako string (np. "12"), parsowanie do int:
  const total = parseInt(countResult.total, 10);

  return { data, total };
};

// trx - przyda nam się w incydentach
const findOne = async (id, trx = knex) => {
  return await trx('heroes').where({ id }).first();
};

const create = async (heroData) => {
  // .returning('*') zwraca cały nowo wstawiony rekord
  const [hero] = await knex('heroes').insert(heroData).returning('*');
  return hero;
};

const update = async (id, updateData) => {
  const [hero] = await knex('heroes')
    .where({ id })
    .update({ ...updateData, updated_at: knex.fn.now() })
    .returning('*');
  return hero;
};

const updateStatusStrict = async (id, currentStatus, newStatus, incrementMissions, trx) => {
  const updateData = { status: newStatus, updated_at: trx.fn.now() };
  if (incrementMissions) {
    updateData.missions_count = trx.raw('missions_count + 1'); // Zwiększamy licznik misji!
  }

  const updatedRows = await trx('heroes')
    .where({ id, status: currentStatus })
    .update(updateData);
    
  if (updatedRows === 0) throw new Error('CONCURRENCY_HERO');
};

module.exports = { findAll, findOne, create, update, updateStatusStrict };