const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not configured. Database-backed features will be unavailable until it is set.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => console.error('Unexpected PostgreSQL pool error:', err.message));

async function query(text, params) {
  if (!process.env.DATABASE_URL) throw new Error('Database is not configured. Set DATABASE_URL in your .env file.');
  return pool.query(text, params);
}

module.exports = { pool, query };