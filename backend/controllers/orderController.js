const pool = require('../config/db');

exports.createOrder = async (req, res) => {
  try {
    const { tableId, customerId, items, orderType, notes } = req.body;
    const cashierId = req.user.id;

    const connection = await pool.getConnection();

    // Generate order number
    const orderNumber = 'ORD' + Date.now();

    // Get settings for tax
    const [settings] = await connection.execute('SELECT tax_percentage FROM settings LIMIT 1');
    const taxPercentage = settings[0]?.tax_percentage || 5;

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.price;
    }

    const tax = (subtotal * taxPercentage) / 100;
    const total = subtotal + tax;

    // Insert order
    const [orderResult] = await connection.execute(
      `INSERT INTO orders 
       (order_number, table_id, customer_id, cashier_id, subtotal, tax, total, status, order_type, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, tableId || null, customerId || null, cashierId, subtotal, tax, total, 'pending', orderType || 'dine-in', notes || null]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      await connection.execute(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
        [orderId, item.menuItemId, item.quantity, item.price]
      );
    }

    // Update table status if dine-in
    if (tableId && orderType !== 'takeaway') {
      await connection.execute(
        'UPDATE restaurant_tables SET status = ? WHERE id = ?',
        ['occupied', tableId]
      );
    }

    connection.release();

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: orderId,
        orderNumber,
        subtotal,
        tax,
        total,
        status: 'pending',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const connection = await pool.getConnection();

    let query = `
      SELECT o.*, 
             c.name as customer_name,
             rt.table_number,
             u.username as cashier_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      LEFT JOIN users u ON o.cashier_id = u.id
    `;

    const params = [];

    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await connection.execute(query, params);
    connection.release();

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [orders] = await connection.execute(
      `SELECT o.*, c.name as customer_name, rt.table_number 
       FROM orders o 
       LEFT JOIN customers c ON o.customer_id = c.id 
       LEFT JOIN restaurant_tables rt ON o.table_id = rt.id 
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Order not found' });
    }

    const [items] = await connection.execute(
      `SELECT oi.*, m.name as menu_item_name 
       FROM order_items oi 
       JOIN menu_items m ON oi.menu_item_id = m.id 
       WHERE oi.order_id = ?`,
      [id]
    );

    connection.release();

    res.json({
      order: orders[0],
      items,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const connection = await pool.getConnection();

    const completedAt = status === 'completed' ? new Date() : null;

    await connection.execute(
      'UPDATE orders SET status = ?, completed_at = ? WHERE id = ?',
      [status, completedAt, id]
    );

    // If order is completed, update table status to available
    if (status === 'completed') {
      const [order] = await connection.execute(
        'SELECT table_id FROM orders WHERE id = ?',
        [id]
      );

      if (order[0]?.table_id) {
        await connection.execute(
          'UPDATE restaurant_tables SET status = ? WHERE id = ?',
          ['available', order[0].table_id]
        );
      }
    }

    connection.release();

    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getKitchenOrders = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [orders] = await connection.execute(`
      SELECT o.*, 
             rt.table_number,
             u.username as cashier_name
      FROM orders o
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      LEFT JOIN users u ON o.cashier_id = u.id
      WHERE o.status IN ('pending', 'preparing', 'ready')
      ORDER BY o.created_at ASC
    `);

    // Get items for each order
    const ordersWithItems = [];
    for (const order of orders) {
      const [items] = await connection.execute(
        `SELECT oi.*, m.name as menu_item_name 
         FROM order_items oi 
         JOIN menu_items m ON oi.menu_item_id = m.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      ordersWithItems.push({ ...order, items });
    }

    connection.release();

    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
