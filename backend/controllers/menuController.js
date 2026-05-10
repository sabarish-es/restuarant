const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../public/uploads/menu-items');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Category Operations
exports.getCategories = async (req, res) => {
  let connection = null;
  try {
    connection = await pool.getConnection();
    console.log('[v0] Fetching categories...');
    const [categories] = await connection.execute('SELECT * FROM categories ORDER BY name');
    connection.release();
    console.log('[v0] Fetched', categories.length, 'categories');
    res.json(categories);
  } catch (error) {
    console.error('[v0] Error fetching categories:', error.message, error.code);
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('[v0] Error releasing connection:', releaseError.message);
      }
    }
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
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
  let connection = null;
  try {
    const { categoryId } = req.query;
    connection = await pool.getConnection();

    console.log('[v0] Fetching menu items, categoryId:', categoryId);

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

    console.log('[v0] Fetched', items.length, 'menu items');
    res.json(items);
  } catch (error) {
    console.error('[v0] Error fetching menu items:', error.message, error.code);
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('[v0] Error releasing connection:', releaseError.message);
      }
    }
    res.status(500).json({ message: 'Failed to fetch menu items', error: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  let connection = null;
  try {
    const { name, categoryId, price, description, imageUrl } = req.body;

    connection = await pool.getConnection();
    
    let savedImageUrl = null;
    
    // Handle base64 image data
    if (imageUrl && imageUrl.startsWith('data:image')) {
      try {
        const matches = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const imageType = matches[1];
          const imageData = matches[2];
          const buffer = Buffer.from(imageData, 'base64');
          
          // Generate unique filename
          const timestamp = Date.now();
          const filename = `menu-item-${timestamp}.${imageType}`;
          const filepath = path.join(uploadsDir, filename);
          
          // Save file to disk
          fs.writeFileSync(filepath, buffer);
          
          // Store relative path in database
          savedImageUrl = `/uploads/menu-items/${filename}`;
          console.log('[v0] Image saved to:', savedImageUrl);
        }
      } catch (imageError) {
        console.error('[v0] Error processing image:', imageError.message);
        // Continue without image if there's an error
      }
    }
    
    const [result] = await connection.execute(
      'INSERT INTO menu_items (name, category_id, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, categoryId, price, description || null, savedImageUrl]
    );
    connection.release();

    res.status(201).json({ id: result.insertId, name, categoryId, price, image_url: savedImageUrl });
  } catch (error) {
    console.error('[v0] Error creating menu item:', error.message);
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('[v0] Error releasing connection:', releaseError.message);
      }
    }
    res.status(500).json({ message: error.message || 'Failed to create menu item' });
  }
};

exports.updateMenuItem = async (req, res) => {
  let connection = null;
  try {
    const { id } = req.params;
    const { name, categoryId, price, description, imageUrl, status } = req.body;

    connection = await pool.getConnection();
    
    let savedImageUrl = imageUrl;
    
    // Handle base64 image data for updates
    if (imageUrl && imageUrl.startsWith('data:image')) {
      try {
        // Get current item to delete old image if exists
        const [currentItem] = await connection.execute(
          'SELECT image_url FROM menu_items WHERE id = ?',
          [id]
        );
        
        if (currentItem.length > 0 && currentItem[0].image_url && currentItem[0].image_url.startsWith('/uploads')) {
          const oldImagePath = path.join(__dirname, '../public', currentItem[0].image_url);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('[v0] Deleted old image:', oldImagePath);
          }
        }
        
        // Save new image
        const matches = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const imageType = matches[1];
          const imageData = matches[2];
          const buffer = Buffer.from(imageData, 'base64');
          
          const timestamp = Date.now();
          const filename = `menu-item-${timestamp}.${imageType}`;
          const filepath = path.join(uploadsDir, filename);
          
          fs.writeFileSync(filepath, buffer);
          savedImageUrl = `/uploads/menu-items/${filename}`;
          console.log('[v0] Image updated to:', savedImageUrl);
        }
      } catch (imageError) {
        console.error('[v0] Error processing image update:', imageError.message);
      }
    }
    
    await connection.execute(
      'UPDATE menu_items SET name = ?, category_id = ?, price = ?, description = ?, image_url = ?, status = ? WHERE id = ?',
      [name, categoryId, price, description, savedImageUrl, status, id]
    );
    connection.release();

    res.json({ message: 'Menu item updated', image_url: savedImageUrl });
  } catch (error) {
    console.error('[v0] Error updating menu item:', error.message);
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('[v0] Error releasing connection:', releaseError.message);
      }
    }
    res.status(500).json({ message: error.message || 'Failed to update menu item' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  let connection = null;
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Menu item ID is required' });
    }
    
    connection = await pool.getConnection();
    
    // Check if menu item exists
    const [existingItem] = await connection.execute(
      'SELECT id, image_url FROM menu_items WHERE id = ?',
      [id]
    );
    
    if (!existingItem || existingItem.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // First, find all order items that reference this menu item
    const [orderItems] = await connection.execute(
      'SELECT DISTINCT order_id FROM order_items WHERE menu_item_id = ?',
      [id]
    );
    
    // Delete order items that reference this menu item
    await connection.execute(
      'DELETE FROM order_items WHERE menu_item_id = ?',
      [id]
    );
    
    console.log(`[v0] Deleted ${orderItems.length} order items for menu item ${id}`);
    
    // Then delete the menu item
    const deleteResult = await connection.execute(
      'DELETE FROM menu_items WHERE id = ?',
      [id]
    );
    
    console.log(`[v0] Menu item ${id} deleted successfully`);
    
    connection.release();
    
    if (deleteResult[0].affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to delete menu item' });
    }
    
    // Delete associated image file if it exists
    if (existingItem[0].image_url && existingItem[0].image_url.startsWith('/uploads')) {
      try {
        const imagePath = path.join(__dirname, '../public', existingItem[0].image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('[v0] Deleted menu item image:', imagePath);
        }
      } catch (imageError) {
        console.error('[v0] Error deleting image file:', imageError.message);
        // Don't fail the delete operation if image deletion fails
      }
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('[v0] Error deleting menu item:', error.message);
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('[v0] Error releasing connection:', releaseError.message);
      }
    }
    res.status(500).json({ message: error.message || 'Failed to delete menu item' });
  }
};
