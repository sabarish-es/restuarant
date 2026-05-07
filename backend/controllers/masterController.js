const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Tables
exports.getTables = async (req, res) => {
  let connection = null;
  try {
    connection = await pool.getConnection();
    console.log('[v0] Fetching tables...');
    const [tables] = await connection.execute('SELECT * FROM tables ORDER BY table_number');
    console.log('[v0] Tables fetched:', tables.length);
    connection.release();
    res.json(tables);
  } catch (error) {
    console.error('[v0] Error fetching tables:', error.message, error.code);
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('[v0] Error releasing connection:', releaseError.message);
      }
    }
    res.status(500).json({ 
      message: 'Failed to fetch tables', 
      error: error.message 
    });
  }
};

exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const connection = await pool.getConnection();
    await connection.execute('UPDATE tables SET status = ? WHERE id = ?', [status, id]);
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
  let connection = null;
  try {
    const { name, email, phone, address, city, state, zip_code } = req.body;
    
    console.log('[v0] Creating customer with data:', { name, email, phone });
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Customer name is required' });
    }
    
    connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO customers (name, email, phone, address, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email || null, phone || null, address || null, city || null, state || null, zip_code || null]
    );
    connection.release();
    
    console.log('[v0] Customer created with ID:', result.insertId);
    res.status(201).json({ id: result.insertId, name, email, phone });
  } catch (error) {
    console.error('[v0] Error creating customer:', error.message, error.code);
    
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('[v0] Error releasing connection:', releaseError.message);
      }
    }
    
    let message = 'Failed to create customer';
    
    if (error.message && error.message.includes('Connection')) {
      message = 'Database connection failed. Ensure backend server is running.';
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      message = 'Invalid reference in customer data';
    } else if (error.message) {
      message = error.message;
    }
    
    res.status(500).json({ message });
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
  let connection = null;
  try {
    connection = await pool.getConnection();
    const [employees] = await connection.execute(`
      SELECT e.*, u.username, u.email, u.role 
      FROM employees e 
      JOIN users u ON e.user_id = u.id 
      ORDER BY e.first_name
    `);
    connection.release();
    res.json(employees);
  } catch (error) {
    console.error('[v0] Error fetching employees:', error.message);
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('[v0] Error releasing connection:', releaseError.message);
      }
    }
    res.status(500).json({ message: error.message || 'Failed to fetch employees' });
  }
};

exports.createEmployee = async (req, res) => {
  let connection = null;
  try {
    const { username, email, password, first_name, last_name, role, phone, hire_date } = req.body;
    
    console.log('[v0] Creating employee with data:', { username, email, first_name, last_name, role, phone });
    
    // Validate required fields
    if (!username || !email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: 'Missing required fields: username, email, password, first_name, last_name' });
    }
    
    connection = await pool.getConnection();

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'cashier', phone || null]
    );
    console.log('[v0] User created with ID:', userResult.insertId);

    // Create employee
    const [empResult] = await connection.execute(
      'INSERT INTO employees (user_id, first_name, last_name, role, phone, hire_date) VALUES (?, ?, ?, ?, ?, ?)',
      [userResult.insertId, first_name, last_name, role || 'cashier', phone || null, hire_date || new Date().toISOString().split('T')[0]]
    );
    console.log('[v0] Employee created with ID:', empResult.insertId);

    connection.release();
    res.status(201).json({ id: empResult.insertId, username, email, first_name, last_name });
  } catch (error) {
    console.error('[v0] Error creating employee:', error.message, error.code);
    
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('[v0] Error releasing connection:', releaseError.message);
      }
    }
    
    let message = 'Failed to create employee';
    
    if (error.message && error.message.includes('Duplicate')) {
      message = 'Username or email already exists';
    } else if (error.code === 'ER_DUP_ENTRY') {
      message = 'Username or email already exists';
    } else if (error.message) {
      message = error.message;
    }
    
    res.status(500).json({ message });
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
       LEFT JOIN tables rt ON o.table_id = rt.id 
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

// Employee Activities & Statistics
exports.getEmployeeActivities = async (req, res) => {
  let connection = null;
  try {
    connection = await pool.getConnection();

    const [employees] = await connection.execute(`
      SELECT u.id, u.username, u.email, u.role, 
             COALESCE(e.first_name, 'N/A') as first_name, 
             COALESCE(e.last_name, 'N/A') as last_name, 
             COALESCE(e.hire_date, NOW()) as hire_date,
             COALESCE(COUNT(o.id), 0) as total_orders,
             COALESCE(SUM(o.total), 0) as total_sales,
             COALESCE(COUNT(CASE WHEN DATE(o.created_at) = CURDATE() THEN 1 END), 0) as today_orders,
             COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURDATE() THEN o.total ELSE 0 END), 0) as today_sales,
             MAX(o.created_at) as last_order_at
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      LEFT JOIN orders o ON u.id = o.cashier_id
      WHERE u.role IN ('cashier', 'kitchen', 'admin')
      GROUP BY u.id, u.username, u.email, u.role, e.first_name, e.last_name, e.hire_date
      ORDER BY COALESCE(e.first_name, u.username)
    `);

    connection.release();
    res.json(employees || []);
  } catch (error) {
    console.error('[v0] Employee activities error:', error.message, error.stack);
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('[v0] Error releasing connection:', releaseError.message);
      }
    }
    res.status(500).json({ message: error.message || 'Failed to fetch employee activities' });
  }
};

exports.getEmployeeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Get employee info
    const [employees] = await connection.execute(`
      SELECT u.id, u.username, u.email, u.role, e.first_name, e.last_name, e.phone, e.hire_date
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.id = ?
    `, [id]);

    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get employee's orders
    const [orders] = await connection.execute(`
      SELECT o.id, o.order_number, o.total, o.status, o.created_at, o.completed_at, c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.cashier_id = ?
      ORDER BY o.created_at DESC
      LIMIT 50
    `, [id]);

    connection.release();

    res.json({
      employee: employees[0],
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
