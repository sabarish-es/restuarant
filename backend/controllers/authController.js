const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role, phone } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    // Check if user exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, phone || null]
    );

    connection.release();

    const token = jwt.sign(
      { id: result.insertId, username, role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.insertId, username, email, role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role, phone } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, phone || null, 'active']
    );

    connection.release();

    res.status(201).json({
      message: 'User created successfully',
      user: { id: result.insertId, username, email, role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
