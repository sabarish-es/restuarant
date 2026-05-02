# Restaurant Management System - Setup Instructions

## Overview
This is a full-stack restaurant management application built with:
- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js with MySQL database
- **Authentication**: JWT-based with role-based access control

## Prerequisites
- Node.js (v18+) and npm/pnpm installed
- MySQL server running (local or remote)
- Port 3001 available for backend, Port 3000 for frontend

## Step-by-Step Setup

### 1. Install Dependencies
```bash
# Using npm
npm install

# OR using pnpm (recommended)
pnpm install
```

### 2. Configure Environment Variables
The `.env` file is already configured in `backend/.env` with the following variables:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sabarish0227E
DB_NAME=restaurant_management
JWT_SECRET=your_secure_secret_key_change_this_in_production_12345
PORT=3001
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Important**: Update these values based on your environment:
- `DB_HOST`: Your MySQL host
- `DB_USER`: Your MySQL username
- `DB_PASSWORD`: Your MySQL password
- `DB_NAME`: Your database name

### 3. Initialize the Database
```bash
# Create database tables and initial schema
npm run db:init

# Create admin user (optional)
npm run db:create-admin
```

### 4. Start the Development Server
Run both frontend and backend simultaneously:
```bash
npm run dev
```

This command starts:
- **Backend**: Express server on http://localhost:3001
- **Frontend**: Next.js dev server on http://localhost:3000

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **API Health Check**: http://localhost:3001/api/health

## Available Scripts

```bash
# Development (starts both backend and frontend)
npm run dev

# Backend only
npm run backend

# Frontend only
next dev

# Build for production
npm run build

# Start production server
npm start

# Database initialization
npm run db:init
npm run db:create-admin

# Linting
npm run lint
```

## Project Structure

```
.
├── app/                          # Next.js app directory
│   ├── admin/                    # Admin dashboard pages
│   │   ├── categories/           # Category management
│   │   ├── menu/                 # Menu management
│   │   └── layout.tsx
│   ├── cashier/                  # Cashier interface
│   └── layout.tsx
├── backend/
│   ├── config/
│   │   ├── db.js                 # MySQL connection pool
│   │   └── schema.sql            # Database schema
│   ├── controllers/              # API endpoint handlers
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   └── masterController.js
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── scripts/
│   │   ├── initDatabase.js       # Initialize database
│   │   └── createAdmin.js        # Create admin user
│   └── server.js                 # Express server entry point
├── components/                   # Reusable React components
├── lib/
│   └── api.ts                    # API client utilities
├── public/                       # Static files
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/create-user` - Create user (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Menu Items
- `GET /api/menu-items` - Get menu items
- `POST /api/menu-items` - Create menu item (admin)
- `PUT /api/menu-items/:id` - Update menu item (admin)
- `DELETE /api/menu-items/:id` - Delete menu item (admin)

### Orders
- `POST /api/orders` - Create order (cashier)
- `GET /api/orders` - Get orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Other
- `GET /api/tables` - Get restaurant tables
- `GET /api/customers` - Get customers
- `GET /api/employees` - Get employees
- `GET /api/dashboard-stats` - Get dashboard statistics

## Troubleshooting

### "Failed to add category: Server returned 404 Not Found"
**Cause**: Backend server is not running or API URL is incorrect.

**Solution**:
1. Ensure backend server is running: `npm run backend`
2. Verify `NEXT_PUBLIC_API_URL` is set to `http://localhost:3001/api`
3. Check that port 3001 is available
4. Restart the development server: `npm run dev`

### Database Connection Error
**Cause**: MySQL server not running or credentials incorrect.

**Solution**:
1. Ensure MySQL is running on your machine
2. Verify credentials in `backend/.env`
3. Check database exists: `CREATE DATABASE restaurant_management;`
4. Run: `npm run db:init`

### Port Already in Use
**Cause**: Port 3000 or 3001 is already in use.

**Solution**:
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Windows: Use Task Manager or
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Default Login Credentials
After running `npm run db:create-admin`:
- **Username**: admin
- **Password**: admin123
- **Role**: admin

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload. Changes are reflected automatically.

2. **API Testing**: Use tools like Postman or curl to test API endpoints:
   ```bash
   curl -X GET http://localhost:3001/api/health
   ```

3. **Database Inspection**: Connect to MySQL and inspect the `restaurant_management` database:
   ```bash
   mysql -u root -p restaurant_management
   ```

4. **Browser DevTools**: Use Chrome DevTools to inspect Network tab for API calls.

## Next Steps

1. Login with admin credentials
2. Navigate to Admin Dashboard
3. Create menu categories
4. Add menu items to categories
5. Use Cashier module to create orders

## Support

For issues or questions:
1. Check TROUBLESHOOTING section above
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed: `npm install`
4. Clear cache and reinstall: `rm -rf node_modules package-lock.json && npm install`
