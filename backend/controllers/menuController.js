const pool = require('../config/db');

// Category Operations
exports.getCategories = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [categories] = await connection.execute('SELECT * FROM categories ORDER BY name');
    connection.release();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    connection.release();

    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ?',
      [name, description, status, id]
    );
    connection.release();

    res.json({ message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM categories WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Menu Items Operations
exports.getMenuItems = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const connection = await pool.getConnection();

    let query = `
      SELECT m.*, c.name as category_name 
      FROM menu_items m 
      JOIN categories c ON m.category_id = c.id 
      WHERE m.status = 'active'
    `;
    let params = [];

    if (categoryId) {
      query += ' AND m.category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY c.name, m.name';
    const [items] = await connection.execute(query, params);
    connection.release();

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { name, categoryId, price, description, imageUrl } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO menu_items (name, category_id, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, categoryId, price, description || null, imageUrl || null]
    );
    connection.release();

    res.status(201).json({ id: result.insertId, name, categoryId, price });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, price, description, imageUrl, status } = req.body;

    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE menu_items SET name = ?, category_id = ?, price = ?, description = ?, image_url = ?, status = ? WHERE id = ?',
      [name, categoryId, price, description, imageUrl, status, id]
    );
    connection.release();

    res.json({ message: 'Menu item updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM menu_items WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
