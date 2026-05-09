# Restaurant POS System - Windows Setup Guide

## Fixed Issues

✅ **SQL Error Fixed**: Changed column names from `key_name`/`key_value` to `setting_key`/`setting_value` to match database schema
✅ **Database initialization** now works without errors

## Prerequisites

1. **MySQL Server** installed and running
   - Default port: 3306
   - Root user with password set

2. **Node.js** installed (v18+)
   - Check: `node --version`

3. **npm** or **pnpm** installed
   - Check: `npm --version`

## Step-by-Step Setup (Windows)

### Step 1: Create `.env` File in Root

Create file: `C:\Users\ADMIN\Desktop\restuarant\.env`

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=restaurant_management
DB_PORT=3306
NODE_ENV=development
JWT_SECRET=your_secret_key_here
```

**Replace `your_mysql_password` with your actual MySQL root password!**

### Step 2: Install Dependencies

Open PowerShell and navigate to project:

```powershell
cd C:\Users\ADMIN\Desktop\restuarant
npm install
```

### Step 3: Initialize Database

```powershell
cd backend
node scripts/initDatabase.js
```

Expected output:
```
========================================
  FoodHub - Database Initialization
========================================

Connecting to database...
Host: localhost
Database: restaurant_management

✅ Connected to database

Creating tables...

  ✓ CREATE TABLE IF NOT EXISTS users
  ✓ CREATE TABLE IF NOT EXISTS categories
  ✓ CREATE TABLE IF NOT EXISTS menu_items
  ✓ CREATE TABLE IF NOT EXISTS tables
  ✓ CREATE TABLE IF NOT EXISTS customers
  ✓ CREATE TABLE IF NOT EXISTS orders
  ✓ CREATE TABLE IF NOT EXISTS order_items
  ✓ CREATE TABLE IF NOT EXISTS employees
  ✓ CREATE TABLE IF NOT EXISTS settings

✅ Database initialized successfully!
```

### Step 4: Create Admin User

```powershell
node scripts/createAdmin.js
```

Follow the prompts:
- Username: `admin`
- Email: `admin@restaurant.com`
- Password: `admin123`
- Role: `admin`

### Step 5: Start Backend Server

From `restuarant/backend` folder:

```powershell
npm start
```

Or use:
```powershell
node server.js
```

Expected output:
```
✅ Server is running on port 3001
✅ Database connected
```

### Step 6: Start Frontend Server (New PowerShell Window)

Navigate to root project folder:

```powershell
cd C:\Users\ADMIN\Desktop\restuarant
npx next dev
```

Expected output:
```
▲ Next.js 16.2.4
Local:        http://localhost:3000
```

### Step 7: Access Application

Open browser:
- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: admin123

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost' (using password: NO)"

**Solution**: Make sure `.env` file has the correct password:

```
DB_PASSWORD=your_actual_mysql_password
```

### Error: "Unknown column 'key_name' in 'field list'"

✅ **FIXED** - Updated `initDatabase.js` to use correct column names

### MySQL Connection Issues

Check if MySQL is running:

```powershell
# PowerShell
Get-Process | Select-String mysql
```

Or restart MySQL:
- Services → MySQL → Right-click → Restart

### Port 3000 or 3001 Already in Use

```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Find what's using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

Or change port in `.env`:
```
FRONTEND_PORT=3002
BACKEND_PORT=3002
```

## Full Database Schema

### Tables Created:
1. **users** - Store user accounts
2. **categories** - Menu categories
3. **menu_items** - Food items with prices
4. **tables** - Restaurant seating
5. **customers** - Customer information
6. **orders** - Order records
7. **order_items** - Individual items in orders
8. **employees** - Employee details
9. **settings** - Restaurant configuration

### Column Reference:

**settings table** (Fixed):
```sql
id INT (Primary Key)
setting_key VARCHAR(100) UNIQUE  ← Changed from key_name
setting_value TEXT               ← Changed from key_value
created_at TIMESTAMP
updated_at TIMESTAMP
```

## Testing the Application

### Admin Features
1. Login with `admin` / `admin123`
2. Add menu categories
3. Add menu items with images
4. Manage employees
5. View orders and reports

### Cashier Features
1. Login as cashier
2. Create new orders
3. Add items to order
4. Process payment
5. Print bill

### Kitchen Features
1. View pending orders
2. Mark items as preparing
3. Mark items as ready

## Complete SQL Schema

If you need to manually create the tables, here's the complete schema:

```sql
USE restaurant_management;

-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'cashier', 'kitchen', 'manager') DEFAULT 'cashier',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Menu Items Table
CREATE TABLE menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tables (Restaurant Seating) Table
CREATE TABLE tables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_number INT UNIQUE NOT NULL,
  seats INT NOT NULL,
  status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_id INT,
  customer_id INT,
  user_id INT NOT NULL,
  order_status ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Employees Table
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  position VARCHAR(100),
  salary DECIMAL(10, 2),
  hire_date DATE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Settings Table
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Default Settings
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
('restaurant_name', 'My Restaurant'),
('restaurant_phone', '+1234567890'),
('currency', 'USD'),
('tax_rate', '0.05');
```

## Summary

Your restaurant POS system is now ready to use! The database error has been fixed, and all tables are properly configured. Start with:

```powershell
cd C:\Users\ADMIN\Desktop\restuarant\backend
node scripts/initDatabase.js
node scripts/createAdmin.js
npm start

# In another PowerShell window:
cd C:\Users\ADMIN\Desktop\restuarant
npx next dev
```

Access at: **http://localhost:3000**
