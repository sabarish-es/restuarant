const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function addPhoneColumn() {
  let connection;
  try {
    console.log('\n========================================');
    console.log('  Adding phone column to employees');
    console.log('========================================\n');

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'foodhub',
    };

    connection = await mysql.createConnection(dbConfig);

    // Check if column already exists
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'employees' AND COLUMN_NAME = 'phone' AND TABLE_SCHEMA = ?`,
      [dbConfig.database]
    );

    if (columns.length > 0) {
      console.log('✅ Phone column already exists in employees table');
      await connection.end();
      process.exit(0);
    }

    // Add phone column if it doesn't exist
    console.log('Adding phone column to employees table...');
    await connection.execute(
      'ALTER TABLE employees ADD COLUMN phone VARCHAR(20) AFTER last_name'
    );

    console.log('✅ Phone column added successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.log('\n❌ Error:');
    console.log(error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

addPhoneColumn();
