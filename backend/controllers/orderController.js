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

    // Validate and fetch menu prices if missing
    const itemsWithPrices = [];
    for (const item of items) {
      if (!item.menuItemId || !item.quantity) {
        return res.status(400).json({ message: 'Invalid item data. menuItemId and quantity are required.' });
      }
      
      let itemPrice = item.price;
      if (!itemPrice) {
        // Fetch price from menu if not provided
        const [menuItem] = await connection.execute('SELECT price FROM menu_items WHERE id = ?', [item.menuItemId]);
        if (!menuItem || !menuItem[0]) {
          return res.status(400).json({ message: `Menu item ${item.menuItemId} not found.` });
        }
        itemPrice = menuItem[0].price;
      }
      
      itemsWithPrices.push({ ...item, price: itemPrice });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of itemsWithPrices) {
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
    for (const item of itemsWithPrices) {
      await connection.execute(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
        [orderId, item.menuItemId, item.quantity, item.price]
      );
    }

    // Update table status if dine-in
    if (tableId && orderType !== 'takeaway') {
      await connection.execute(
        'UPDATE tables SET status = ? WHERE id = ?',
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
      LEFT JOIN tables rt ON o.table_id = rt.id
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
       LEFT JOIN tables rt ON o.table_id = rt.id 
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
          'UPDATE tables SET status = ? WHERE id = ?',
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
      LEFT JOIN tables rt ON o.table_id = rt.id
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

exports.printBill = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [orders] = await connection.execute(
      `SELECT o.*, c.name as customer_name, c.phone as customer_phone, rt.table_number 
       FROM orders o 
       LEFT JOIN customers c ON o.customer_id = c.id 
       LEFT JOIN tables rt ON o.table_id = rt.id 
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

    const order = orders[0];
    
    // Generate bill HTML
    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bill #${order.orderNumber}</title>
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 10px; }
          .bill-container { max-width: 350px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .header h1 { font-size: 18px; margin-bottom: 5px; }
          .header p { font-size: 12px; color: #666; }
          .order-info { font-size: 12px; margin: 10px 0; }
          .order-info p { margin: 3px 0; }
          .items { margin: 15px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
          .item-name { flex: 1; }
          .item-qty { width: 40px; text-align: center; }
          .item-price { width: 50px; text-align: right; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .totals { margin: 10px 0; font-size: 12px; }
          .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
          .total-line.grand { border-top: 2px solid #000; padding-top: 5px; font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #666; }
          .thank-you { text-align: center; margin-top: 15px; font-weight: bold; }
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="bill-container">
          <div class="header">
            <h1>FoodieHub</h1>
            <p>Restaurant Bill</p>
          </div>
          
          <div class="order-info">
            <p><strong>Order #:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
            <p><strong>Time:</strong> ${new Date(order.created_at).toLocaleTimeString('en-IN')}</p>
            ${order.table_number ? `<p><strong>Table:</strong> ${order.table_number}</p>` : ''}
            ${order.customer_name ? `<p><strong>Customer:</strong> ${order.customer_name}</p>` : ''}
          </div>
          
          <div class="divider"></div>
          
          <div class="items">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; font-size: 12px; border-bottom: 1px solid #000; padding-bottom: 5px;">
              <div style="flex: 1;">Item</div>
              <div style="width: 40px; text-align: center;">Qty</div>
              <div style="width: 50px; text-align: right;">Price</div>
            </div>
            ${items.map(item => `
              <div class="item">
                <div class="item-name">${item.menu_item_name}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">₹${(item.unit_price * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="divider"></div>
          
          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>₹${order.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-line">
              <span>Tax (${((order.tax / order.subtotal) * 100).toFixed(1)}%):</span>
              <span>₹${order.tax.toFixed(2)}</span>
            </div>
            <div class="total-line grand">
              <span>Total Amount:</span>
              <span>₹${order.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="thank-you">Thank You!</div>
          <div class="footer">
            <p>Please come again</p>
          </div>
        </div>
      </body>
      </html>
    `;

    res.json({ 
      billHTML,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
