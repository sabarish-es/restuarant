-- ============================================
-- RESTAURANT MANAGEMENT - CORRECTED SQL QUERIES
-- ============================================
-- IMPORTANT: Before running these queries, ensure your database is initialized with one of these schemas:
--   - backend/database.sql (RECOMMENDED - more complete)
--   - backend/config/schema.sql
-- 
-- Then run: DESCRIBE orders; to verify all columns exist
-- ============================================

-- ============================================
-- 1. INSERT OPERATIONS
-- ============================================

-- Insert a new order (CORRECTED - no total_price field)
INSERT INTO orders (table_id, customer_id, cashier_id, order_type, status, subtotal, tax, total, notes, created_at, updated_at)
VALUES (1, 1, 5, 'dine-in', 'pending', 150.00, 15.00, 165.00, 'Extra spicy', NOW(), NOW());

-- Insert order items (CORRECTED - removed non-existent total_price field)
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, created_at)
VALUES (1, 3, 2, 75.00, NOW());

-- Insert a customer
INSERT INTO customers (name, phone, email, address, city, state, zip_code)
VALUES ('John Doe', '555-1234', 'john@example.com', '123 Main St', 'New York', 'NY', '10001');

-- Insert a menu item
INSERT INTO menu_items (name, category_id, price, description, status)
VALUES ('Grilled Chicken', 3, 12.99, 'Delicious grilled chicken breast', 'active');

-- Insert an employee
INSERT INTO employees (user_id, first_name, last_name, phone, hire_date, status)
VALUES (1, 'John', 'Smith', '555-5678', '2024-01-15', 'active');

-- ============================================
-- 2. SELECT QUERIES
-- ============================================

-- Query 1: Get all pending orders with customer and cashier details
SELECT o.id, 
       o.order_number,
       o.status, 
       o.subtotal, 
       o.tax, 
       o.total, 
       o.order_type,
       o.created_at, 
       o.completed_at, 
       c.name as customer_name,
       t.table_number, 
       u.username as cashier_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN tables t ON o.table_id = t.id
LEFT JOIN users u ON o.cashier_id = u.id
WHERE o.status = 'pending'
ORDER BY o.created_at DESC
LIMIT 10 OFFSET 0;

-- Query 2: Orders with item counts by status
SELECT o.id, 
       o.order_number,
       o.status, 
       o.order_type, 
       o.created_at,
       t.table_number, 
       u.username as cashier_name, 
       COUNT(oi.id) as item_count,
       SUM(oi.quantity) as total_items
FROM orders o
LEFT JOIN tables t ON o.table_id = t.id
LEFT JOIN users u ON o.cashier_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status IN ('pending', 'preparing', 'ready')
GROUP BY o.id, o.order_number, o.status, o.order_type, o.created_at, t.table_number, u.username
ORDER BY o.created_at ASC;

-- Query 3: Employee sales report with order and sales totals
SELECT u.id, 
       u.username, 
       u.email, 
       u.role,
       COALESCE(e.first_name, 'N/A') as first_name,
       COALESCE(e.last_name, 'N/A') as last_name,
       COALESCE(e.hire_date, 'N/A') as hire_date,
       COALESCE(COUNT(o.id), 0) as total_orders,
       COALESCE(SUM(o.subtotal), 0) as subtotal_sales,
       COALESCE(SUM(o.tax), 0) as tax_collected,
       COALESCE(SUM(o.total), 0) as total_sales
FROM users u
LEFT JOIN employees e ON u.id = e.user_id
LEFT JOIN orders o ON u.id = o.cashier_id
WHERE u.role IN ('cashier', 'kitchen', 'admin')
GROUP BY u.id, u.username, u.email, u.role, e.first_name, e.last_name, e.hire_date
ORDER BY total_sales DESC;

-- Query 4: All orders for a specific cashier
SELECT o.id, 
       o.order_number,
       o.status, 
       o.subtotal, 
       o.tax, 
       o.total, 
       o.created_at,
       o.completed_at, 
       c.name as customer_name,
       t.table_number
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN tables t ON o.table_id = t.id
WHERE o.cashier_id = 5
ORDER BY o.created_at DESC
LIMIT 50;

-- Query 5: Order details with all items
SELECT o.id,
       o.order_number,
       o.status,
       o.order_type,
       o.subtotal,
       o.tax,
       o.total,
       o.created_at,
       c.name as customer_name,
       t.table_number,
       oi.id as item_id,
       mi.name as item_name,
       oi.quantity,
       oi.unit_price,
       (oi.quantity * oi.unit_price) as item_total
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN tables t ON o.table_id = t.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.status IN ('pending', 'preparing', 'ready', 'completed')
ORDER BY o.created_at DESC, oi.id;

-- Query 6: Menu items with category and sales count
SELECT mi.id,
       mi.name,
       cat.name as category,
       mi.price,
       COUNT(oi.id) as times_ordered,
       SUM(oi.quantity) as total_quantity_sold,
       (mi.price * SUM(oi.quantity)) as total_revenue
FROM menu_items mi
LEFT JOIN categories cat ON mi.category_id = cat.id
LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
WHERE mi.status = 'active'
GROUP BY mi.id, mi.name, cat.name, mi.price
ORDER BY total_revenue DESC;

-- Query 7: Daily sales summary
SELECT DATE(o.created_at) as order_date,
       COUNT(DISTINCT o.id) as total_orders,
       COUNT(DISTINCT o.cashier_id) as cashiers_active,
       SUM(o.subtotal) as daily_subtotal,
       SUM(o.tax) as daily_tax,
       SUM(o.total) as daily_total,
       AVG(o.total) as average_order_value
FROM orders o
WHERE o.status IN ('completed', 'ready')
GROUP BY DATE(o.created_at)
ORDER BY order_date DESC;

-- Query 8: Table occupancy status
SELECT t.id,
       t.table_number,
       t.capacity,
       t.status,
       COUNT(o.id) as active_orders,
       MAX(o.created_at) as last_order_time
FROM tables t
LEFT JOIN orders o ON t.id = o.table_id AND o.status IN ('pending', 'preparing', 'ready')
GROUP BY t.id, t.table_number, t.capacity, t.status
ORDER BY t.table_number;

-- ============================================
-- 3. UPDATE OPERATIONS
-- ============================================

-- Update order status to completed
UPDATE orders
SET status = 'completed', 
    updated_at = NOW(),
    completed_at = NOW()
WHERE id = 1;

-- Update order status with timestamp
UPDATE orders
SET status = 'ready', 
    updated_at = NOW()
WHERE id = 1 AND status = 'preparing';

-- Update order items status
UPDATE order_items
SET status = 'served'
WHERE order_id = 1;

-- Update table status to occupied
UPDATE tables
SET status = 'occupied', 
    updated_at = NOW()
WHERE id = 1;

-- Update table status back to available
UPDATE tables
SET status = 'available', 
    updated_at = NOW()
WHERE table_number = '1';

-- ============================================
-- 4. DELETE OPERATIONS (Use with caution!)
-- ============================================

-- Cancel an order (set status instead of deleting)
UPDATE orders
SET status = 'cancelled', updated_at = NOW()
WHERE id = 999;

-- Delete a specific order (removes associated items via CASCADE)
-- DELETE FROM orders WHERE id = 999;

-- Delete old completed orders (older than 90 days)
-- DELETE FROM orders WHERE status = 'completed' AND created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- ============================================
-- 5. TRANSACTION EXAMPLE - Complete Order Process
-- ============================================

-- Example transaction for creating and completing an order:
/*
START TRANSACTION;

-- Create order
INSERT INTO orders (table_id, customer_id, cashier_id, order_type, status, subtotal, tax, total)
VALUES (1, 1, 5, 'dine-in', 'pending', 150.00, 15.00, 165.00);

-- Get the last inserted order ID
SET @order_id = LAST_INSERT_ID();

-- Add order items
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
VALUES 
  (@order_id, 1, 2, 10.00),
  (@order_id, 2, 1, 15.00);

-- Update table status
UPDATE tables SET status = 'occupied' WHERE id = 1;

-- Record payment
INSERT INTO payments (order_id, amount, payment_method, status)
VALUES (@order_id, 165.00, 'cash', 'completed');

-- Complete order
UPDATE orders SET status = 'completed', completed_at = NOW() WHERE id = @order_id;

-- Release table
UPDATE tables SET status = 'available' WHERE id = 1;

COMMIT;
*/

-- ============================================
-- 6. TROUBLESHOOTING QUERIES
-- ============================================

-- Check database and table structure
-- SHOW DATABASES;
-- USE restaurant_management;
-- SHOW TABLES;
-- DESCRIBE orders;
-- DESCRIBE order_items;

-- Check for missing columns
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders';

-- Verify data integrity
-- SELECT COUNT(*) as total_orders FROM orders;
-- SELECT COUNT(*) as total_items FROM order_items;
-- SELECT COUNT(*) as total_customers FROM customers;

-- Find orders with missing references
-- SELECT * FROM orders WHERE customer_id IS NULL;
-- SELECT * FROM orders WHERE cashier_id IS NULL;
-- SELECT * FROM orders WHERE table_id IS NULL;
