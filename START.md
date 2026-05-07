# Quick Start Guide - Restaurant Management System

## 🚀 Fastest Way to Start (Recommended)

Open your terminal and run from the project root:

```bash
npm run dev
```

That's it! This will automatically:
- Start backend server on `http://localhost:3001`
- Start frontend on `http://localhost:3000`
- Both will run simultaneously with hot reload

**Open your browser to:** http://localhost:3000

---

## Alternative: Start Backend & Frontend Separately

### Option A: Backend from Root Directory

```bash
npm run backend
```

Server runs on: `http://localhost:3001`

Then in another terminal:
```bash
npm run dev
# or
next dev
```

Frontend runs on: `http://localhost:3000`

### Option B: Backend from Backend Folder

```bash
cd backend
node server.js
```

Server runs on: `http://localhost:3001`

Then in another terminal from root:
```bash
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## Initial Setup (First Time Only)

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run db:init
```

### 3. Create Admin Account
```bash
npm run db:create-admin
```

### 4. Start Application
```bash
npm run dev
```

---

## 🔐 Login Credentials

After initialization, use these to login:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Cashier | cashier | cashier123 |
| Kitchen | kitchen | kitchen123 |

---

## Troubleshooting

### "No token provided" Error
- This means you're not logged in
- Go to http://localhost:3000 and login first

### Backend Won't Start
1. Check if MySQL is running
2. Verify port 3001 is free: `lsof -i :3001` (Mac/Linux)
3. Check `.env` file has correct database credentials

### "Failed to connect to database"
1. Make sure MySQL service is running
2. Verify credentials in `.env`
3. Run: `npm run db:init` to create tables

### Port Already in Use
If port 3000 or 3001 is already in use, you can change them in:
- Frontend: Edit `package.json` → `"dev": "next dev -p 3001"` (for port 3001)
- Backend: Edit `.env` → `PORT=3002`

---

## File Locations

- **Frontend Code:** `app/` folder
- **Backend Code:** `backend/` folder
- **Components:** `components/` folder
- **Utilities:** `lib/` folder

---

## Stop the Application

Press `Ctrl + C` in the terminal running the development server
