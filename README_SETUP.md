# 🍽️ FoodHub Restaurant Management System

A full-stack restaurant management application built with Next.js, Express, and MySQL.

## 🚀 Quick Start (3 Steps)

```bash
# 1. Initialize database
npm run db:init

# 2. Create admin user
npm run db:create-admin

# 3. Start the application
npm run dev
```

Then visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **QUICKSTART.md** | 5-minute setup guide |
| **SETUP.md** | Complete installation & API documentation |
| **TROUBLESHOOTING.md** | Debug guide with 12+ solutions |
| **PROJECT_ANALYSIS.md** | Technical analysis of fixes & improvements |

---

## 🎯 What This Project Does

FoodHub is a complete restaurant management system with:

### Features
- **User Management**: Admin, Cashier, Kitchen, Manager roles
- **Menu Management**: Categories, items, pricing
- **Order Management**: Track orders from order to completion
- **Table Management**: Reserve and manage restaurant tables
- **Customer Management**: Track customer information
- **Employee Management**: Manage staff and permissions
- **Reports & Analytics**: Dashboard with key metrics
- **Settings**: Configure restaurant information

### Technology Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: MySQL 5.7+
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS

---

## 🛠️ Installation

### Prerequisites
- Node.js v18 or higher
- MySQL 5.7 or higher
- npm or yarn

### Setup Steps

1. **Clone Repository**
```bash
git clone <repo-url>
cd foodhub
npm install
```

2. **Configure Environment**
The `.env` file is pre-configured. If needed, edit `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_management
JWT_SECRET=your_secure_key
PORT=3001
```

3. **Initialize Database**
```bash
npm run db:init
```
This creates all necessary tables automatically.

4. **Create Admin User**
```bash
npm run db:create-admin
```
Follow prompts to create your admin account.

5. **Start Development**
```bash
npm run dev
```

---

## 📋 Available Commands

```bash
# Start development (frontend + backend)
npm run dev

# Start only backend
npm run backend

# Initialize database (run once)
npm run db:init

# Create admin user
npm run db:create-admin

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

---

## 🔑 Default Access

After setup, login with credentials created during `npm run db:create-admin`:

```
URL: http://localhost:3000
Username: (what you entered)
Password: (what you entered)
Role: admin
```

---

## 📊 Database Schema

9 main tables:
1. **users** - User accounts & authentication
2. **categories** - Menu categories
3. **menu_items** - Food items with prices
4. **orders** - Customer orders
5. **order_items** - Items within orders
6. **tables** - Restaurant table info
7. **customers** - Customer data
8. **employees** - Staff information
9. **settings** - App configuration

---

## 🔐 User Roles

| Role | Permissions |
|------|------------|
| **Admin** 🔑 | Everything - full system access |
| **Cashier** 💰 | Create orders, manage customers |
| **Kitchen** 👨‍🍳 | View and prepare kitchen orders |
| **Manager** 📊 | View reports and analytics |

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/create-user (admin)
```

### Menu Management
```
GET    /api/categories
POST   /api/categories (admin)
PUT    /api/categories/:id (admin)
DELETE /api/categories/:id (admin)

GET    /api/menu-items
POST   /api/menu-items (admin)
PUT    /api/menu-items/:id (admin)
DELETE /api/menu-items/:id (admin)
```

### Orders
```
POST   /api/orders (cashier)
GET    /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/status
GET    /api/kitchen-orders (kitchen)
```

### Other Resources
```
GET    /api/tables
PUT    /api/tables/:id/status

GET    /api/customers
POST   /api/customers (cashier/admin)
DELETE /api/customers/:id (admin)

GET    /api/employees (admin)
POST   /api/employees (admin)
DELETE /api/employees/:id (admin)

GET    /api/settings
PUT    /api/settings (admin)

GET    /api/dashboard-stats
GET    /api/reports (admin)

GET    /api/health
```

---

## 🐛 Common Issues & Solutions

### "Invalid credentials"
```bash
# Create admin user:
npm run db:create-admin
```

### "Database connection failed"
```bash
# Check MySQL is running and initialize DB:
npm run db:init
```

### "Port 3001 already in use"
Edit `backend/.env`:
```env
PORT=3002  # Use different port
```

### "Module not found"
```bash
npm install
```

See **TROUBLESHOOTING.md** for 12+ detailed solutions.

---

## 📁 Project Structure

```
foodhub/
├── backend/                     # Express.js backend
│   ├── scripts/
│   │   ├── initDatabase.js     # DB setup
│   │   └── createAdmin.js      # Admin creation
│   ├── controllers/            # API logic
│   ├── middleware/             # Auth middleware
│   ├── config/                 # Database config
│   ├── server.js               # Express app
│   └── .env                    # Configuration
│
├── app/                        # Next.js pages
│   ├── dashboard/
│   ├── login/
│   └── ...
│
├── components/                 # React components
├── lib/                       # Utilities
├── styles/                    # Global CSS
├── public/                    # Static files
│
└── Documentation:
    ├── QUICKSTART.md          # 5-min setup
    ├── SETUP.md               # Detailed setup
    ├── TROUBLESHOOTING.md     # Debug guide
    └── PROJECT_ANALYSIS.md    # Technical details
```

---

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Secure session management
- ✅ Proper error handling
- ✅ Environment variable protection

---

## 📈 Performance

- Database connection pooling (10 connections)
- Proper indexes on frequently queried columns
- Optimized queries
- Stateless JWT authentication
- Efficient caching strategies

---

## 🚀 Deployment

### Production Checklist
- [ ] Change `JWT_SECRET` to secure random string
- [ ] Update database password
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Configure CORS origins
- [ ] Set up automated backups
- [ ] Configure monitoring & logging
- [ ] Review security settings
- [ ] Test all API endpoints

### Deploy to Vercel
```bash
# Push to GitHub
git push origin main

# Connect to Vercel
# Vercel will auto-deploy on push
```

---

## 🆘 Need Help?

1. **Quick Start Issues?** → See **QUICKSTART.md**
2. **Setup Problems?** → See **SETUP.md**
3. **Debugging?** → See **TROUBLESHOOTING.md**
4. **Understanding Changes?** → See **PROJECT_ANALYSIS.md**

### Debug Commands
```bash
# Check database
mysql -u root -p restaurant_management -e "SHOW TABLES;"

# Test API
curl http://localhost:3001/api/health

# Check environment
cat backend/.env
```

---

## 💡 Next Steps

After successful setup:

1. **Create Menu**
   - Add categories (Appetizers, Mains, etc.)
   - Add menu items with prices

2. **Configure Restaurant**
   - Add tables
   - Set restaurant info in settings

3. **Add Staff**
   - Create cashier accounts
   - Create kitchen accounts

4. **Test Operations**
   - Create test orders
   - Process payments
   - Generate reports

---

## 📝 Notes

- This is a development setup. For production, additional security measures needed.
- All credentials in `.env` should be changed in production.
- Database backups are recommended.
- Monitor server logs regularly.

---

## 📞 Support

For issues:
1. Check error message in console
2. Search TROUBLESHOOTING.md
3. Verify MySQL is running
4. Check `.env` file
5. Restart dev server

---

## 📜 License

Proprietary - FoodHub Restaurant Management System

---

## 🎉 Ready to Start?

```bash
npm run dev
```

Visit http://localhost:3000 and login with your admin credentials!

---

**Version**: 1.0.0  
**Last Updated**: May 2, 2026  
**Status**: ✅ Ready for Development
