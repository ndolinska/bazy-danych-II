require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 1,
      max: 10, 
      idleTimeoutMillis: 30000 
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds/development',
    },
  },

  test: {
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
    pool: {
      min: 1,
      max: 5, // W testach nie potrzebujemy aż tylu połączeń
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds/test',
    },
  },
};
