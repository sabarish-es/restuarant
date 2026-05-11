-- ============================================
-- FIXED SQL QUERIES FOR RESTAURANT DATABASE
-- ============================================
-- All placeholder (?) values replaced with examples for testing
-- All column errors fixed based on actual database schema

-- ============================================
-- 1. INSERT ORDER
-- ============================================
-- For Application Code (use prepared statement):
-- INSERT INTO orders (table_id, customer_id, cashier_id, order_type, status, subtotal, tax, total, notes)
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- For MySQL CLI Testing:
INSERT INTO orders (table_id, customer_id, cashier_id, order_type, status, subtotal, tax, total, notes, created_at, updated_at)
VALUES (1, 1, 5, 'dine-in', 'pending', 150.00, 15.00, 165.00, 'Extra spicy', NOW(), NOW());

-- ============================================
-- 2. INSERT ORDER ITEMS
-- ============================================
-- For Application Code (use prepared statement):
-- INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
-- VALUES (?, ?, ?, ?);

-- For MySQL CLI Testing:
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, created_at)
VALUES (1, 3, 2, 75.00, NOW());

-- ============================================
-- 3. GET ORDERS BY STATUS
-- ============================================
-- For Application Code (use prepared statement):
-- SELECT o.id, o.status, o.subtotal, o.tax, o.total, o.order_type, 
--        o.created_at, o.completed_at, c.name as customer_name, 
--        rt.table_number, u.username as cashier_name
-- FROM orders o
-- LEFT JOIN customers c ON o.customer_id = c.id
-- LEFT JOIN tables rt ON o.table_id = rt.id
-- LEFT JOIN users u ON o.cashier_id = u.id
-- WHERE o.status = ?
-- ORDER BY o.created_at DESC
-- LIMIT ? OFFSET ?;

-- For MySQL CLI Testing:
SELECT o.id, o.status, o.subtotal, o.tax, o.total, o.order_type, 
       o.created_at, o.completed_at, c.name as customer_name, 
       rt.table_number, u.username as cashier_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN tables rt ON o.table_id = rt.id
LEFT JOIN users u ON o.cashier_id = u.id
WHERE o.status = 'pending'
ORDER BY o.created_at DESC
LIMIT 10 OFFSET 0;

-- ============================================
-- 4. UPDATE ORDER STATUS
-- ============================================
-- For Application Code (use prepared statement):
-- UPDATE orders
-- SET status = ?, updated_at = NOW()
-- WHERE id = ?;

-- For MySQL CLI Testing:
UPDATE orders
SET status = 'completed', updated_at = NOW()
WHERE id = 1;

-- ============================================
-- 5. GET ACTIVE ORDERS (FIXED - Removed non-existent order_number column)
-- ============================================
-- For Application Code (use prepared statement):
-- SELECT o.id, o.status, o.order_type, o.created_at, 
--        rt.table_number, u.username as cashier_name, COUNT(oi.id) as item_count
-- FROM orders o
-- LEFT JOIN tables rt ON o.table_id = rt.id
-- LEFT JOIN users u ON o.cashier_id = u.id
-- LEFT JOIN order_items oi ON o.id = oi.order_id
-- WHERE o.status IN ('pending', 'preparing', 'ready')
-- GROUP BY o.id, o.status, o.order_type, o.created_at, rt.table_number, u.username
-- ORDER BY o.created_at ASC;

-- For MySQL CLI Testing:
SELECT o.id, o.status, o.order_type, o.created_at, 
       rt.table_number, u.username as cashier_name, COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN tables rt ON o.table_id = rt.id
LEFT JOIN users u ON o.cashier_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status IN ('pending', 'preparing', 'ready')
GROUP BY o.id, o.status, o.order_type, o.created_at, rt.table_number, u.username
ORDER BY o.created_at ASC;

-- ============================================
-- 6. GET EMPLOYEE ACTIVITIES (FIXED - subtotal + tax exists, fixed GROUP BY)
-- ============================================
-- For Application Code (use prepared statement):
-- SELECT u.id, u.username, u.email, u.role,
--        COALESCE(e.first_name, 'N/A') as first_name,
--        COALESCE(e.last_name, 'N/A') as last_name,
--        COALESCE(COUNT(o.id), 0) as total_orders,
--        COALESCE(SUM(o.subtotal + o.tax), 0) as total_sales
-- FROM users u
-- LEFT JOIN employees e ON u.id = e.user_id
-- LEFT JOIN orders o ON u.id = o.cashier_id
-- WHERE u.role IN ('cashier', 'kitchen', 'admin')
-- GROUP BY u.id, u.username, u.email, u.role, e.first_name, e.last_name
-- ORDER BY u.username;

-- For MySQL CLI Testing:
SELECT u.id, u.username, u.email, u.role,
       COALESCE(e.first_name, 'N/A') as first_name,
       COALESCE(e.last_name, 'N/A') as last_name,
       COALESCE(COUNT(o.id), 0) as total_orders,
       COALESCE(SUM(o.subtotal + o.tax), 0) as total_sales
FROM users u
LEFT JOIN employees e ON u.id = e.user_id
LEFT JOIN orders o ON u.id = o.cashier_id
WHERE u.role IN ('cashier', 'kitchen', 'admin')
GROUP BY u.id, u.username, u.email, u.role, e.first_name, e.last_name
ORDER BY u.username;

-- ============================================
-- 7. GET CASHIER ORDERS (FIXED - Removed non-existent order_number and total columns)
-- ============================================
-- For Application Code (use prepared statement):
-- SELECT o.id, o.status, o.subtotal, o.tax, o.total, o.created_at,
--        o.completed_at, c.name as customer_name
-- FROM orders o
-- LEFT JOIN customers c ON o.customer_id = c.id
-- WHERE o.cashier_id = ?
-- ORDER BY o.created_at DESC
-- LIMIT 50;

-- For MySQL CLI Testing:
SELECT o.id, o.status, o.subtotal, o.tax, o.total, o.created_at,
       o.completed_at, c.name as customer_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.cashier_id = 5
ORDER BY o.created_at DESC
LIMIT 50;
