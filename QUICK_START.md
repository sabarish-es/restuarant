# Restaurant POS System - Quick Start Guide

## System Requirements

- MySQL Server running (with username: `root`, password: `root`)
- Node.js installed
- pnpm installed

## 1. Create Database & Tables

Open MySQL terminal and run:

```bash
mysql -u root -p
```

Then paste:

```sql
CREATE DATABASE restaurant;
USE restaurant;
```

Then copy all contents from `/backend/database.sql` and paste into MySQL to create all tables.

## 2. Install Dependencies

```bash
cd /vercel/share/v0-project
pnpm install
```

## 3. Create Admin Account

### Option A: Quick Setup (Recommended)

Run this SQL command in MySQL:

```sql
USE restaurant;

INSERT INTO users (username, email, password, role) VALUES (
  'admin',
  'admin@restaurant.com',
  '$2a$10$yP7IfAR.rDMXnYRzDDwJaOEJFXX0hPx5GUlVpO2LBKfIvLiLNqvbG',
  'admin'
);

INSERT INTO employees (user_id, first_name, last_name, phone, hire_date) VALUES (
  (SELECT id FROM users WHERE username = 'admin'),
  'Admin',
  'User',
  '+1234567890',
  NOW()
);
```

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

### Option B: Through Registration Page (After Starting App)

1. Start the application (step 4 below)
2. Go to http://localhost:3000/register
3. Fill in details with role as "Admin"
4. Register and login

## 4. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd /vercel/share/v0-project
pnpm dev
```

This will start both:
- Backend on port 3001
- Frontend on port 3000

Wait for both servers to show "ready" status.

## 5. Access the System

Open browser and go to: **http://localhost:3000**

### Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

## 6. Create Test Employees

After login as admin:

1. Go to **Admin Dashboard** → **Employees**
2. Click **"Add New Employee"**
3. Create accounts:
   - **Cashier**: username=`cashier1`, password=`cashier123`, role=Cashier
   - **Kitchen**: username=`kitchen1`, password=`kitchen123`, role=Kitchen

## System Access

### Admin
- Dashboard: http://localhost:3000/admin/dashboard
- Employees: http://localhost:3000/admin/employees
- Activities: http://localhost:3000/admin/activities

### Cashier
- POS System: http://localhost:3000/cashier

### Kitchen
- Kitchen Orders: http://localhost:3000/kitchen

## Troubleshooting

**Categories not showing in Cashier?**
- Verify database has categories (they're auto-created in database.sql)
- Check browser console for errors
- Make sure backend is running

**Login fails?**
- Check MySQL service is running
- Verify admin account was created
- Clear browser cookies and try again

**"API Not Found" error?**
- Ensure backend is running on port 3001
- Check NEXT_PUBLIC_API_URL=http://localhost:3001/api in .env

**Port already in use?**
- Kill process: `lsof -i :3000` and `lsof -i :3001`
- Or change PORT in .env

## Project Structure

```
repository/
├── app/               # Frontend (Next.js)
│   ├── admin/        # Admin pages
│   ├── cashier/      # POS interface
│   └── kitchen/      # Kitchen system
├── backend/          # API Server (Express)
├── SETUP.md          # Detailed setup guide
└── QUICK_START.md    # This file
```

## Features Overview

✅ **Admin**: Dashboard, Employee management, Activities monitoring, Menu management, Orders, Reports
✅ **Cashier**: POS system, Category-based menu, Add orders, Checkout
✅ **Kitchen**: View orders, Update status

## Next Steps

1. Add menu items through Admin → Menu
2. Add customers through Admin → Customers
3. Configure tables in Admin → Tables
4. Start taking orders from Cashier interface
5. View reports in Admin → Reports

---

For detailed setup and troubleshooting, see **SETUP.md**
