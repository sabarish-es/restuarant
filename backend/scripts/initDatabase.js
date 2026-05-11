const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function initDatabase() {
  let connection;

  try {
    console.log('\n========================================');
    console.log('  Restaurant - Database Initialization');
    console.log('========================================\n');

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    };

    console.log('Step 1: Connecting to MySQL server...');
    console.log(`Host: ${dbConfig.host}\n`);

    connection = await mysql.createConnection(dbConfig);

    console.log('✅ Connected to MySQL server\n');

    console.log('Step 2: Preparing database...');

    await connection.query(
      'DROP DATABASE IF EXISTS restaurant_management'
    );

    console.log('✅ Cleaned up existing database\n');

    console.log('Step 3: Reading schema file...');

    const sqlPath = path.join(__dirname, '../database.sql');

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('✅ Schema file loaded\n');

    console.log('Step 4: Creating database and tables...\n');

    await connection.query(sqlContent);

    console.log('✅ Database schema executed successfully\n');

    await connection.end();

    console.log('========================================');
    console.log('✅ Database initialized successfully!');
    console.log('========================================\n');

    console.log('Database: restaurant_management');
    console.log('Tables created successfully');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('========================================\n');

    process.exit(0);

  } catch (error) {

    console.log('\n❌ Error initializing database:');
    console.log(error.message);

    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }

    process.exit(1);
  }
}

initDatabase();
