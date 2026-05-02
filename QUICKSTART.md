# FoodHub - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Initialize Database
```bash
npm run db:init
```
This creates all necessary tables in MySQL.

### Step 2: Create Admin User
```bash
npm run db:create-admin
```
Follow the prompts to create your first admin account.

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### Step 5: Login
- Use the admin credentials you created in Step 2
- You're ready to go!

---

## 📋 Common Commands

```bash
# Initialize database and create tables
npm run db:init

# Create a new admin/user account
npm run db:create-admin

# Start development (frontend + backend)
npm run dev

# Start only backend
npm run backend

# Build for production
npm run build

# Run production server
npm run start
```

---

## 🔐 Understanding "Invalid credentials" Error

**What it means**: The username/password combination doesn't exist in the database.

**Solutions**:
1. ✅ Did you run `npm run db:create-admin`? 
2. ✅ Is MySQL running?
3. ✅ Did you initialize the database with `npm run db:init`?

**Verification steps**:
```bash
# 1. Check if database exists
mysql -u root -p -e "SHOW DATABASES;"

# 2. Check if tables exist
mysql -u root -p restaurant_management -e "SHOW TABLES;"

# 3. Check if users table has data
mysql -u root -p restaurant_management -e "SELECT username, role FROM users;"
```

---

## 📊 Database Structure

```
restaurant_management/
├── users (admin, cashier, kitchen, manager)
├── categories (food categories)
├── menu_items (individual dishes)
├── orders (customer orders)
├── order_items (items in each order)
├── tables (restaurant tables)
├── customers (customer info)
├── employees (staff members)
└── settings (app settings)
```

---

## 🎯 User Roles

| Role | Can Do |
|------|--------|
| 🔑 **Admin** | Everything - users, menu, orders, settings |
| 💰 **Cashier** | Create orders, manage customers |
| 👨‍🍳 **Kitchen** | View and manage kitchen orders |
| 📊 **Manager** | View reports and analytics |

---

## 🛠️ Environment Variables

All settings are in `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_management

# Security (change this!)
JWT_SECRET=your_secure_key_here

# Server
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📝 What's in This Project?

- **Next.js App**: Modern React frontend with shadcn/ui components
- **Express Backend**: RESTful API for all operations
- **MySQL Database**: Persistent data storage
- **Authentication**: JWT-based user sessions
- **Role-Based Access**: Different permissions for different users

---

## ❓ FAQ

**Q: "Module not found: mysql2"**
A: Run `npm install` to install dependencies

**Q: Database already initialized, want to reset?**
A: Connect to MySQL and run `DROP DATABASE restaurant_management;` then `npm run db:init`

**Q: Want to add another admin?**
A: Run `npm run db:create-admin` again with different credentials

**Q: Changed `.env` but changes not applied?**
A: Restart the dev server with `npm run dev`

---

## 🚨 Troubleshooting

### Backend not starting?
```bash
# Check if port 3001 is in use
lsof -i :3001

# Check MySQL connection
mysql -u root -p restaurant_management
```

### Database errors?
```bash
# Reinitialize database
npm run db:init

# Check database status
mysql -u root -p -e "SELECT DATABASE(); SHOW TABLES;"
```

### Still having issues?
1. Check console output for specific error messages
2. Verify MySQL is running
3. Verify Node.js version (v18+)
4. Check `.env` file for typos

---

## 📚 Next Steps

After setup:
1. Explore the Dashboard
2. Create menu categories
3. Add menu items
4. Create restaurant tables
5. Test creating an order
6. View reports

---

**Need help?** Check `SETUP.md` for detailed documentation!
