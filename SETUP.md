# FoodHub - Setup Guide

## Project Overview
FoodHub is a full-stack restaurant management system built with:
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Backend**: Express.js with MySQL
- **Database**: MySQL (restaurant_management)

---

## Prerequisites

Before you start, ensure you have:
1. **Node.js** (v18 or higher)
2. **MySQL Server** (v5.7 or higher)
3. **npm** or **yarn** (package manager)

---

## Installation Steps

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd foodhub
npm install
```

### 2. Database Setup

First, ensure MySQL is running and create the database:

```bash
# Option A: Via MySQL CLI
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE IF NOT EXISTS restaurant_management;
exit;
```

```bash
# Option B: Via Node.js Script (Recommended)
npm run db:init
```

This will create all necessary tables automatically.

### 3. Configure Environment Variables

The `.env` file is already configured with defaults. Update it if needed:

```bash
# backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_management
JWT_SECRET=your_secure_secret_key_change_this
PORT=3001
```

**Important**: Change `JWT_SECRET` to a secure random string for production!

### 4. Create Admin User

After initializing the database, create your first admin user:

```bash
npm run db:create-admin
```

You'll be prompted to enter:
- Username
- Email
- Password
- Phone (optional)

**Example:**
```
Username: admin
Email: admin@foodhub.com
Password: Admin@123
```

### 5. Start the Development Server

```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000

---

## Project Structure

```
foodhub/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Dashboard pages
│   ├── login/                   # Authentication
│   └── ...
├── backend/                     # Express.js backend
│   ├── config/
│   │   └── db.js               # Database configuration
│   ├── controllers/            # API logic
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   └── masterController.js
│   ├── middleware/
│   │   └── auth.js             # Authentication & authorization
│   ├── scripts/
│   │   ├── initDatabase.js     # Database initialization
│   │   └── createAdmin.js      # Admin user creation
│   └── server.js               # Express server
├── components/                 # React components
├── lib/                       # Utility functions
├── public/                    # Static files
└── package.json              # Dependencies
```

---

## Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run backend` | Start only the backend server |
| `npm run build` | Build the Next.js app for production |
| `npm run start` | Start the production server |
| `npm run db:init` | Initialize the database with all tables |
| `npm run db:create-admin` | Create a new admin user |
| `npm run lint` | Run ESLint |

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/create-user` - Create user (admin only)

### Menu Management
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Menu Items
- `GET /api/menu-items` - Get all menu items
- `POST /api/menu-items` - Create menu item (admin)
- `PUT /api/menu-items/:id` - Update menu item (admin)
- `DELETE /api/menu-items/:id` - Delete menu item (admin)

### Orders
- `POST /api/orders` - Create order (cashier)
- `GET /api/orders` - Get orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Tables
- `GET /api/tables` - Get all tables
- `PUT /api/tables/:id/status` - Update table status

### Customers
- `GET /api/customers` - Get customers
- `POST /api/customers` - Create customer
- `DELETE /api/customers/:id` - Delete customer

### Employees
- `GET /api/employees` - Get employees (admin)
- `POST /api/employees` - Create employee (admin)
- `DELETE /api/employees/:id` - Delete employee (admin)

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings (admin)

### Dashboard
- `GET /api/dashboard-stats` - Get dashboard statistics
- `GET /api/reports` - Get reports (admin)

---

## Troubleshooting

### "Invalid credentials" Error
**Cause**: User doesn't exist in the database
**Solution**: 
1. Ensure database is initialized: `npm run db:init`
2. Create admin user: `npm run db:create-admin`
3. Verify MySQL is running

### "Database connection failed"
**Cause**: MySQL not running or wrong credentials
**Solution**:
1. Start MySQL service
2. Check `.env` file for correct credentials
3. Verify MySQL is accessible on localhost:3306

### "Cannot find module 'mysql2'"
**Cause**: Dependencies not installed
**Solution**:
```bash
npm install
```

### Environment Variables Not Loading
**Cause**: `.env` file issues
**Solution**:
1. Ensure `.env` exists in `backend/` directory
2. Check file syntax (no extra spaces)
3. Restart the dev server

---

## User Roles

The system supports the following roles:

| Role | Permissions |
|------|-----------|
| **admin** | Full access - manage users, menu, orders, settings |
| **cashier** | Create orders, manage customers, process payments |
| **kitchen** | View and manage kitchen orders |
| **manager** | View reports, analytics, manage staff |

---

## Security Notes

⚠️ **Important for Production**:

1. **Change JWT_SECRET**: Generate a secure random string
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use Environment Variables**: Never commit `.env` file
   ```bash
   echo "backend/.env" >> .gitignore
   ```

3. **Database Security**:
   - Use strong passwords for database user
   - Restrict database access to local network
   - Regular backups

4. **API Security**:
   - Enable HTTPS in production
   - Use CORS properly
   - Implement rate limiting
   - Validate all inputs

5. **Password Policy**:
   - Require strong passwords (8+ chars, mixed case, numbers)
   - Never store plain-text passwords
   - Regular password resets

---

## Development Tips

### Adding New API Endpoints
1. Create controller in `backend/controllers/`
2. Add route in `backend/server.js`
3. Apply auth middleware if needed
4. Create frontend component for UI

### Adding New Database Tables
1. Update `backend/scripts/initDatabase.js`
2. Run `npm run db:init`
3. Create corresponding controller
4. Add API routes

### Frontend Development
- Components are in `/components`
- Pages are in `/app`
- Styling uses Tailwind CSS
- Use shadcn/ui components

---

## Support & Help

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check console logs for errors
4. Ensure all dependencies are installed

---

## License

This project is confidential and proprietary.

---

**Last Updated**: May 2, 2026
**Version**: 1.0.0
