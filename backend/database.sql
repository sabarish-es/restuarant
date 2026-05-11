-- ============================================================================
-- RESTAURANT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Clean, Complete, and Tested Schema
-- ============================================================================

-- Drop existing database if exists (for clean start)
DROP DATABASE IF EXISTS restaurant_management;

-- Create database
CREATE DATABASE restaurant_management;
USE restaurant_management;

-- ============================================================================
-- 1. USERS TABLE (Authentication & Staff Management)
-- ============================================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'cashier', 'kitchen', 'manager') NOT NULL DEFAULT 'cashier',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
);

-- ============================================================================
-- 2. CATEGORIES TABLE (Menu Categories)
-- ============================================================================
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_status (status)
);

-- ============================================================================
-- 3. MENU_ITEMS TABLE (Restaurant Menu Items)
-- ============================================================================
CREATE TABLE menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  category_id INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url LONGTEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_category_id (category_id),
  INDEX idx_status (status),
  INDEX idx_name (name)
);

-- ============================================================================
-- 4. TABLES TABLE (Restaurant Tables)
-- ============================================================================
CREATE TABLE tables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  table_number VARCHAR(10) NOT NULL UNIQUE,
  capacity INT NOT NULL DEFAULT 2,
  status ENUM('available', 'occupied', 'reserved', 'dirty') DEFAULT 'available',
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_table_number (table_number),
  INDEX idx_status (status)
);

-- ============================================================================
-- 5. CUSTOMERS TABLE (Customer Information)
-- ============================================================================
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(50),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_phone (phone),
  INDEX idx_email (email)
);

-- ============================================================================
-- 6. ORDERS TABLE (Main Orders Table)
-- ============================================================================
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  table_id INT,
  customer_id INT,
  cashier_id INT,
  order_type ENUM('dine-in', 'takeaway', 'delivery') DEFAULT 'dine-in',
  status ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_cashier_id (cashier_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_table_id (table_id),
  INDEX idx_created_at (created_at),
  INDEX idx_order_type (order_type)
);

-- ============================================================================
-- 7. ORDER_ITEMS TABLE (Individual Items in Orders)
-- ============================================================================
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_menu_item_id (menu_item_id)
);

-- ============================================================================
-- 8. SETTINGS TABLE (Application Settings & Configuration)
-- ============================================================================
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
);

-- ============================================================================
-- 9. EMPLOYEES TABLE (Staff Information - Extended User Data)
-- ============================================================================
CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  hire_date DATE NOT NULL,
  salary DECIMAL(12, 2),
  department VARCHAR(50),
  status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_hire_date (hire_date)
);

-- ============================================================================
-- 10. EMPLOYEE_ACTIVITIES TABLE (Track Employee Actions)
-- ============================================================================
CREATE TABLE employee_activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  order_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_employee_id (employee_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- 11. PAYMENT_RECORDS TABLE (Track Payments)
-- ============================================================================
CREATE TABLE payment_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'card', 'upi', 'other') DEFAULT 'cash',
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  reference_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- INITIAL DATA / SEED DATA
-- ============================================================================

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('restaurant_name', 'FoodieHub', 'Restaurant Name'),
('tax_rate', '5.0', 'Tax Rate in Percentage'),
('currency', 'INR', 'Currency Symbol'),
('business_hours', '10:00-23:00', 'Business Hours'),
('phone', '+91-XXXXXXXXXX', 'Restaurant Phone'),
('email', 'contact@foodiehub.com', 'Restaurant Email'),
('address', 'Your Address Here', 'Restaurant Address');

-- Insert sample categories
INSERT INTO categories (name, description, status) VALUES
('Appetizers', 'Starters and appetizers', 'active'),
('Main Course', 'Main dishes and curries', 'active'),
('Beverages', 'Drinks and beverages', 'active'),
('Desserts', 'Sweet dishes and desserts', 'active'),
('Breads', 'Breads and rotis', 'active');

-- Insert sample menu items
INSERT INTO menu_items (name, category_id, price, description, status) VALUES
('Samosa', 1, 50.00, 'Crispy potato samosa', 'active'),
('Paneer Tikka', 1, 150.00, 'Marinated paneer pieces', 'active'),
('Butter Chicken', 2, 350.00, 'Creamy butter chicken curry', 'active'),
('Paneer Butter Masala', 2, 300.00, 'Paneer in creamy tomato sauce', 'active'),
('Tandoori Chicken', 2, 400.00, 'Spicy tandoori chicken', 'active'),
('Biryani', 2, 450.00, 'Fragrant rice biryani', 'active'),
('Garlic Naan', 5, 50.00, 'Garlic flavored naan', 'active'),
('Butter Naan', 5, 45.00, 'Butter naan bread', 'active'),
('Lassi', 3, 80.00, 'Traditional yogurt drink', 'active'),
('Mango Shake', 3, 100.00, 'Fresh mango shake', 'active'),
('Gulab Jamun', 4, 60.00, 'Sweet gulab jamun', 'active'),
('Kheer', 4, 70.00, 'Rice pudding', 'active');

-- Insert sample tables
INSERT INTO tables (table_number, capacity, status, location) VALUES
('T1', 2, 'available', 'Window'),
('T2', 2, 'available', 'Window'),
('T3', 4, 'available', 'Corner'),
('T4', 4, 'available', 'Corner'),
('T5', 6, 'available', 'Center'),
('T6', 6, 'available', 'Center'),
('T7', 8, 'available', 'Hall'),
('T8', 8, 'available', 'Hall');

-- Insert admin user (default password: admin123 - CHANGE THIS IN PRODUCTION)
INSERT INTO users (username, email, password, phone, role, status) VALUES
('admin', 'admin@foodiehub.com', '$2a$10$YIjlrHxPBPj9N6xKHcJ8N.IqSVQE2pZdGmHZ3N6QW2Q3qK8KyLGti', '+91-9999999999', 'admin', 'active');

-- ============================================================================
-- SAMPLE QUERIES FOR REFERENCE
-- ============================================================================

-- Get all active menu items with categories
-- SELECT m.*, c.name as category_name 
-- FROM menu_items m 
-- JOIN categories c ON m.category_id = c.id 
-- WHERE m.status = 'active' 
-- ORDER BY c.name, m.name;

-- Get orders with details
-- SELECT o.*, 
--        c.name as customer_name,
--        rt.table_number,
--        u.username as cashier_name
-- FROM orders o
-- LEFT JOIN customers c ON o.customer_id = c.id
-- LEFT JOIN tables rt ON o.table_id = rt.id
-- LEFT JOIN users u ON o.cashier_id = u.id
-- ORDER BY o.created_at DESC;

-- Get kitchen pending orders
-- SELECT o.*, rt.table_number, u.username as cashier_name
-- FROM orders o
-- LEFT JOIN tables rt ON o.table_id = rt.id
-- LEFT JOIN users u ON o.cashier_id = u.id
-- WHERE o.status IN ('pending', 'preparing')
-- ORDER BY o.created_at ASC;

-- Get order details with items
-- SELECT oi.*, m.name as menu_item_name, m.price 
-- FROM order_items oi 
-- JOIN menu_items m ON oi.menu_item_id = m.id 
-- WHERE oi.order_id = ?;

-- Get daily revenue report
-- SELECT DATE(o.created_at) as order_date, 
--        COUNT(*) as total_orders,
--        SUM(o.total) as daily_revenue,
--        SUM(o.subtotal) as subtotal,
--        SUM(o.tax) as tax_collected
-- FROM orders o
-- WHERE o.status != 'cancelled'
-- GROUP BY DATE(o.created_at)
-- ORDER BY order_date DESC;

-- Get employee activities
-- SELECT ea.*, e.first_name, e.last_name, o.id as order_id
-- FROM employee_activities ea
-- JOIN employees e ON ea.employee_id = e.id
-- LEFT JOIN orders o ON ea.order_id = o.id
-- ORDER BY ea.created_at DESC;

-- ============================================================================
