# FoodHub - Setup & Development Workflow

## 🔄 Complete Setup Workflow

```
START
  ↓
[1] npm install
  └─→ Installs all dependencies
  └─→ Creates node_modules
  ↓
[2] npm run db:init
  └─→ Connects to MySQL
  └─→ Creates database if missing
  └─→ Creates 9 tables with relationships
  └─→ Adds indexes and defaults
  ↓
[3] npm run db:create-admin
  └─→ Interactive prompt for admin user
  └─→ Hashes password with bcryptjs
  └─→ Stores in users table
  └─→ Provides user ID confirmation
  ↓
[4] npm run dev
  └─→ Starts backend server (port 3001)
  └─→ Starts frontend server (port 3000)
  └─→ Both in hot-reload mode
  ↓
[5] Open http://localhost:3000
  └─→ Login with admin credentials
  └─→ Access dashboard
  ↓
[6] Start Development
  └─→ Create menu categories
  └─→ Add menu items
  └─→ Configure tables
  └─→ Create staff accounts
  ↓
SUCCESS ✅
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
│           (http://localhost:3000)                            │
│                                                               │
│   ┌─────────────────────────────────────────────────┐       │
│   │    Next.js Frontend (React 19)                   │       │
│   │  - Dashboard                                     │       │
│   │  - Menu Management                               │       │
│   │  - Order Management                              │       │
│   │  - Reports & Analytics                           │       │
│   └──────────────────┬──────────────────────────────┘       │
└──────────────────────┼──────────────────────────────────────┘
                       │
          JSON API (Fetch/REST)
                       │
┌──────────────────────┼──────────────────────────────────────┐
│                      │                                        │
│   ┌────────────────┬─┴──────────────────────────┐          │
│   │  Express Backend (Node.js)                   │           │
│   │  (http://localhost:3001)                     │           │
│   │                                              │           │
│   │  Routes:                                    │           │
│   │  • /api/auth/*      (Authentication)        │           │
│   │  • /api/menu*       (Menu Management)       │           │
│   │  • /api/orders/*    (Order Processing)      │           │
│   │  • /api/tables/*    (Table Management)      │           │
│   │  • /api/customers/* (Customer Data)         │           │
│   │  • /api/employees/* (Staff Management)      │           │
│   │  • /api/reports/*   (Analytics)             │           │
│   │  • /api/settings/*  (Configuration)         │           │
│   │                                              │           │
│   │  Middleware:                                │           │
│   │  • JWT Authentication                       │           │
│   │  • Role-Based Access Control                │           │
│   │  • CORS Configuration                       │           │
│   │                                              │           │
│   └─────────────────────┬──────────────────────┘           │
│                         │                                    │
│                  MySQL Queries                              │
│                         │                                    │
│   ┌─────────────────────┴──────────────────────┐           │
│   │    MySQL Database                          │           │
│   │    (restaurant_management)                 │           │
│   │                                            │           │
│   │  Tables:                                  │           │
│   │  ├─ users (admin, cashier, etc)          │           │
│   │  ├─ categories (menu categories)          │           │
│   │  ├─ menu_items (dishes & pricing)         │           │
│   │  ├─ orders (customer orders)              │           │
│   │  ├─ order_items (items in orders)         │           │
│   │  ├─ tables (restaurant tables)            │           │
│   │  ├─ customers (customer data)             │           │
│   │  ├─ employees (staff info)                │           │
│   │  └─ settings (app configuration)          │           │
│   │                                            │           │
│   │  Features:                                │           │
│   │  • Foreign key relationships              │           │
│   │  • Proper indexing                        │           │
│   │  • Timestamp tracking                     │           │
│   │  • Status enums                           │           │
│   │                                            │           │
│   └────────────────────────────────────────────┘           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
User Login (http://localhost:3000/login)
      ↓
[Enter Credentials]
  username: admin
  password: ****
      ↓
POST /api/auth/login
      ↓
Backend authController
  ├─ Check username in users table
  ├─ Hash & compare password with bcryptjs
  └─ If match:
      ↓
   Generate JWT Token
     {
       id: 1,
       username: "admin",
       role: "admin"
     }
      ↓
Send Token to Frontend
      ↓
Frontend stores token
  (in localStorage or state)
      ↓
Add token to future requests
  Authorization: Bearer <token>
      ↓
Backend validates token
  ├─ Check JWT signature
  ├─ Check expiration (7 days)
  └─ If valid, allow request
      ↓
✅ User Logged In
   Access: Dashboard, Admin Features
```

---

## 📋 Order Processing Workflow

```
New Order
    ↓
[Cashier creates order]
  - Select customer
  - Select table
  - Add menu items
  - Add special notes
    ↓
POST /api/orders
    ↓
Backend creates:
  • Order record (status: pending)
  • Order items records
  • Calculates total
    ↓
Save to Database
    ↓
Frontend shows confirmation
    ↓
Kitchen receives notification
    ↓
[Kitchen staff views order]
  • See items to prepare
  • Mark items as ready
  • Update order status
    ↓
PUT /api/orders/:id/status
  status: "preparing" → "ready" → "served"
    ↓
[Cashier processes payment]
  • Mark as paid
  • Update payment status
    ↓
PUT /api/orders/:id/status
  status: "completed"
    ↓
Order archived
    ↓
✅ Complete
```

---

## 🔑 Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────┐
│         User Login → JWT Token Generated         │
│   Token contains: id, username, role             │
└────────────────────┬────────────────────────────┘
                     ↓
            ┌────────────────┐
            │  Check Role?   │
            └────────┬───────┘
        ┌───────────┼───────────┬─────────────────┐
        ↓           ↓           ↓                 ↓
    ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐
    │  ADMIN  │ │ CASHIER  │ │KITCHEN │ │ MANAGER  │
    ├─────────┤ ├──────────┤ ├────────┤ ├──────────┤
    │ Can:    │ │ Can:     │ │ Can:   │ │ Can:     │
    │ • Manage│ │ • Create │ │ • View │ │ • View   │
    │   users │ │   orders │ │ orders │ │ reports  │
    │ • Edit  │ │ • Manage │ │ • Mark │ │ • View   │
    │   menu  │ │ customers│ │ ready  │ │ analytics│
    │ • View  │ │ • View   │ │ • See  │ │ • View   │
    │ reports │ │ orders   │ │ status │ │ staffing │
    │ • Edit  │ │          │ │        │ │          │
    │ settings│ │          │ │        │ │          │
    └─────────┘ └──────────┘ └────────┘ └──────────┘
        │           │           │           │
        └───────────┴───────────┴───────────┘
                     ↓
        ✅ Grant Access to Appropriate
           Features & API Endpoints
        ❌ Deny Access to Restricted
           Operations
```

---

## 🗄️ Database Relationships

```
users (1)
  ├── (1)──→ (N) orders
  │           └──→ (N) order_items ←──(N) menu_items
  │                                       ├── (N) ← (1) categories
  │
  ├── (1)──→ (1) employees
  │
  └── Creates orders
      └──→ Assigned to tables

customers (1)
  └── (1)──→ (N) orders
              └──→ (N) order_items

tables (1)
  └── (N)←── orders

categories (1)
  └── (1)──→ (N) menu_items
              └──→ (N)←── order_items

menu_items (1)
  └── (N)←── order_items

employees (1)
  └── ←── users (1)
```

---

## 📝 Request/Response Flow

```
Frontend Component
    ↓
User Action (click, submit)
    ↓
fetch() or SWR hook
    ↓
POST /api/orders
Content-Type: application/json
Authorization: Bearer <jwt-token>
Body: {
  table_id: 1,
  customer_id: 1,
  items: [
    { menu_item_id: 5, quantity: 2 },
    { menu_item_id: 8, quantity: 1 }
  ],
  notes: "No onions on burger"
}
    ↓
┌──────────────────────────┐
│   Express Middleware     │
├──────────────────────────┤
│ 1. Parse JSON body       │
│ 2. Validate JWT token    │
│ 3. Check role access     │
│ 4. Verify role is allowed│
│    (cashier role check)  │
└──────────────────────────┘
    ↓
orderController.createOrder()
    ├─ Validate input
    ├─ Check customer exists
    ├─ Check menu items exist
    ├─ Check table available
    └─ Get connection from pool
        ↓
    MySQL Queries:
    1. INSERT INTO orders
       → Returns order ID
    2. INSERT INTO order_items (multiple)
    3. UPDATE tables SET status='occupied'
        ↓
    Commit transaction
        ↓
    Release connection
    ↓
Success Response
{
  success: true,
  orderId: 42,
  total: 45.99,
  items: 3,
  status: "pending"
}
    ↓
200 OK
    ↓
Frontend receives response
    ↓
Update UI
  • Show success message
  • Redirect to order details
  • Update order list
    ↓
✅ Order Created Successfully
```

---

## 🔄 Development Workflow

```
While Developing:
  ↓
[Make code changes]
  • Edit React components
  • Update API routes
  • Modify database queries
  ↓
npm run dev (already running)
  ↓
┌─────────────────────────────────────────┐
│  Hot Module Replacement (HMR)           │
│  ├─ Frontend files: Auto-reload         │
│  ├─ Backend changes: Auto-restart       │
│  └─ Browser syncs without full reload   │
└─────────────────────────────────────────┘
  ↓
See changes immediately
  ↓
[Test in browser]
  • Check functionality
  • View console logs
  • Test edge cases
  ↓
[If database schema changed]
  └─→ npm run db:init (to update schema)
  ↓
[Ready to commit]
  └─→ git add .
  └─→ git commit -m "description"
  └─→ git push origin branch
  ↓
Continue Development...
```

---

## 🚀 Deployment Workflow

```
Local Development
      ↓
[Testing Complete]
      ↓
Push to GitHub
  git push origin main
      ↓
┌──────────────────────────────────────┐
│  Vercel Automatic Deployment         │
│  ├─ Detects push to main             │
│  ├─ Runs build process               │
│  ├─ Tests pass                       │
│  └─ Auto-deploys to production       │
└──────────────────────────────────────┘
      ↓
Production Environment
  ├─ Frontend: Vercel CDN
  ├─ Backend: Vercel Serverless
  └─ Database: Production MySQL
      ↓
✅ Live on Production
  https://yourdomain.com
```

---

## 🛠️ Commands Reference

```
Setup Commands:
  npm install                    Install dependencies
  npm run db:init               Initialize database
  npm run db:create-admin       Create admin user

Development Commands:
  npm run dev                   Start frontend + backend
  npm run backend               Start only backend
  npm run lint                  Check code style

Production Commands:
  npm run build                 Build for production
  npm run start                 Run production server

Database Commands:
  npm run db:init              Recreate all tables
  npm run db:create-admin      Create user via CLI
```

---

## 📊 Data Flow Diagram

```
┌────────────────────────────────────────────────────────┐
│           User Interaction Layer                        │
│  (Frontend Components, Forms, Buttons)                 │
└────────────────────┬─────────────────────────────────┘
                     │
                HTTP/REST
                     │
┌────────────────────┴─────────────────────────────────┐
│           API Layer                                    │
│  (Express Routes, Controllers, Middleware)            │
│                                                        │
│  Handles:                                            │
│  • Request validation                                │
│  • Authentication                                    │
│  • Authorization (RBAC)                              │
│  • Business logic                                    │
│  • Response formatting                               │
└────────────────────┬─────────────────────────────────┘
                     │
                SQL Queries
                     │
┌────────────────────┴─────────────────────────────────┐
│           Data Layer                                   │
│  (MySQL Database)                                     │
│                                                        │
│  Stores:                                             │
│  • Users & Authentication                            │
│  • Menu & Categories                                 │
│  • Orders & Items                                    │
│  • Customers & Tables                                │
│  • Settings & Configuration                          │
└────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist: Getting Started

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Ensure MySQL is running
- [ ] Run `npm run db:init` (database setup)
- [ ] Run `npm run db:create-admin` (create admin)
- [ ] Run `npm run dev` (start servers)
- [ ] Open http://localhost:3000
- [ ] Login with admin credentials
- [ ] Create menu categories
- [ ] Add menu items
- [ ] Configure restaurant tables
- [ ] Start processing orders
- [ ] Check reports and analytics

---

**Ready to build your restaurant management system?**

```bash
npm run dev
```

Visit http://localhost:3000 and login! 🍽️

---

**Last Updated**: May 2, 2026
