# FoodieHub - Restaurant Management System

A complete restaurant management system with admin dashboard, cashier POS interface, and kitchen display system. Built with **Next.js 16**, **React 19**, **Node.js**, **Express**, and **MySQL**.

## Quick Start - 3 SIMPLE STEPS

**👉 See [ADMIN_SETUP_SIMPLE.md](./ADMIN_SETUP_SIMPLE.md) to:**
1. Create admin account (copy-paste SQL command)
2. Start backend server (Terminal 1: `cd backend && node server.js`)
3. Start frontend server (Terminal 2: `npm run dev`)

Then open http://localhost:3000 and login!

**For detailed setup:** See [RUN_FOODHUB.md](./RUN_FOODHUB.md)

## Features

### Admin Dashboard (8 Pages)
- **Dashboard**: Real-time analytics, sales trends, top-selling items
- **Menu Management**: Add/edit/delete menu items with categories and pricing
- **Categories**: Manage menu categories and organization
- **Orders**: Complete order tracking with status filtering
- **Customers**: Customer database and order history
- **Employees**: Staff management and role assignment
- **Tables**: Table status management (Available, Occupied, Reserved, Out of Order)
- **Reports**: Business analytics with charts and metrics
- **Settings**: Restaurant configuration and preferences

### Cashier Interface
- Category-based menu browsing
- Real-time item selection with images
- Current order management with quantity adjustment
- Automatic tax calculation (configurable)
- Order hold and checkout functionality
- Takeaway and dine-in options

### Kitchen Display System (KDS)
- Real-time order display with auto-refresh
- 4-column workflow (New Orders, Preparing, Ready, Completed)
- Order item details and special notes
- Status update buttons for workflow management
- Visual order prioritization

### Authentication & Security
- Three-role system: Admin, Cashier, Kitchen
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control

---

## Project Structure

```
foodhub/
├── backend/                   # Express API server
│   ├── config/               # Database config & schema
│   ├── controllers/          # API controllers
│   ├── middleware/           # Auth middleware
│   ├── .env                  # Environment variables
│   └── server.js             # Main server file
├── app/                      # Next.js frontend (App Router)
│   ├── page.tsx              # Login page
│   ├── admin/                # Admin dashboard pages
│   ├── cashier/              # Cashier POS interface
│   └── kitchen/              # Kitchen display system
├── components/               # Reusable UI components
└── lib/                      # Utilities & API client
```

---

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MySQL with bcryptjs for password hashing

---

## API Endpoints

Core endpoints are available for:
- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Menu**: `/api/categories`, `/api/menu-items`
- **Orders**: `/api/orders`, `/api/kitchen-orders`
- **Management**: `/api/tables`, `/api/customers`, `/api/employees`, `/api/settings`
- **Analytics**: `/api/dashboard-stats`, `/api/reports`

All endpoints are protected with JWT authentication except login.

---

## Setup & Running the Project

**👉 [RUN_FOODHUB.md](./RUN_FOODHUB.md) - Complete step-by-step guide**

Quick reference:
1. Setup MySQL database (see RUN_FOODHUB.md STEP 3)
2. Install backend: `cd backend && npm install`
3. Install frontend: `cd .. && npm install`
4. Start backend: `node server.js` (port 3001)
5. Start frontend: `npm run dev` (port 3000)
6. Access: http://localhost:3000

## Default Credentials

- **Username**: admin
- **Email**: admin@foodhub.com
- **Password**: Set it yourself or reset in database

## Important Notes

1. **Two Terminals Required**: One for backend, one for frontend
2. **Environment File**: Located at `backend/.env` (not project root)
3. **Database**: Must be created before starting (see RUN_FOODHUB.md)
4. **Ports**: Frontend uses 3000, Backend uses 3001

---

**👉 START HERE: [RUN_FOODHUB.md](./RUN_FOODHUB.md)**
