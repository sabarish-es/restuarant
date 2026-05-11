# Database Schema Analysis & SQL Error Fixes

## Problem Summary

You have **2 conflicting database schemas**:
- **backend/database.sql** - Uses `tables` table with VARCHAR(10) `table_number`
- **backend/config/schema.sql** - Uses `restaurant_tables` table with INT `table_number`

Your SQL errors occur because the columns exist in one schema but not the other.

---

## Schema Comparison

### Orders Table Structure

| Field | database.sql | config/schema.sql |
|-------|---|---|
| order_number | ✓ VARCHAR(50) | ✓ VARCHAR(50) |
| **cashier_id** | ✓ INT | ✓ INT |
| customer_id | ✓ INT | ✓ INT |
| table_id | ✓ INT | ✓ INT |
| order_type | ✓ ENUM | ✓ ENUM |
| **status** | ✓ ENUM | ✓ ENUM |
| **subtotal** | ✓ DECIMAL | ✓ DECIMAL |
| **tax** | ✓ DECIMAL | ✓ DECIMAL |
| **total** | ✓ DECIMAL | ✓ DECIMAL |
| notes | ✓ TEXT | ✓ TEXT |
| created_at | ✓ TIMESTAMP | ✓ TIMESTAMP |
| completed_at | ✓ TIMESTAMP | ✓ TIMESTAMP |
| updated_at | ✓ TIMESTAMP | ✓ TIMESTAMP |

**Result**: Both schemas have all required columns! The error indicates your **actual database** is missing these columns.

### Order Items Table Structure

| Field | database.sql | config/schema.sql |
|-------|---|---|
| order_id | ✓ INT | ✓ INT |
| menu_item_id | ✓ INT | ✓ INT |
| quantity | ✓ INT | ✓ INT |
| unit_price | ✓ INT | ✓ INT |
| special_instructions | ✓ TEXT (as `special_instructions`) | ✓ TEXT (as `special_notes`) |
| status | ✓ VARCHAR(20) | ✗ MISSING |
| **total_price** | ✗ MISSING | ✗ MISSING |
| created_at | ✓ TIMESTAMP | ✓ TIMESTAMP |

**Issue**: The order_items INSERT is trying to add `total_price` which doesn't exist in either schema!

### Table Names Mismatch

| Purpose | database.sql | config/schema.sql |
|---------|---|---|
| Restaurant Tables | `tables` | `restaurant_tables` |
| Column for table number | `table_number` VARCHAR(10) | `table_number` INT |

---

## Root Causes of Errors

### Error 1: "Unknown column 'cashier_id'"
```
INSERT INTO orders (table_id, customer_id, cashier_id, ...)
ERROR 1054: Unknown column 'cashier_id'
```
**Cause**: Your actual database schema doesn't have the `cashier_id` column in the orders table, OR you're using the wrong schema initialization file.

### Error 2: "Field 'total_price' doesn't have a default value"
```
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, created_at)
ERROR 1364: Field 'total_price' doesn't have a default value
```
**Cause**: The column `total_price` doesn't exist in either schema definition. Either:
- Remove this field from your INSERT statement, OR
- Add the column to your schema

### Errors 3-5: "Unknown column 'o.status', 'o.subtotal'"
**Cause**: Your actual running database is missing these columns. The schema files define them, but they weren't applied to your database.

---

## Solutions

### Option 1: Use database.sql (Recommended)
This is the more complete schema. Run:
```bash
mysql -u root -p < backend/database.sql
```

### Option 2: Use config/schema.sql
Run:
```bash
mysql -u root -p < backend/config/schema.sql
```

### Option 3: Rebuild from Scratch
1. Drop the existing database
2. Run either schema file
3. Use the corrected queries below

---

## Corrected SQL Queries

### INSERT - Correct (for both schemas)
```sql
-- Corrected INSERT for orders (remove cashier_id if using config/schema.sql)
INSERT INTO orders (table_id, customer_id, cashier_id, order_type, status, subtotal, tax, total, notes, created_at, updated_at)
VALUES (1, 1, 5, 'dine-in', 'pending', 150.00, 15.00, 165.00, 'Extra spicy', NOW(), NOW());

-- Corrected INSERT for order_items (remove total_price - it doesn't exist)
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, created_at)
VALUES (1, 3, 2, 75.00, NOW());
-- Note: If you need item total, calculate it: quantity * unit_price
```

### SELECT - Correct Queries
```sql
-- Query 1: Pending orders with details
SELECT o.id, o.status, o.subtotal, o.tax, o.total, o.order_type,
       o.created_at, o.completed_at, c.name as customer_name,
       t.table_number, u.username as cashier_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN tables t ON o.table_id = t.id  -- Use 'tables' table (not restaurant_tables)
LEFT JOIN users u ON o.cashier_id = u.id
WHERE o.status = 'pending'
ORDER BY o.created_at DESC
LIMIT 10 OFFSET 0;

-- Query 2: Orders by status with item counts
SELECT o.id, o.status, o.order_type, o.created_at,
       t.table_number, u.username as cashier_name, COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN tables t ON o.table_id = t.id
LEFT JOIN users u ON o.cashier_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status IN ('pending', 'preparing', 'ready')
GROUP BY o.id, o.status, o.order_type, o.created_at, t.table_number, u.username
ORDER BY o.created_at ASC;

-- Query 3: Employee sales report
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

-- Query 4: Cashier's orders
SELECT o.id, o.status, o.subtotal, o.tax, o.total, o.created_at,
       o.completed_at, c.name as customer_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.cashier_id = 5
ORDER BY o.created_at DESC
LIMIT 50;

-- Query 5: Update order status
UPDATE orders
SET status = 'completed', updated_at = NOW()
WHERE id = 1;
```

---

## Recommendations

1. **Choose ONE schema** - Delete the redundant one (suggest keeping database.sql)
2. **Verify your actual database** - Run `DESCRIBE orders;` to see what columns actually exist
3. **If columns are missing** - Run the schema file to recreate the database with all columns
4. **Remove duplicate data insertion** - You have sample inserts in both files
5. **Test all queries** - After applying schema, test queries against real database

---

## Quick Verification Commands

```sql
-- Check if orders table has required columns
DESCRIBE orders;

-- Check if order_items table structure
DESCRIBE order_items;

-- Check actual data
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM order_items;
```

