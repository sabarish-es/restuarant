# Restaurant Management System - Database Setup Guide

## Overview
This document provides complete setup instructions for the Restaurant Management System database and application.

---

## ✅ What's Included

### Database Files
- **`backend/database.sql`** - Complete, clean database schema with all tables
- **`backend/SAMPLE_QUERIES.sql`** - Ready-to-use SQL queries for common operations
- **`backend/scripts/initDatabase.js`** - Automated database initialization script

### Application Features
- **Authentication** - Admin, Cashier, Kitchen roles
- **Menu Management** - Categories, Items, Pricing
- **Order Management** - Create, Track, Complete Orders
- **Table Management** - Restaurant Table Status
- **Customer Management** - Customer Information
- **Reports & Analytics** - Revenue, Sales, Performance
- **Employee Management** - Staff, Activities, Logs

---

## 🚀 Quick Start

### Step 1: Prerequisites
```bash
# Make sure you have:
- Node.js 18+
- MySQL 8.0+
- npm or yarn
```

### Step 2: Environment Setup
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sabarish0227E
DB_NAME=restaurant_management
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_secret_key_here_change_in_production

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Initialize Database
```bash
npm run db:init
```

This command will:
- ✅ Create the `restaurant_management` database
- ✅ Create all necessary tables with proper relationships
- ✅ Insert sample data (menu items, tables, categories, etc.)
- ✅ Create default admin user

### Step 5: Start the Application
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## 📊 Database Schema

### Core Tables

#### **Users** (Authentication & Staff)
```
users
├── id (Primary Key)
├── username (UNIQUE)
├── email (UNIQUE)
├── password (hashed)
├── phone
├── role (admin, cashier, kitchen, manager)
├── status (active, inactive, suspended)
├── created_at
└── updated_at
```

#### **Categories** (Menu Categories)
```
categories
├── id (Primary Key)
├── name (UNIQUE)
├── description
├── status (active, inactive)
├── created_at
└── updated_at
```

#### **Menu_Items** (Restaurant Menu)
```
menu_items
├── id (Primary Key)
├── name
├── category_id (FK → categories)
├── price
├── description
├── image_url
├── status (active, inactive)
├── created_at
└── updated_at
```

#### **Tables** (Restaurant Tables)
```
tables
├── id (Primary Key)
├── table_number (UNIQUE)
├── capacity
├── status (available, occupied, reserved, dirty)
├── location
├── created_at
└── updated_at
```

#### **Customers** (Customer Information)
```
customers
├── id (Primary Key)
├── name
├── email
├── phone
├── address
├── city
├── state
├── zip_code
├── created_at
└── updated_at
```

#### **Orders** (Main Orders)
```
orders
├── id (Primary Key)
├── table_id (FK → tables)
├── customer_id (FK → customers)
├── cashier_id (FK → users)
├── order_type (dine-in, takeaway, delivery)
├── status (pending, preparing, ready, served, completed, cancelled)
├── subtotal
├── tax
├── total
├── notes
├── created_at
└── updated_at
```

#### **Order_Items** (Items in Orders)
```
order_items
├── id (Primary Key)
├── order_id (FK → orders)
├── menu_item_id (FK → menu_items)
├── quantity
├── unit_price
├── special_instructions
├── created_at
└── updated_at
```

#### **Employees** (Employee Details)
```
employees
├── id (Primary Key)
├── user_id (FK → users)
├── first_name
├── last_name
├── phone
├── hire_date
├── salary
├── department
├── status
├── created_at
└── updated_at
```

#### **Employee_Activities** (Activity Logs)
```
employee_activities
├── id (Primary Key)
├── employee_id (FK → employees)
├── activity_type
├── description
├── order_id (FK → orders)
├── created_at
```

#### **Settings** (App Configuration)
```
settings
├── id (Primary Key)
├── setting_key (UNIQUE)
├── setting_value
├── description
├── created_at
└── updated_at
```

#### **Payment_Records** (Payment Tracking)
```
payment_records
├── id (Primary Key)
├── order_id (FK → orders)
├── amount
├── payment_method (cash, card, upi, other)
├── status (pending, completed, failed, refunded)
├── reference_id
├── created_at
└── updated_at
```

---

## 🔑 Default Credentials

After running `npm run db:init`, a default admin user is created:

```
Username: admin
Password: admin123
Role: admin
```

⚠️ **IMPORTANT**: Change this password immediately in production!

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/create-user    - Create user (admin only)
```

### Menu Management
```
GET    /api/categories          - Get all categories
POST   /api/categories          - Create category (admin)
PUT    /api/categories/:id      - Update category (admin)
DELETE /api/categories/:id      - Delete category (admin)

GET    /api/menu-items          - Get all menu items
POST   /api/menu-items          - Create menu item (admin)
PUT    /api/menu-items/:id      - Update menu item (admin)
DELETE /api/menu-items/:id      - Delete menu item (admin)
```

### Orders
```
POST   /api/orders              - Create order (cashier, admin)
GET    /api/orders              - Get all orders
GET    /api/orders/:id          - Get order details
PUT    /api/orders/:id/status   - Update order status
GET    /api/orders/:id/print    - Print order bill
GET    /api/kitchen-orders      - Get kitchen orders (kitchen)
```

### Tables
```
GET    /api/tables              - Get all tables
PUT    /api/tables/:id/status   - Update table status
```

### Customers
```
GET    /api/customers           - Get all customers
POST   /api/customers           - Create customer
DELETE /api/customers/:id       - Delete customer
```

### Employees
```
GET    /api/employees           - Get all employees
POST   /api/employees           - Create employee
GET    /api/employees/:id/details - Get employee details
DELETE /api/employees/:id       - Delete employee
GET    /api/employees/activities - Get employee activities (admin)
```

### Reports
```
GET    /api/dashboard-stats     - Dashboard statistics
GET    /api/reports             - Get reports (admin)
```

### Settings
```
GET    /api/settings            - Get all settings
PUT    /api/settings            - Update settings (admin)
```

---

## 📝 Common SQL Queries

All common queries are available in `backend/SAMPLE_QUERIES.sql`. Here are some examples:

### Get Menu Items with Categories
```sql
SELECT m.*, c.name as category_name 
FROM menu_items m 
JOIN categories c ON m.category_id = c.id 
WHERE m.status = 'active' 
ORDER BY c.name, m.name;
```

### Get Orders with Details
```sql
SELECT o.*, 
       c.name as customer_name,
       rt.table_number,
       u.username as cashier_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN tables rt ON o.table_id = rt.id
LEFT JOIN users u ON o.cashier_id = u.id
ORDER BY o.created_at DESC;
```

### Daily Revenue Report
```sql
SELECT DATE(o.created_at) as order_date, 
       COUNT(*) as total_orders,
       SUM(o.total) as daily_revenue,
       SUM(o.subtotal) as subtotal,
       SUM(o.tax) as tax_collected
FROM orders o
WHERE o.status != 'cancelled'
GROUP BY DATE(o.created_at)
ORDER BY order_date DESC;
```

---

## 🛠️ Troubleshooting

### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:**
- Ensure MySQL is running
- Check DB_HOST, DB_USER, DB_PASSWORD in .env
- Verify database port (default: 3306)

### Table Already Exists
```
Error: ER_TABLE_EXISTS_ERROR
```
**Solution:**
- The database already exists from previous setup
- Run: `npm run db:init` to reinitialize
- Or manually drop the database: `DROP DATABASE restaurant_management;`

### Password Authentication Failed
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:**
- Verify MySQL root password is correct in .env
- If you don't know the password, reset it:
  ```bash
  mysql -u root
  SET PASSWORD FOR 'root'@'localhost' = PASSWORD('sabarish0227E');
  ```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:**
- Change PORT in .env to an available port
- Or kill the process using port 3001

---

## 🔒 Security Recommendations

1. **Change Default Credentials**
   - Change admin password immediately after setup
   - Use strong passwords

2. **JWT Secret**
   - Change `JWT_SECRET` in .env
   - Use a random, complex string

3. **Database Password**
   - Update `DB_PASSWORD` in .env
   - Use strong password

4. **Environment Variables**
   - Never commit `.env` to version control
   - Use `.env.example` for template

5. **Firewall Rules**
   - Restrict database access to localhost
   - Use VPN for remote access

---

## 📚 Additional Resources

- MySQL Documentation: https://dev.mysql.com/doc/
- Node.js MySQL2: https://github.com/sidorares/node-mysql2
- JWT Documentation: https://jwt.io
- Express.js: https://expressjs.com/

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the error logs in console
3. Verify database connection with `npm run db:test`
4. Check backend/SAMPLE_QUERIES.sql for query examples

---

## ✨ Next Steps

After setup:
1. ✅ Create new admin user with strong password
2. ✅ Customize restaurant settings (name, tax rate, etc.)
3. ✅ Add your menu items and categories
4. ✅ Configure table setup
5. ✅ Train staff on the system
6. ✅ Set up backups

---

**Happy coding! 🎉**
