# Restaurant Management System - Setup Guide

## Project Overview

This is a full-stack restaurant POS (Point of Sale) management system built with:
- **Frontend**: Next.js 16 with React 19
- **Backend**: Express.js with MySQL
- **Authentication**: JWT-based login system

---

## Prerequisites

Before starting, ensure you have:
- Node.js (v18 or higher)
- MySQL Server (v8.0 or higher)
- pnpm package manager

---

## Installation & Setup

### Step 1: Install Dependencies

```bash
cd /vercel/share/v0-project
pnpm install
```

### Step 2: Database Setup

1. **Create the Restaurant Database**

   Open MySQL client and run:
   ```sql
   CREATE DATABASE restaurant;
   ```

2. **Initialize Database Tables**

   The backend will automatically create tables on first connection. Run the SQL script:
   ```bash
   mysql -u root -p restaurant < backend/database.sql
   ```

   Or manually create the tables using the schema file in `backend/database.sql`.

### Step 3: Configure Environment Variables

The `.env` file is already created. Update the database credentials if needed:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=restaurant
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

---

## Creating Admin Account

To create an admin account and other employee accounts, follow these steps:

### Method 1: Using Registration Page (Recommended)

1. Start the application (see "Running the Project" section)
2. Visit: `http://localhost:3000`
3. Click "Register" or go to `/register`
4. Fill in the details:
   - **Full Name**: Your name
   - **Email**: admin@restaurant.com
   - **Username**: admin
   - **Password**: Create a strong password (min 8 characters recommended)
   - **Role**: Select "Admin" from the dropdown
5. Click "Register"
6. Login with your admin credentials

### Method 2: Direct Database Insert (Advanced)

If the registration doesn't work, insert directly into the database:

```sql
-- First, create the password hash (you can generate this using bcryptjs)
-- For password 'admin123', the hash is:
-- $2a$10$YourHashedPasswordHere

INSERT INTO users (
  username, 
  email, 
  password, 
  role, 
  created_at
) VALUES (
  'admin',
  'admin@restaurant.com',
  '$2a$10$yP7IfAR.rDMXnYRzDDwJaOEJFXX0hPx5GUlVpO2LBKfIvLiLNqvbG',  -- password: admin123
  'admin',
  NOW()
);

-- Create employee profile (optional)
INSERT INTO employees (
  user_id,
  first_name,
  last_name,
  phone,
  hire_date
) VALUES (
  (SELECT id FROM users WHERE username = 'admin'),
  'Admin',
  'User',
  '+1234567890',
  NOW()
);
```

### Creating Additional Employees

Via Admin Dashboard:

1. Login as Admin
2. Navigate to: **Admin > Employees**
3. Click **"Add New Employee"** button
4. Fill in the form:
   - **Username**: cashier1, kitchen1, etc.
   - **Email**: cashier@restaurant.com
   - **Password**: Strong password
   - **First Name**: John
   - **Last Name**: Doe
   - **Phone**: +1234567890
   - **Role**: Select "Cashier" or "Kitchen"
5. Click **"Save Employee"**

---

## Running the Project

### Development Mode

Open terminal and run:

```bash
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

### Stop the Server

Press `Ctrl + C` in the terminal.

---

## Default Login Credentials

After setup, use these credentials:

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | admin | admin123 | Admin dashboard, all features |
| Cashier | cashier1 | cashier123 | POS system, order creation |
| Kitchen | kitchen1 | kitchen123 | Order preparation, status updates |

**⚠️ Change these passwords immediately in production!**

---

## System Roles & Features

### Admin
- Dashboard with sales analytics
- Employee management
- Employee activity monitoring
- Menu and category management
- Order management
- Customer records
- Reports and analytics
- System settings

### Cashier
- Create and process orders
- View menu categories and items
- Manage current orders
- Process checkout and payments
- Add customers

### Kitchen
- View pending orders
- Update order status
- Manage kitchen workflow

---

## Project Structure

```
restaurant-app/
├── app/                      # Next.js frontend
│   ├── admin/               # Admin dashboard pages
│   ├── cashier/             # Cashier POS interface
│   ├── kitchen/             # Kitchen order management
│   └── layout.tsx           # Root layout
├── backend/                 # Express.js API server
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Auth, error handling
│   ├── database.sql         # SQL schema
│   └── server.js            # Express app setup
├── components/              # Reusable React components
├── lib/                     # Utility functions and API
├── public/                  # Static files
└── .env                     # Environment variables
```

---

## Common Issues & Troubleshooting

### Issue: Categories Not Showing in Cashier

**Solution:**
1. Ensure database is connected and has menu categories
2. Check browser console for API errors
3. Verify token is being saved in localStorage
4. Make sure backend is running on port 3001

### Issue: Cannot Login

**Solution:**
1. Verify database connection
2. Check username and password are correct
3. Ensure JWT_SECRET is set in .env
4. Check MySQL service is running

### Issue: Employee Activities Page Shows Error

**Solution:**
1. Clear browser cache and localStorage
2. Ensure you're logged in as admin
3. Check that employee data exists in database
4. Verify API endpoints are accessible

### Issue: "API Error: Not Found"

**Solution:**
1. Ensure backend server is running on port 3001
2. Check NEXT_PUBLIC_API_URL in .env is correct
3. Verify routes are properly registered in backend/server.js
4. Check console for specific endpoint errors

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/create-user` - Admin creates user

### Menu
- `GET /api/categories` - Get all categories
- `GET /api/menu-items` - Get menu items
- `POST /api/categories` - Create category (admin only)
- `POST /api/menu-items` - Create menu item (admin only)

### Orders
- `POST /api/orders` - Create order (cashier only)
- `GET /api/orders` - Get orders
- `PUT /api/orders/:id/status` - Update order status

### Employees
- `GET /api/employees` - Get all employees (admin only)
- `GET /api/employees/activities` - Get employee activities (admin only)
- `GET /api/employees/:id/details` - Get employee details (admin only)
- `POST /api/employees` - Create employee (admin only)

### Reports
- `GET /api/reports` - Get sales reports (admin only)
- `GET /api/dashboard-stats` - Get dashboard statistics (admin only)

---

## Database Tables

### users
Stores user login credentials and roles

### employees
Employee information linked to users

### categories
Menu categories (Beverages, Appetizers, etc.)

### menu_items
Individual menu items with prices

### orders
Customer orders and transactions

### order_items
Items within each order

### customers
Customer information for order tracking

### tables
Restaurant table management

---

## Security Notes

1. **Change JWT Secret**: Update JWT_SECRET in .env for production
2. **Database Credentials**: Use strong passwords in production
3. **Environment Variables**: Never commit .env to git
4. **HTTPS**: Enable HTTPS in production
5. **Password Hashing**: All passwords are hashed with bcrypt before storage

---

## Support & Troubleshooting

If you encounter issues:

1. Check the browser console for errors (F12 Dev Tools)
2. Check backend logs in terminal
3. Verify database connection: `mysql -u root -p -e "SELECT 1"`
4. Clear browser cache and localStorage
5. Restart both frontend and backend servers

---

## Next Steps

1. Add menu items and categories through the admin panel
2. Create employee accounts
3. Configure table layout
4. Set up payment processing
5. Customize system settings

Enjoy your restaurant management system!
