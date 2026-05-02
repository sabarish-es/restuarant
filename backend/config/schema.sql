-- Create Database
CREATE DATABASE IF NOT EXISTS restaurant_management;
USE restaurant_management;

-- Users Table (Admin, Cashier, Kitchen)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'cashier', 'kitchen') NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category_id INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tables Table
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  table_number INT UNIQUE NOT NULL,
  seats INT NOT NULL,
  status ENUM('available', 'occupied', 'reserved', 'out_of_order') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  address VARCHAR(255),
  city VARCHAR(50),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  table_id INT,
  customer_id INT,
  cashier_id INT,
  kitchen_staff_id INT,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
  order_type ENUM('dine-in', 'takeaway') DEFAULT 'dine-in',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (cashier_id) REFERENCES users(id),
  FOREIGN KEY (kitchen_staff_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  special_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(50),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  currency VARCHAR(10) DEFAULT 'INR',
  timezone VARCHAR(50),
  tax_percentage DECIMAL(5, 2) DEFAULT 5.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO users (username, email, password, role, phone) VALUES
('admin', 'admin@foodiehub.com', '$2a$10$yJOvfWlHjxdmJXFLjXfFAOq9Rh7WD.xKzWp5KaGPLq7XQqGpkMiQ.', 'admin', '9876543210');

INSERT INTO categories (name, description) VALUES
('Starters', 'Appetizers and starters'),
('Main Course', 'Main courses and rice dishes'),
('Beverages', 'Drinks and beverages'),
('Desserts', 'Sweet dishes and desserts'),
('Pizza', 'Pizza varieties'),
('Combo', 'Combo meal offers'),
('Sides', 'Side dishes');

INSERT INTO restaurant_tables (table_number, seats) VALUES
(1, 2), (2, 4), (3, 2), (4, 4),
(5, 6), (6, 4), (7, 2), (8, 4),
(9, 4), (10, 2), (11, 6), (12, 4);

INSERT INTO settings (restaurant_name, email, phone, address, city, state, zip_code, currency, timezone, tax_percentage) VALUES
('FoodieHub Restaurant', 'admin@foodiehub.com', '+91-98765-43210', '123, Food Street', 'Delhi', 'Delhi', '110001', 'INR', 'Asia/Kolkata', 5.00);
