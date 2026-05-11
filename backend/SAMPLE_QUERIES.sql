-- ============================================================================
-- RESTAURANT MANAGEMENT SYSTEM - SAMPLE QUERIES
-- Use these as reference for your application
-- ============================================================================

-- ============================================================================
-- MENU OPERATIONS
-- ============================================================================

-- Get all active categories
SELECT * FROM categories WHERE status = 'active' ORDER BY name;

-- Get all menu items with categories
SELECT m.*, c.name as category_name 
FROM menu_items m 
JOIN categories c ON m.category_id = c.id 
WHERE m.status = 'active' 
ORDER BY c.name, m.name;

-- Get menu items by category
SELECT m.* FROM menu_items m 
WHERE m.category_id = ? AND m.status = 'active' 
ORDER BY m.name;

-- Create new category
INSERT INTO categories (name, description) 
VALUES (?, ?);

-- Create new menu item
INSERT INTO menu_items (name, category_id, price, description, image_url) 
VALUES (?, ?, ?, ?, ?);

-- Update menu item
UPDATE menu_items 
SET name = ?, category_id = ?, price = ?, description = ?, image_url = ?, status = ? 
WHERE id = ?;

-- Delete menu item (sets to inactive)
UPDATE menu_items SET status = 'inactive' WHERE id = ?;

-- ============================================================================
-- ORDER OPERATIONS
-- ============================================================================

-- Create new order
INSERT INTO orders (table_id, customer_id, cashier_id, order_type, status, subtotal, tax, total, notes) 
VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?);

-- Add item to order
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) 
VALUES (?, ?, ?, ?);

-- Get all orders (with details)
SELECT o.*, 
       c.name as customer_name,
       rt.table_number,
       u.username as cashier_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN tables rt ON o.table_id = rt.id
LEFT JOIN users u ON o.cashier_id = u.id
ORDER BY o.created_at DESC;

-- Get order by ID with items
SELECT o.*, 
       c.name as customer_name,
       rt.table_number 
FROM orders o 
LEFT JOIN customers c ON o.customer_id = c.id 
LEFT JOIN tables rt ON o.table_id = rt.id 
WHERE o.id = ?;

-- Get order items
SELECT oi.*, m.name as menu_item_name 
FROM order_items oi 
JOIN menu_items m ON oi.menu_item_id = m.id 
WHERE oi.order_id = ?;

-- Get kitchen pending orders
SELECT o.*, 
       rt.table_number,
       u.username as cashier_name
FROM orders o
LEFT JOIN tables rt ON o.table_id = rt.id
LEFT JOIN users u ON o.cashier_id = u.id
WHERE o.status IN ('pending', 'preparing')
ORDER BY o.created_at ASC;

-- Update order status
UPDATE orders SET status = ? WHERE id = ?;

-- Get orders by status
SELECT o.*, 
       c.name as customer_name,
       rt.table_number
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN tables rt ON o.table_id = rt.id
WHERE o.status = ?
ORDER BY o.created_at DESC;

-- ============================================================================
-- TABLE OPERATIONS
-- ============================================================================

-- Get all tables
SELECT * FROM tables ORDER BY table_number;

-- Get available tables
SELECT * FROM tables WHERE status = 'available' ORDER BY table_number;

-- Update table status
UPDATE tables SET status = ? WHERE id = ?;

-- Get table details
SELECT * FROM tables WHERE id = ?;

-- ============================================================================
-- CUSTOMER OPERATIONS
-- ============================================================================

-- Get all customers
SELECT * FROM customers ORDER BY name;

-- Create customer
INSERT INTO customers (name, email, phone, address, city, state, zip_code) 
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Get customer by ID
SELECT * FROM customers WHERE id = ?;

-- Delete customer
DELETE FROM customers WHERE id = ?;

-- Get customer orders
SELECT o.* FROM orders o 
WHERE o.customer_id = ? 
ORDER BY o.created_at DESC;

-- ============================================================================
-- EMPLOYEE OPERATIONS
-- ============================================================================

-- Get all employees
SELECT e.*, u.username, u.email, u.role, u.status
FROM employees e
JOIN users u ON e.user_id = u.id
ORDER BY e.first_name, e.last_name;

-- Get employee details
SELECT e.*, u.username, u.email, u.role, u.phone
FROM employees e
JOIN users u ON e.user_id = u.id
WHERE e.id = ?;

-- Create employee
INSERT INTO employees (user_id, first_name, last_name, phone, hire_date, salary, department) 
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Get employee activities
SELECT ea.*, e.first_name, e.last_name, o.id as order_id
FROM employee_activities ea
JOIN employees e ON ea.employee_id = e.id
LEFT JOIN orders o ON ea.order_id = o.id
ORDER BY ea.created_at DESC;

-- Log employee activity
INSERT INTO employee_activities (employee_id, activity_type, description, order_id) 
VALUES (?, ?, ?, ?);

-- ============================================================================
-- REPORTING & ANALYTICS
-- ============================================================================

-- Daily revenue report
SELECT DATE(o.created_at) as order_date, 
       COUNT(*) as total_orders,
       SUM(o.total) as daily_revenue,
       SUM(o.subtotal) as subtotal,
       SUM(o.tax) as tax_collected
FROM orders o
WHERE o.status != 'cancelled'
GROUP BY DATE(o.created_at)
ORDER BY order_date DESC;

-- Monthly revenue report
SELECT DATE_FORMAT(o.created_at, '%Y-%m') as month, 
       COUNT(*) as total_orders,
       SUM(o.total) as monthly_revenue,
       SUM(o.subtotal) as subtotal,
       SUM(o.tax) as tax_collected
FROM orders o
WHERE o.status != 'cancelled'
GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
ORDER BY month DESC;

-- Top selling items
SELECT m.name, m.id, 
       SUM(oi.quantity) as total_sold,
       SUM(oi.quantity * oi.unit_price) as total_revenue,
       COUNT(DISTINCT oi.order_id) as order_count
FROM order_items oi
JOIN menu_items m ON oi.menu_item_id = m.id
GROUP BY m.id, m.name
ORDER BY total_sold DESC;

-- Category wise sales
SELECT c.name, 
       SUM(oi.quantity) as total_items_sold,
       SUM(oi.quantity * oi.unit_price) as category_revenue,
       COUNT(DISTINCT oi.order_id) as order_count
FROM order_items oi
JOIN menu_items m ON oi.menu_item_id = m.id
JOIN categories c ON m.category_id = c.id
GROUP BY c.id, c.name
ORDER BY category_revenue DESC;

-- Dashboard statistics
SELECT 
  (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()) as today_orders,
  (SELECT SUM(total) FROM orders WHERE DATE(created_at) = CURDATE()) as today_revenue,
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(DISTINCT status) FROM orders WHERE status IN ('pending', 'preparing', 'ready')) as active_orders;

-- ============================================================================
-- USER & SETTINGS OPERATIONS
-- ============================================================================

-- Get all active users
SELECT * FROM users WHERE status = 'active' ORDER BY username;

-- Get user by role
SELECT * FROM users WHERE role = ? AND status = 'active' ORDER BY username;

-- Get settings
SELECT * FROM settings ORDER BY setting_key;

-- Update setting
UPDATE settings SET setting_value = ? WHERE setting_key = ?;

-- Get tax rate setting
SELECT setting_value FROM settings WHERE setting_key = 'tax_rate' LIMIT 1;

-- ============================================================================
-- PAYMENT OPERATIONS
-- ============================================================================

-- Get payments for order
SELECT * FROM payment_records WHERE order_id = ? ORDER BY created_at DESC;

-- Create payment record
INSERT INTO payment_records (order_id, amount, payment_method, status) 
VALUES (?, ?, ?, 'completed');

-- Get unpaid orders
SELECT o.* FROM orders o
LEFT JOIN payment_records pr ON o.id = pr.order_id
WHERE pr.id IS NULL AND o.status IN ('completed', 'served');

-- Get payment summary
SELECT 
  payment_method,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM payment_records
WHERE DATE(created_at) = CURDATE()
GROUP BY payment_method;

-- ============================================================================
