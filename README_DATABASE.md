# 🍽️ Restaurant Management System - Database Guide

## 📊 Complete Database Setup

All database files have been **cleaned, fixed, and reorganized**. You now have a **production-ready schema** with proper relationships and sample data.

---

## 🎯 Quick Start (3 Steps)

```bash
# Step 1: Install dependencies
npm install

# Step 2: Initialize database (creates all tables & sample data)
npm run db:init

# Step 3: Start the application
npm run dev
```

**Login with:** `admin` / `admin123`

---

## 📁 Database Files Structure

```
backend/
├── database.sql                    ← MAIN SCHEMA (complete & clean)
├── SAMPLE_QUERIES.sql              ← Ready-to-use queries
├── config/
│   └── db.js                       ← Connection config
├── scripts/
│   └── initDatabase.js             ← Auto-init script (UPDATED)
├── controllers/
│   ├── authController.js           ← User authentication
│   ├── menuController.js           ← Menu/category operations
│   ├── orderController.js          ← Order management
│   └── masterController.js         ← Tables, customers, employees
├── middleware/
│   └── auth.js                     ← Auth middleware
└── server.js                       ← Express server

ROOT/
├── DATABASE_SETUP.md               ← Full documentation (455 lines)
├── VERIFICATION_CHECKLIST.md       ← Testing guide (452 lines)
├── SETUP_SUMMARY.md                ← Quick reference (289 lines)
└── README_DATABASE.md              ← This file
```

---

## 🗂️ Database Tables (11 Total)

### Core Tables

```
┌─────────────────┐         ┌────────────────┐
│     users       │         │   categories   │
├─────────────────┤         ├────────────────┤
│ id (PK)         │         │ id (PK)        │
│ username        │         │ name           │
│ email           │         │ description    │
│ password        │         │ status         │
│ phone           │         │ timestamps     │
│ role            │         └────────────────┘
│ status          │                ↑
│ timestamps      │                │
└────────┬────────┘                │
         │                   ┌──────┴──────────┐
         │                   │                 │
    ┌────▼──────────┐  ┌─────▼──────────┐  ┌──┴──────────────┐
    │   employees   │  │  menu_items    │  │   tables        │
    ├──────────────┤  ├────────────────┤  ├─────────────────┤
    │ id (PK)      │  │ id (PK)        │  │ id (PK)         │
    │ user_id (FK) │  │ category_id(FK)│  │ table_number    │
    │ first_name   │  │ name           │  │ capacity        │
    │ last_name    │  │ price          │  │ status          │
    │ hire_date    │  │ image_url      │  │ location        │
    │ salary       │  │ description    │  │ timestamps      │
    │ department   │  │ status         │  └─────────────────┘
    │ timestamps   │  │ timestamps     │          ↑
    └────┬─────────┘  └────────────────┘          │
         │                                        │
         │                              ┌─────────▼─────────┐
         │                              │     orders        │
         │                              ├───────────────────┤
         │                              │ id (PK)           │
         │                              │ table_id (FK)     │
         │                              │ customer_id (FK)  │
         │                              │ cashier_id (FK)   │
         │                              │ order_type        │
         │                              │ status            │
         │                              │ subtotal          │
         │                              │ tax               │
         │                              │ total             │
         │                              │ timestamps        │
         │                              └────┬──────────────┘
         │                                   │
         │                    ┌──────────────┼──────────────┐
         │                    │              │              │
    ┌────▼──────────────┐ ┌───▼────────┐ ┌──▼─────────────┐
    │ employee_         │ │ order_     │ │ payment_       │
    │ activities        │ │ items      │ │ records        │
    ├──────────────────┤ ├────────────┤ ├────────────────┤
    │ id (PK)          │ │ id (PK)    │ │ id (PK)        │
    │ employee_id(FK)  │ │ order_id(FK)
    │ activity_type    │ │ menu_id(FK)│ │ order_id (FK)  │
    │ description      │ │ quantity   │ │ amount         │
    │ order_id (FK)    │ │ unit_price │ │ method         │
    │ timestamp        │ │ timestamp  │ │ status         │
    └──────────────────┘ └────────────┘ │ timestamp      │
                                        └────────────────┘

    ┌────────────────────────┐
    │     settings           │
    ├────────────────────────┤
    │ id (PK)                │
    │ setting_key (UNIQUE)   │
    │ setting_value          │
    │ description            │
    │ timestamps             │
    └────────────────────────┘

    ┌────────────────────────┐
    │     customers          │
    ├────────────────────────┤
    │ id (PK)                │
    │ name                   │
    │ email                  │
    │ phone                  │
    │ address                │
    │ city, state, zip       │
    │ timestamps             │
    └────────────────────────┘
```

---

## 📋 Sample Data Included

After running `npm run db:init`:

### Users
- 1 Admin user (admin/admin123)

### Categories
- Appetizers
- Main Course
- Beverages
- Desserts
- Breads

### Menu Items
- 12 sample items (Samosa, Butter Chicken, Paneer Tikka, etc.)

### Tables
- 8 restaurant tables (T1-T8, different capacities)

### Settings
- Restaurant name, tax rate, currency, hours, phone, email, address

---

## 🔄 API Endpoints

```
Authentication
  POST   /api/auth/register          Register new user
  POST   /api/auth/login             Login user
  POST   /api/auth/create-user       Create user (admin)

Menu
  GET    /api/categories             Get all categories
  POST   /api/categories             Create category (admin)
  GET    /api/menu-items             Get menu items
  POST   /api/menu-items             Create item (admin)

Orders
  POST   /api/orders                 Create order (cashier)
  GET    /api/orders                 Get all orders
  GET    /api/orders/:id             Get order details
  PUT    /api/orders/:id/status      Update status
  GET    /api/kitchen-orders         Get kitchen orders (kitchen)
  GET    /api/orders/:id/print       Print bill

Tables
  GET    /api/tables                 Get all tables
  PUT    /api/tables/:id/status      Update table status

Customers
  GET    /api/customers              Get all customers
  POST   /api/customers              Create customer
  DELETE /api/customers/:id          Delete customer

Employees
  GET    /api/employees              Get all employees
  POST   /api/employees              Create employee (admin)
  GET    /api/employees/activities   Get activities (admin)

Reports
  GET    /api/dashboard-stats        Dashboard statistics
  GET    /api/reports                Get reports (admin)

Settings
  GET    /api/settings               Get settings
  PUT    /api/settings               Update settings (admin)
```

---

## 🔧 Configuration (.env)

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sabarish0227E
DB_NAME=restaurant_management
DB_PORT=3306

# JWT
JWT_SECRET=your_secret_key_here_change_in_production

# Server
PORT=3001
NODE_ENV=development
```

---

## 🧪 Database Testing

### Quick Test
```bash
# Connect to database
mysql -u root -p restaurant_management

# Check tables
SHOW TABLES;

# Check users
SELECT username, role FROM users;

# Check menu items
SELECT name, price FROM menu_items LIMIT 5;

# Check tables
SELECT table_number, capacity FROM tables;
```

### Test API
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get categories (use token from login)
curl -X GET http://localhost:3001/api/categories \
  -H "Authorization: Bearer TOKEN_HERE"
```

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| **DATABASE_SETUP.md** | 455 lines - Complete setup guide, all endpoints, troubleshooting |
| **VERIFICATION_CHECKLIST.md** | 452 lines - Testing procedures, validation tests, query examples |
| **SETUP_SUMMARY.md** | 289 lines - Quick reference, what was done, next steps |
| **SAMPLE_QUERIES.sql** | 270 lines - Ready-to-use SQL queries for all operations |
| **database.sql** | 320 lines - Complete schema with comments |

---

## ✅ Verification

Verify your setup with these commands:

```bash
# 1. Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'restaurant%';"

# 2. Check all tables
mysql -u root -p restaurant_management -e "SHOW TABLES;"

# 3. Check admin user
mysql -u root -p restaurant_management -e "SELECT username, role FROM users;"

# 4. Check menu items
mysql -u root -p restaurant_management -e "SELECT COUNT(*) as items FROM menu_items;"

# 5. Test API
curl http://localhost:3001/api/health
```

---

## 🚀 Next Steps

1. ✅ Run `npm install`
2. ✅ Run `npm run db:init` 
3. ✅ Run `npm run dev`
4. ✅ Login with admin/admin123
5. ✅ Customize admin password
6. ✅ Add your restaurant details
7. ✅ Start creating orders!

---

## ⚠️ Important Notes

- **Change admin password** immediately in production
- **Update JWT_SECRET** in .env file
- **Secure database credentials** - never commit .env
- **Review DATABASE_SETUP.md** for security recommendations
- **Regular backups** recommended for production

---

## 🆘 Need Help?

1. Check **VERIFICATION_CHECKLIST.md** for testing
2. Check **DATABASE_SETUP.md** troubleshooting section
3. Review error messages in terminal
4. Check MySQL is running: `mysql -u root -p -e "SELECT 1;"`

---

## 📞 Key Files to Remember

```
Main Schema:        backend/database.sql
Sample Queries:     backend/SAMPLE_QUERIES.sql
Init Script:        backend/scripts/initDatabase.js
Setup Guide:        DATABASE_SETUP.md
Verification:       VERIFICATION_CHECKLIST.md
Quick Ref:          SETUP_SUMMARY.md
```

---

## 🎉 You're All Set!

Your restaurant management system is complete with:
- ✅ Clean, complete database schema (11 tables)
- ✅ Sample data for testing
- ✅ Automatic initialization script
- ✅ Comprehensive documentation
- ✅ Ready-to-use SQL queries
- ✅ Working API endpoints

**Start building amazing features! 🚀**

---

For detailed information, see **SETUP_SUMMARY.md** or **DATABASE_SETUP.md**
