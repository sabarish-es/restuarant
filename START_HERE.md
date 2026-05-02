# Quick Start - Restaurant Management System

## What is this?
A full-stack restaurant management application with admin dashboard, menu management, cashier interface, and order tracking.

## What's the issue?
You're getting a "404 Not Found" error when trying to add a category. This usually means the backend server isn't running.

## Solution - Start Everything (3 Simple Steps)

### Step 1: Install Dependencies (First time only)
```bash
npm install
```

### Step 2: Initialize Database (First time only)
```bash
npm run db:init
```

### Step 3: Run the Project
```bash
npm run dev
```

**That's it!** Both backend and frontend will start automatically.

## Where to Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health (should return `{"status":"ok"}`)

## Default Login
- **Username**: admin
- **Password**: admin123

## If You Still Get 404 Error
1. **Check if both servers are running**
   - You should see 2 logs: one for "Server running on port 3001" and "started server"
   
2. **Verify API URL**
   - The app should connect to `http://localhost:3001/api`
   - Check browser console (F12) for network errors

3. **Check MySQL is running**
   - Ensure MySQL is available on localhost:3306
   - With user: `root` and password: `sabarish0227E`

4. **Reset everything**
   ```bash
   # Stop the server (Ctrl+C)
   # Then run:
   npm run db:init
   npm run dev
   ```

## File Structure
```
project/
├── app/                    # Frontend (Next.js)
│   ├── admin/             # Admin pages
│   └── cashier/           # Cashier page
├── backend/               # Backend (Express)
│   ├── controllers/       # API handlers
│   ├── middleware/        # Authentication
│   └── config/            # Database config
├── components/            # Reusable UI
├── lib/                   # Utilities
├── package.json           # Dependencies
└── SETUP_INSTRUCTIONS.md  # Detailed guide
```

## Available Commands
```bash
npm run dev              # Start everything (backend + frontend)
npm run backend          # Start backend only
npm run build            # Build for production
npm run lint             # Check code
npm run db:init          # Initialize database
npm run db:create-admin  # Create admin user
```

## Need More Help?
See `SETUP_INSTRUCTIONS.md` for detailed troubleshooting and API documentation.
