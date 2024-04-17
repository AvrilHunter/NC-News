const { Pool } = require('pg');
const ENV = process.env.NODE_ENV || 'development';

require('dotenv').config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
<<<<<<< HEAD
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

const config = {};
if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 2;
=======
  throw new Error('PGDATABASE or DATABASE_URL not set');
}

const config = {}
if (ENV === 'production') {
  config.connectionString = process.env.DATABASE_URL
  config.max=2
>>>>>>> d4556149e8543c16f954d917d2044b69ccbce7e3
}

module.exports = new Pool(config);
