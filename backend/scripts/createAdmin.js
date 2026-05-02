const readline = require('readline');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
require('dotenv').config({ path: '../.env' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function createAdmin() {
  try {
    console.log('\n========================================');
    console.log('  FoodHub - Create Admin User');
    console.log('========================================\n');

    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');
    const phone = await question('Enter phone (optional): ');

    if (!username || !email || !password) {
      console.log('\n❌ Error: Username, email, and password are required!');
      rl.close();
      process.exit(1);
    }

    const connection = await pool.getConnection();

    // Check if user already exists
    const [existing] = await connection.execute(
      'SELECT id, username FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      console.log(`\n❌ Error: User "${username}" already exists!`);
      connection.release();
      rl.close();
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin user
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, role, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [username, email, hashedPassword, 'admin', phone || null, 'active']
    );

    connection.release();

    console.log('\n========================================');
    console.log('✅ Admin user created successfully!');
    console.log('========================================');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Role: admin`);
    console.log(`User ID: ${result.insertId}`);
    console.log('========================================\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.log('\n❌ Error creating admin user:');
    console.log(error.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
