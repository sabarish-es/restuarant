const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function initDatabase() {
  let connection;
  try {
    console.log('\n========================================');
    console.log('  Restaurant - Database Initialization');
    console.log('========================================\n');

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'sabarish0227E',
      port: process.env.DB_PORT || 3306,
    };

    console.log('Step 1: Connecting to MySQL server...');
    console.log(`Host: ${dbConfig.host}\n`);

    // Connect without specifying database first
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server\n');

    // Drop existing database if it exists
    console.log('Step 2: Preparing database...');
    await connection.execute('DROP DATABASE IF EXISTS restaurant_management');
    console.log('✅ Cleaned up existing database\n');

    // Read the full schema from database.sql
    const sqlPath = path.join(__dirname, '../database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Step 3: Creating new database and tables...');
    
    // Split statements and execute them
    const statements = sqlContent
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    let tableCount = 0;
    for (const statement of statements) {
      try {
        await connection.execute(statement);
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableName = statement.match(/`?(\w+)`?\s*\(/)?.[1] || 'Table';
          console.log(`  ✓ ${tableName}`);
          tableCount++;
        } else if (statement.toUpperCase().includes('INSERT')) {
          console.log(`  ✓ Data inserted`);
        }
      } catch (error) {
        // Skip warnings but throw real errors
        if (error.code !== 'ER_TABLE_EXISTS_ERROR' && error.code !== 'ER_DUP_ENTRY') {
          console.error(`  ✗ Error executing statement:`, error.message);
          throw error;
        }
      }
    }

    await connection.end();

    console.log('\n========================================');
    console.log('✅ Database initialized successfully!');
    console.log(`   Created ${tableCount} tables with sample data`);
    console.log('========================================\n');
    console.log('Configuration:');
    console.log('  Database: restaurant_management');
    console.log('  Tables: users, categories, menu_items, tables, customers, orders, order_items, employees, settings');
    console.log('\nNext steps:');
    console.log('  1. Update .env with your database credentials');
    console.log('  2. Run: npm run dev');
    console.log('\nDefault Admin User:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  ⚠️  CHANGE THIS IN PRODUCTION!\n');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.log('\n❌ Error initializing database:');
    console.log(`   ${error.message}\n`);
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // ignore
      }
    }
    process.exit(1);
  }
}

initDatabase();
