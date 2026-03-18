exports.up = async function(knex) {
  // Dodajemy nowe kolumny do tabeli heroes
  await knex.schema.alterTable('heroes', (table) => {
    table.integer('missions_count').notNullable().defaultTo(0);
  });

  // Dodajemy nowe kolumny do tabeli incidents
  await knex.schema.alterTable('incidents', (table) => {
    table.string('district').nullable(); // nullable() oznacza, że jest opcjonalna
    table.datetime('assigned_at').nullable();
    table.datetime('resolved_at').nullable();
  });
};

// Funkcja symetryczna down() - musi precyzyjnie usunąć to, co dodała funkcja up()
exports.down = async function(knex) {
  await knex.schema.alterTable('incidents', (table) => {
    table.dropColumn('district');
    table.dropColumn('assigned_at');
    table.dropColumn('resolved_at');
  });

  await knex.schema.alterTable('heroes', (table) => {
    table.dropColumn('missions_count');
  });
};