# FoodHub - Complete Setup & Run Guide for VS Code

## Overview
FoodHub is a restaurant management system with admin dashboard, cashier POS, and kitchen display system.

---

## STEP 1: Prerequisites Check

Before starting, ensure you have installed:
- **Node.js** (v18+) - Download from nodejs.org
- **MySQL** (v5.7+) - Download from mysql.com  
- **VS Code** - Download from code.visualstudio.com

To verify installation, open Terminal/Command Prompt and type:
```bash
node --version
npm --version
mysql --version
```

You should see version numbers for all three.

---

## STEP 2: Open Project in VS Code

1. Open VS Code
2. Click: **File → Open Folder**
3. Select the `foodhub` folder on your computer
4. VS Code will open the project

---

## STEP 3: Setup Database

### Option A: Using MySQL Command Line

1. Open **Command Prompt** or **Terminal** (not VS Code terminal yet)
2. Type this command:
```bash
mysql -u root -p
```
3. Enter your MySQL password when prompted

4. Copy and paste this entire block:
```sql
CREATE DATABASE restaurant_management;
USE restaurant_management;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'cashier', 'kitchen') DEFAULT 'cashier',
  phone VARCHAR(15),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category_id INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE restaurant_tables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  table_number INT UNIQUE NOT NULL,
  seats INT NOT NULL,
  status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(15),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL,
  phone VARCHAR(15),
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  table_id INT,
  customer_id INT,
  user_id INT NOT NULL,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
  order_type ENUM('dine-in', 'takeaway') DEFAULT 'dine-in',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_items(id)
);

CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_name VARCHAR(100),
  restaurant_phone VARCHAR(15),
  restaurant_email VARCHAR(100),
  restaurant_address TEXT,
  tax_percentage DECIMAL(5, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'INR',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@foodhub.com', '$2b$10$YourHashedPasswordHere', 'admin');

-- Insert sample categories
INSERT INTO categories (name, description, status) VALUES
('Starters', 'Appetizers and small bites', 'active'),
('Main Course', 'Entrees and main dishes', 'active'),
('Desserts', 'Sweet treats and desserts', 'active'),
('Beverages', 'Drinks and beverages', 'active');

-- Insert sample tables
INSERT INTO restaurant_tables (table_number, seats, status) VALUES
(1, 2, 'available'),
(2, 2, 'available'),
(3, 4, 'available'),
(4, 4, 'available'),
(5, 6, 'available'),
(6, 6, 'available');

-- Insert default settings
INSERT INTO settings (restaurant_name, restaurant_phone, restaurant_email, tax_percentage, currency)
VALUES ('FoodHub Restaurant', '9876543210', 'admin@foodhub.com', 5, 'INR');
```

5. Press Enter to execute all commands
6. Type `exit` to close MySQL

---

## STEP 4: Backend Setup in VS Code

1. Open **Terminal** in VS Code: **View → Terminal** (or Ctrl+`)
2. Navigate to backend folder:
```bash
cd backend
```

3. Install backend dependencies:
```bash
npm install
```

4. Verify the .env file exists with correct values:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sabarish0227E
DB_NAME=restaurant_management
JWT_SECRET=your_secret_key_change_this
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## STEP 5: Frontend Setup in VS Code

1. Open another terminal in VS Code: **Ctrl+Shift+`** (backtick)
2. Navigate to project root (if in backend):
```bash
cd ..
```

3. Install frontend dependencies:
```bash
npm install
```

---

## STEP 6: Start Backend Server

In the first terminal (backend folder):
```bash
node server.js
```

You should see:
```
Server running on port 3001
```

**Leave this terminal open and running!**

---

## STEP 7: Start Frontend Development Server

In the second terminal (root folder):
```bash
npm run dev
```

You should see:
```
  ▲ Next.js 16.2.4
  - Local: http://localhost:3000
```

---

## STEP 8: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

You should see the FoodHub login page.

### Default Login Credentials:
- **Username:** admin
- **Email:** admin@foodhub.com
- **Password:** (Check your terminal or database - you set this)

If you don't know the password, reset it in MySQL:
```sql
UPDATE users SET password = 'admin123' WHERE username = 'admin';
```
(Then use 'admin123' as password)

---

## STEP 9: Test All Features

### Add Category
1. Go to: Admin → Menu → Categories
2. Click "Add Category" button
3. Enter category name and submit
4. Should see success message

### Add Menu Items
1. Go to: Admin → Menu → Items
2. Click "Add New Item"
3. Select category, enter name, price, upload image
4. Click Add

### Manage Employees
1. Go to: Admin → Employees
2. Click "Add Employee"
3. Fill: Username, Email, Password, First Name, Last Name, Role, Phone
4. Click Add

### View Tables
1. Go to: Admin → Tables
2. Should see list of restaurant tables
3. Click status to change (available/occupied/reserved)

### Use Cashier POS
1. Go to: http://localhost:3000/cashier
2. Create orders, add items, checkout

### Use Kitchen Display
1. Go to: http://localhost:3000/kitchen
2. View pending orders, mark as preparing, mark as ready

---

## TROUBLESHOOTING

### Error: "Failed to add category: Server returned 404"
**Solution:** Backend is not running. Check Step 6 - ensure backend terminal shows "Server running on port 3001"

### Error: "Cannot GET /api/categories"
**Solution:** Database tables weren't created. Repeat Step 3 completely.

### Error: "connect ECONNREFUSED 127.0.0.1:3306"
**Solution:** MySQL is not running. Start MySQL server first.

### Error: "Unexpected token '<', '<!DOCTYPE'"
**Solution:** API is returning error pages instead of JSON. Check backend terminal for errors and restart.

### Tables page shows "No tables found"
**Solution:** No data in database. Re-run the INSERT statements from Step 3.

### Forgot admin password
**Solution:** Reset in MySQL:
```sql
USE restaurant_management;
UPDATE users SET password = '$2b$10$new_hash_here' WHERE username = 'admin';
```
Or just use a simple password for testing.

---

## DEVELOPMENT WORKFLOW

### While developing:
1. Keep backend terminal running: `node server.js` (do NOT close)
2. Keep frontend terminal running: `npm run dev` (do NOT close)
3. Make code changes in VS Code
4. Changes auto-reload in browser
5. Check browser console (F12) for any errors

### To Stop:
1. Press `Ctrl+C` in backend terminal
2. Press `Ctrl+C` in frontend terminal
3. Close both terminals

### To Restart:
1. Repeat STEP 6 and STEP 7

---

## File Structure

```
foodhub/
├── backend/                      # Express API server
│   ├── config/db.js             # Database configuration
│   ├── controllers/             # API logic
│   ├── middleware/              # Auth middleware
│   ├── .env                     # Environment variables
│   └── server.js                # Main server file
├── app/                         # Next.js frontend
│   ├── page.tsx                 # Login page
│   ├── admin/                   # Admin dashboard pages
│   ├── cashier/                 # Cashier POS pages
│   └── kitchen/                 # Kitchen display pages
├── components/                  # React components
├── lib/                         # Utilities
├── package.json                 # Frontend dependencies
├── RUN_FOODHUB.md              # This file
└── README.md                    # Project overview
```

---

## Summary

You now have:
✓ Database setup with all tables
✓ Backend API running on port 3001
✓ Frontend running on port 3000
✓ Admin dashboard at http://localhost:3000
✓ Cashier POS at http://localhost:3000/cashier
✓ Kitchen display at http://localhost:3000/kitchen

Everything is ready to use! Follow the troubleshooting section if you encounter any issues.
