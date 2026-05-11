-- CORRECTED DATABASE QUERIES FOR RESTAURANT MANAGEMENT SYSTEM
-- These queries have been fixed to match the actual database schema

-- ============================================
-- 1. CREATE ORDER
-- ============================================
-- Fixed: Uses cashier_id instead of user_id, proper subtotal/tax/total columns
INSERT INTO orders 
(table_id, customer_id, cashier_id, order_type, status, subtotal, tax, total, notes) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- ============================================
-- 2. INSERT ORDER ITEMS
-- ============================================
-- Fixed: Uses unit_price only (no total_price column)
INSERT INTO order_items 
(order_id, menu_item_id, quantity, unit_price) 
VALUES (?, ?, ?, ?);

-- ============================================
-- 3. GET ORDERS WITH JOINS
-- ============================================
-- Fixed: Uses cashier_id instead of user_id, status instead of order_status
SELECT o.*, 
       c.name as customer_name,
       rt.table_number,
       u.username as user_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN tables rt ON o.table_id = rt.id
LEFT JOIN users u ON o.cashier_id = u.id
WHERE o.status = ?
ORDER BY o.created_at DESC 
LIMIT ? OFFSET ?;

-- ============================================
-- 4. UPDATE ORDER STATUS
-- ============================================
-- Fixed: Uses status instead of order_status
UPDATE orders SET status = ? WHERE id = ?;

-- ============================================
-- 5. GET KITCHEN ORDERS
-- ============================================
-- Fixed: Uses cashier_id and status columns correctly
SELECT o.*, 
       rt.table_number,
       u.username as user_name
FROM orders o
LEFT JOIN tables rt ON o.table_id = rt.id
LEFT JOIN users u ON o.cashier_id = u.id
WHERE o.status IN ('pending', 'preparing', 'ready')
ORDER BY o.created_at ASC;

-- ============================================
-- 6. GET EMPLOYEE ACTIVITIES
-- ============================================
-- Fixed: Proper GROUP BY clause with all non-aggregated columns
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
GROUP BY u.id, u.username, u.email, u.role, COALESCE(e.first_name, 'N/A'), COALESCE(e.last_name, 'N/A'), COALESCE(e.hire_date, NOW())
ORDER BY COALESCE(e.first_name, u.username);

-- ============================================
-- 7. GET EMPLOYEE ORDERS
-- ============================================
-- Fixed: Uses cashier_id correctly
SELECT o.id, o.order_number, o.total, o.status, o.created_at, o.completed_at, c.name as customer_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.cashier_id = ?
ORDER BY o.created_at DESC
LIMIT 50;

-- ============================================
-- DATABASE SCHEMA REFERENCE
-- ============================================
/*
ORDERS TABLE COLUMNS:
- id: INT (Primary Key)
- order_number: VARCHAR(50)
- cashier_id: INT (Foreign Key to users, NOT user_id)
- customer_id: INT (Foreign Key to customers)
- table_id: INT (Foreign Key to tables)
- order_type: ENUM('dine-in', 'takeout', 'delivery')
- status: ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') - NOT order_status
- subtotal: DECIMAL(10, 2)
- tax: DECIMAL(10, 2)
- total: DECIMAL(10, 2) - Main total column
- notes: TEXT
- created_at: TIMESTAMP
- completed_at: TIMESTAMP
- updated_at: TIMESTAMP

ORDER_ITEMS TABLE COLUMNS:
- id: INT (Primary Key)
- order_id: INT (Foreign Key to orders)
- menu_item_id: INT (Foreign Key to menu_items)
- quantity: INT
- unit_price: DECIMAL(10, 2) - Only unit_price, NO total_price column
- special_instructions: TEXT
- status: VARCHAR(20)
- created_at: TIMESTAMP
*/

-- ============================================
-- SUMMARY OF FIXES APPLIED
-- ============================================
/*
1. Order Creation Errors:
   - OLD: user_id (column doesn't exist)
   - NEW: cashier_id (correct foreign key to users)
   
   - OLD: order_status (column doesn't exist)
   - NEW: status (correct column name)
   
   - OLD: total_amount (column doesn't exist)
   - NEW: subtotal, tax, total (correct columns)
   
   - OLD: Inserting total_price in order_items
   - NEW: Only unit_price exists in order_items table

2. Employee Activities Query:
   - Issue: GROUP BY didn't include all non-aggregated columns
   - Fix: Added all COALESCE expressions to GROUP BY clause

3. Query Joins:
   - Corrected all references to use cashier_id instead of user_id in orders table
   - Corrected all status references to use 'status' not 'order_status'
*/
