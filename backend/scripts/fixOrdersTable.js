const mysql = require('mysql2/promise');

async function fixOrdersTable() {
  let connection;
  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'restaurant_management',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    console.log('Attempting to fix orders table schema...');
    connection = await mysql.createConnection(dbConfig);

    // Check if user_id column is NOT NULL
    const [columns] = await connection.execute(
      "SELECT * FROM information_schema.COLUMNS WHERE TABLE_NAME='orders' AND COLUMN_NAME='user_id' AND TABLE_SCHEMA=?",[dbConfig.database]
    );

    if (columns.length > 0 && columns[0].IS_NULLABLE === 'NO') {
      console.log('Modifying user_id column to be nullable...');
      await connection.execute('ALTER TABLE orders MODIFY COLUMN user_id INT NULL');
      console.log('✅ Successfully modified user_id column to be nullable');
    } else {
      console.log('✅ user_id column is already nullable or does not exist yet');
    }

    await connection.end();
  } catch (error) {
    console.error('Error fixing orders table:', error.message);
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

fixOrdersTable();
