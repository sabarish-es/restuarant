# 🚀 START HERE - Restaurant Management System

## ⚡ 60-Second Quick Start

```bash
npm install                 # Install dependencies
npm run db:init            # Initialize database
npm run dev                # Start application
# Login: admin / admin123
```

That's it! ✅

---

## 📚 Documentation Guide

Choose what you need:

### 🎯 **Just Want to Start?**
→ Read this file, then run the commands above

### 🔍 **Want to Verify Setup?**
→ Read **VERIFICATION_CHECKLIST.md**
- Pre-setup checks
- Post-setup verification
- API testing examples

### 📖 **Complete Setup Guide?**
→ Read **DATABASE_SETUP.md** (455 lines)
- Full schema documentation
- All API endpoints
- Security recommendations
- Troubleshooting

### 📋 **Quick Reference?**
→ Read **SETUP_SUMMARY.md** (289 lines)
- What was done
- Available commands
- Important files
- Troubleshooting quick fixes

### 🗂️ **Database Overview?**
→ Read **README_DATABASE.md** (361 lines)
- Visual table relationships
- Sample data included
- Configuration guide
- Database testing examples

### 💾 **SQL Queries?**
→ Check **backend/SAMPLE_QUERIES.sql** (270 lines)
- Menu operations
- Order management
- Reporting queries
- Customer management

### 📊 **Database Schema?**
→ Check **backend/database.sql** (320 lines)
- Complete schema
- All 11 tables
- Indexes & constraints
- Sample data SQL

---

## 📁 What You Have

### Database (FIXED ✅)
- ✅ **backend/database.sql** - Clean, complete schema
- ✅ **backend/SAMPLE_QUERIES.sql** - Ready-to-use queries
- ✅ **backend/scripts/initDatabase.js** - Auto-initialization

### Documentation (NEW ✅)
- ✅ **DATABASE_SETUP.md** - Complete guide (455 lines)
- ✅ **VERIFICATION_CHECKLIST.md** - Testing guide (452 lines)
- ✅ **SETUP_SUMMARY.md** - Quick reference (289 lines)
- ✅ **README_DATABASE.md** - Visual guide (361 lines)
- ✅ **START_HERE.md** - This file

### Application Code (WORKING ✅)
- ✅ **backend/server.js** - Express server
- ✅ **backend/controllers/** - API handlers
- ✅ **backend/middleware/** - Auth middleware
- ✅ Frontend (Next.js) - Ready to use

---

## 🎯 Quick Overview

### Database (11 Tables)
```
users → employees → employee_activities
categories → menu_items → order_items → orders
            tables →/         ↓
            customers →/  payment_records
                        ↓
                    settings
```

### Default Login
```
Username: admin
Password: admin123
Role: admin
```

### Access Points
```
Frontend:  http://localhost:3000
Backend:   http://localhost:3001
API Health: http://localhost:3001/api/health
```

---

## 🚀 Getting Started

### Step 1: Install
```bash
npm install
```

### Step 2: Initialize Database
```bash
npm run db:init
```

**You should see:**
```
✅ Database initialized successfully!
   Created 11 tables with sample data
```

If you get an error:
1. Check MySQL is running
2. Check .env credentials are correct
3. See VERIFICATION_CHECKLIST.md

### Step 3: Start Application
```bash
npm run dev
```

This starts:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001

### Step 4: Login
- Username: `admin`
- Password: `admin123`

---

## 🔑 Important: Change Default Credentials!

After first login, change the admin password immediately!

```bash
# In the admin panel, update password
# Or use SQL:
mysql -u root -p restaurant_management \
  -e "UPDATE users SET password = SHA2('your_new_password', 256) WHERE username='admin';"
```

---

## 📊 What's Included

### Tables (11 Total)
1. **users** - Authentication
2. **categories** - Menu categories
3. **menu_items** - Restaurant menu
4. **tables** - Restaurant tables
5. **customers** - Customer info
6. **orders** - Main orders
7. **order_items** - Items in orders
8. **employees** - Employee details
9. **employee_activities** - Activity logs
10. **settings** - App configuration
11. **payment_records** - Payment tracking

### Sample Data
- 1 admin user
- 5 menu categories
- 12 menu items
- 8 restaurant tables
- 7 settings

---

## 🧪 Test Your Setup

### Quick Test
```bash
# Check database
mysql -u root -p -e "SHOW DATABASES LIKE 'restaurant%';"

# Check tables
mysql -u root -p restaurant_management -e "SHOW TABLES;"

# Test API
curl http://localhost:3001/api/health
```

### Full Test
See **VERIFICATION_CHECKLIST.md** for comprehensive testing

---

## ⚙️ Configuration

### .env File
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sabarish0227E
DB_NAME=restaurant_management
DB_PORT=3306
JWT_SECRET=your_secret_key_here_change_in_production
PORT=3001
NODE_ENV=development
```

### Change if Needed
- **DB_PASSWORD** - Your MySQL root password
- **JWT_SECRET** - Your JWT secret key
- **PORT** - Application port

---

## 🆘 Troubleshooting

### Database Connection Failed
```
Error: connect ECONNREFUSED
```
**Fix:**
1. Ensure MySQL is running
2. Check credentials in .env
3. Verify database port

### Admin User Can't Login
```
Error: Invalid credentials
```
**Fix:**
```bash
mysql -u root -p restaurant_management \
  -e "SELECT * FROM users WHERE username='admin';"
```

### Port Already in Use
```
Error: EADDRINUSE: address already in use :::3001
```
**Fix:**
1. Change PORT in .env
2. Or kill process using the port

### More Help?
See **DATABASE_SETUP.md** - Troubleshooting section

---

## 📋 File Reference

| File | Size | Purpose |
|------|------|---------|
| DATABASE_SETUP.md | 455 lines | Complete documentation |
| VERIFICATION_CHECKLIST.md | 452 lines | Testing guide |
| SETUP_SUMMARY.md | 289 lines | Quick reference |
| README_DATABASE.md | 361 lines | Visual overview |
| backend/database.sql | 320 lines | Database schema |
| backend/SAMPLE_QUERIES.sql | 270 lines | SQL examples |

---

## ✅ Checklist

- [ ] MySQL installed and running
- [ ] Node.js 18+ installed
- [ ] Ran `npm install`
- [ ] .env file configured
- [ ] Ran `npm run db:init` successfully
- [ ] Database `restaurant_management` exists
- [ ] All 11 tables created
- [ ] Admin user created
- [ ] Started app with `npm run dev`
- [ ] Can login with admin/admin123
- [ ] Changed admin password

---

## 🎉 Next Steps

1. ✅ Login to application
2. ✅ Change admin password
3. ✅ Customize restaurant settings
4. ✅ Add your menu items
5. ✅ Configure tables
6. ✅ Train your staff
7. ✅ Start managing orders!

---

## 📞 Need Help?

1. **Quick fixes?** → SETUP_SUMMARY.md
2. **Testing?** → VERIFICATION_CHECKLIST.md
3. **Detailed guide?** → DATABASE_SETUP.md
4. **Overview?** → README_DATABASE.md
5. **SQL examples?** → backend/SAMPLE_QUERIES.sql

---

## 🚀 Ready?

```bash
npm install && npm run db:init && npm run dev
```

Then login with: **admin** / **admin123**

---

## 📚 Complete Documentation

- **START_HERE.md** ← You are here
- **SETUP_SUMMARY.md** - Quick reference
- **DATABASE_SETUP.md** - Complete guide
- **VERIFICATION_CHECKLIST.md** - Testing
- **README_DATABASE.md** - Overview
- **FILES_CREATED.txt** - What was changed

---

**Happy coding! 🚀**

Your restaurant management system is ready to use.
All database conflicts have been resolved and everything is properly documented.

*Last updated: 2026*
