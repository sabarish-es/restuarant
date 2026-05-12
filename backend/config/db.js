require('dotenv').config();

let pool;

// Check if using PostgreSQL (Neon) or MySQL
if (process.env.DATABASE_URL) {
  // Use PostgreSQL with Neon
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  console.log('[v0] Using PostgreSQL (Neon) database');
} else {
  // Fallback to MySQL for local development
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'sabarish0227E',
    database: process.env.DB_NAME || 'restaurant_management',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  console.log('[v0] Using MySQL database');
}

module.exports = pool;
