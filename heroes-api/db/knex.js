const environment = process.env.NODE_ENV || 'development'; // Pobieramy tryb pracy (domyślnie dev)
const config = require('../knexfile.js')[environment]; // Wyciągamy odpowiedni blok z knexfile

// Inicjalizujemy instancję Knexa na podstawie wybranej konfiguracji
const knex = require('knex')(config);

module.exports = knex;