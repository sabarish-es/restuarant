-- CORRECTED DATABASE QUERIES FOR RESTAURANT MANAGEMENT SYSTEM
-- These queries have been fixed to match the actual database schema

-- ============================================
-- 1. CREATE ORDER
-- ============================================
-- Fixed: Uses cashier_id instead of user_id, proper subtotal/tax/total columns
-- NOTE: Use prepared statements in your application code with placeholders
INSERT INTO orders
(table_id, customer_id, cashier_id, order_type, status, subtotal, tax, total, notes)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Example with actual values:
-- INSERT INTO orders (table_id, customer_id, cashier_id, order_type, status, subtotal, tax, total, notes)
-- VALUES (1, 5, 2, 'dine-in', 'pending', 45.00, 4.50, 49.50, 'No onions');


-- ============================================
-- 2. INSERT ORDER ITEMS
-- ============================================
-- Fixed: Uses unit_price only (no total_price column)
INSERT INTO order_items
(order_id, menu_item_id, quantity, unit_price)
VALUES (?, ?, ?, ?);

-- Example with actual values:
-- INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
-- VALUES (1, 10, 2, 8.99);


-- ============================================
-- 3. GET ORDERS WITH JOINS
-- ============================================
-- Fixed: Uses cashier_id instead of user_id, status instead of order_status
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
       rt.table_number,
       u.username as cashier_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN tables rt ON o.table_id = rt.id
LEFT JOIN users u ON o.cashier_id = u.id
WHERE o.status = ?
ORDER BY o.created_at DESC
LIMIT ? OFFSET ?;

-- Example with actual values:
-- SELECT o.id, o.order_number, o.status, o.total, c.name as customer_name, rt.table_number, u.username as cashier_name
-- FROM orders o
-- LEFT JOIN customers c ON o.customer_id = c.id
-- LEFT JOIN tables rt ON o.table_id = rt.id
-- LEFT JOIN users u ON o.cashier_id = u.id
-- WHERE o.status = 'pending'
-- ORDER BY o.created_at DESC
-- LIMIT 10 OFFSET 0;


-- ============================================
-- 4. UPDATE ORDER STATUS
-- ============================================
-- Fixed: Uses status instead of order_status
UPDATE orders 
SET status = ?, updated_at = NOW() 
WHERE id = ?;

-- Example with actual values:
-- UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = 5;


-- ============================================
-- 5. GET KITCHEN ORDERS
-- ============================================
-- Fixed: Uses cashier_id and status columns correctly
SELECT o.id,
       o.order_number,
       o.status,
       o.order_type,
       o.created_at,
       rt.table_number,
       u.username as cashier_name,
       COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN tables rt ON o.table_id = rt.id
LEFT JOIN users u ON o.cashier_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status IN ('pending', 'preparing', 'ready')
GROUP BY o.id
ORDER BY o.created_at ASC;


-- ============================================
-- 6. GET EMPLOYEE ACTIVITIES
-- ============================================
-- Fixed: Removed non-existent 'o.total' column, proper GROUP BY
SELECT u.id, 
       u.username, 
       u.email, 
       u.role,
       COALESCE(e.first_name, 'N/A') as first_name,
       COALESCE(e.last_name, 'N/A') as last_name,
       COALESCE(e.hire_date, NOW()) as hire_date,
       COALESCE(COUNT(o.id), 0) as total_orders,
       COALESCE(SUM(o.subtotal + o.tax), 0) as total_sales,
       COALESCE(COUNT(CASE WHEN DATE(o.created_at) = CURDATE() THEN 1 END), 0) as today_orders,
       COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURDATE() THEN (o.subtotal + o.tax) ELSE 0 END), 0) as today_sales,
       MAX(o.created_at) as last_order_at
FROM users u
LEFT JOIN employees e ON u.id = e.user_id
LEFT JOIN orders o ON u.id = o.cashier_id
WHERE u.role IN ('cashier', 'kitchen', 'admin')
GROUP BY u.id, u.username, u.email, u.role, e.first_name, e.last_name, e.hire_date
ORDER BY COALESCE(e.first_name, u.username);


-- ============================================
-- 7. GET EMPLOYEE ORDERS
-- ============================================
-- Fixed: Uses cashier_id correctly
SELECT o.id, 
       o.order_number, 
       o.total, 
       o.status, 
       o.created_at, 
       o.completed_at, 
       c.name as customer_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.cashier_id = ?
ORDER BY o.created_at DESC
LIMIT 50;

-- Example with actual values:
-- SELECT o.id, o.order_number, o.total, o.status, o.created_at, o.completed_at, c.name as customer_name
-- FROM orders o
-- LEFT JOIN customers c ON o.customer_id = c.id
-- WHERE o.cashier_id = 2
-- ORDER BY o.created_at DESC
-- LIMIT 50;


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
- status: ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled')
- subtotal: DECIMAL(10, 2)
- tax: DECIMAL(10, 2)
- total: DECIMAL(10, 2)
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
-- SUMMARY OF ALL FIXES APPLIED
-- ============================================
/*
CRITICAL ISSUES FIXED:

1. ❌ Placeholder Syntax Errors (Queries 1-4, 7)
   Problem: Running ? placeholders directly in MySQL CLI doesn't work - they're for prepared statements
   Solution: Show both placeholder syntax (for app code) and example values (for CLI testing)

2. ❌ Unknown Column 'o.status' (Query 5)
   Problem: Incorrectly referenced a column that was being filtered
   Solution: Added GROUP BY o.id to properly handle aggregation

3. ❌ Unknown Column 'o.total' (Query 6)
   Problem: Tried to use non-existent 'o.total' column in SUM
   Solution: Changed to SUM(o.subtotal + o.tax) which equals the total
   
4. ❌ GROUP BY Clause Incomplete (Query 6)
   Problem: Not all non-aggregated columns were in GROUP BY
   Solution: Added e.first_name, e.last_name, e.hire_date to GROUP BY
   
5. ❌ Missing updated_at in UPDATE (Query 4)
   Problem: Didn't update the timestamp when changing status
   Solution: Added updated_at = NOW() to track changes

6. ✅ Column Name Corrections
   - user_id → cashier_id (in orders table)
   - order_status → status
   - total_amount → subtotal, tax, total (proper columns)
   
7. ✅ Proper JOINs
   - All foreign key references now match actual database schema
   - Added alias 'rt' for tables (reserved word) to avoid conflicts

FOR APPLICATION CODE:
- Use the ? placeholder versions with prepared statements in your backend
- Pass parameters safely to prevent SQL injection
- In Node.js/Express: Use mysql2/promise or similar with .execute()
- In other languages: Use parameterized queries with your database driver
*/
