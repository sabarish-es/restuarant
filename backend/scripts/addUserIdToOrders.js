const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function migrateDatabase() {
  let connection;
  try {
    console.log('\n========================================');
    console.log('  Adding user_id to orders table');
    console.log('========================================\n');

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'restaurant_management',
      port: process.env.DB_PORT || 3306,
    };

    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    // Check if user_id column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'user_id'
    `);

    if (columns.length > 0) {
      console.log('ℹ user_id column already exists in orders table\n');
    } else {
      console.log('Adding user_id column to orders table...');
      
      // Add the user_id column after customer_id
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN user_id INT NOT NULL AFTER customer_id
      `);
      
      console.log('✓ user_id column added\n');
      
      // Add the foreign key constraint
      console.log('Adding foreign key constraint...');
      try {
        await connection.execute(`
          ALTER TABLE orders 
          ADD CONSTRAINT fk_orders_user_id 
          FOREIGN KEY (user_id) REFERENCES users(id)
        `);
        console.log('✓ Foreign key constraint added\n');
      } catch (fkError) {
        if (fkError.code === 'ER_DUP_KEYNAME') {
          console.log('ℹ Foreign key constraint already exists\n');
        } else {
          throw fkError;
        }
      }
    }

    await connection.end();

    console.log('========================================');
    console.log('✅ Migration completed successfully!');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.log('\n❌ Error during migration:');
    console.log(error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

migrateDatabase();
