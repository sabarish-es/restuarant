const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Tables
exports.getTables = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [tables] = await connection.execute('SELECT * FROM restaurant_tables ORDER BY table_number');
    connection.release();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const connection = await pool.getConnection();
    await connection.execute('UPDATE restaurant_tables SET status = ? WHERE id = ?', [status, id]);
    connection.release();
    res.json({ message: 'Table status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Customers
exports.getCustomers = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [customers] = await connection.execute('SELECT * FROM customers ORDER BY name');
    connection.release();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, city, state, zip_code } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO customers (name, email, phone, address, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, address, city, state, zip_code]
    );
    connection.release();
    res.status(201).json({ id: result.insertId, name, email, phone });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM customers WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Employees
exports.getEmployees = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [employees] = await connection.execute(`
      SELECT e.*, u.username, u.email, u.role 
      FROM employees e 
      JOIN users u ON e.user_id = u.id 
      ORDER BY e.first_name
    `);
    connection.release();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role, phone, hire_date } = req.body;
    const connection = await pool.getConnection();

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'cashier', phone]
    );

    // Create employee
    const [empResult] = await connection.execute(
      'INSERT INTO employees (user_id, first_name, last_name, role, phone, hire_date) VALUES (?, ?, ?, ?, ?, ?)',
      [userResult.insertId, first_name, last_name, role || 'cashier', phone, hire_date]
    );

    connection.release();
    res.status(201).json({ id: empResult.insertId, username, email, first_name, last_name });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    // Get user_id from employee first
    const [employees] = await connection.execute('SELECT user_id FROM employees WHERE id = ?', [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Employee not found' });
    }

    const userId = employees[0].user_id;

    // Delete employee
    await connection.execute('DELETE FROM employees WHERE id = ?', [id]);
    
    // Delete associated user
    await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    connection.release();
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Settings
exports.getSettings = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [settings] = await connection.execute('SELECT * FROM settings LIMIT 1');
    connection.release();
    res.json(settings[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { restaurant_name, email, phone, address, city, state, zip_code, currency, timezone, tax_percentage } = req.body;
    const connection = await pool.getConnection();

    const [existing] = await connection.execute('SELECT id FROM settings');

    if (existing.length === 0) {
      await connection.execute(
        `INSERT INTO settings (restaurant_name, email, phone, address, city, state, zip_code, currency, timezone, tax_percentage) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [restaurant_name, email, phone, address, city, state, zip_code, currency, timezone, tax_percentage]
      );
    } else {
      await connection.execute(
        `UPDATE settings SET restaurant_name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ?, currency = ?, timezone = ?, tax_percentage = ? WHERE id = 1`,
        [restaurant_name, email, phone, address, city, state, zip_code, currency, timezone, tax_percentage]
      );
    }

    connection.release();
    res.json({ message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reports & Dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Total Orders Today
    const [totalOrders] = await connection.execute(
      `SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()`
    );

    // Total Sales Today
    const [totalSales] = await connection.execute(
      `SELECT SUM(total) as total FROM orders WHERE DATE(created_at) = CURDATE() AND status IN ('completed', 'preparing')`
    );

    // Total Customers
    const [totalCustomers] = await connection.execute(
      `SELECT COUNT(*) as count FROM customers`
    );

    // Pending Orders
    const [pendingOrders] = await connection.execute(
      `SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'preparing')`
    );

    // Recent Orders
    const [recentOrders] = await connection.execute(
      `SELECT o.*, c.name as customer_name, rt.table_number 
       FROM orders o 
       LEFT JOIN customers c ON o.customer_id = c.id 
       LEFT JOIN restaurant_tables rt ON o.table_id = rt.id 
       WHERE DATE(o.created_at) = CURDATE()
       ORDER BY o.created_at DESC LIMIT 10`
    );

    // Sales Trend (Last 7 days)
    const [salesTrend] = await connection.execute(
      `SELECT DATE(created_at) as date, SUM(total) as total 
       FROM orders 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
       AND status IN ('completed', 'preparing')
       GROUP BY DATE(created_at)
       ORDER BY date`
    );

    // Top Selling Items
    const [topItems] = await connection.execute(
      `SELECT m.name, SUM(oi.quantity) as total_qty, m.image_url
       FROM order_items oi
       JOIN menu_items m ON oi.menu_item_id = m.id
       JOIN orders o ON oi.order_id = o.id
       WHERE DATE(o.created_at) = CURDATE()
       GROUP BY m.id
       ORDER BY total_qty DESC LIMIT 5`
    );

    connection.release();

    res.json({
      totalOrders: totalOrders[0].count,
      totalSales: totalSales[0].total || 0,
      totalCustomers: totalCustomers[0].count,
      pendingOrders: pendingOrders[0].count,
      recentOrders,
      salesTrend,
      topItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const connection = await pool.getConnection();

    let dateFilter = 'WHERE DATE(o.created_at) = CURDATE()';
    if (startDate && endDate) {
      dateFilter = `WHERE DATE(o.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    }

    const [totalSales] = await connection.execute(
      `SELECT SUM(total) as total FROM orders o ${dateFilter} AND status IN ('completed', 'preparing')`
    );

    const [salesByCategory] = await connection.execute(
      `SELECT c.name, SUM(oi.quantity * oi.unit_price) as total
       FROM order_items oi
       JOIN menu_items m ON oi.menu_item_id = m.id
       JOIN categories c ON m.category_id = c.id
       JOIN orders o ON oi.order_id = o.id
       ${dateFilter}
       GROUP BY c.id
       ORDER BY total DESC`
    );

    connection.release();

    res.json({
      totalSales: totalSales[0].total || 0,
      salesByCategory,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
