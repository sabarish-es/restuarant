# Restaurant Management System - Setup Guide

## Issues Fixed in Code

### 1. **Employee "Unknown column 'role' in 'field list'" - FIXED**
- **Problem**: The backend was trying to insert into `employees.role` column, but the correct column is `employees.position`
- **Fixed in**: `/backend/controllers/masterController.js` line 162
- **Change**: Changed `role` to `position` in the INSERT statement

### 2. **Login Error "Invalid credentials" - CONFIGURATION NEEDED**
- **Cause**: MySQL database is not initialized with users table or admin user doesn't exist
- **Solution**: Follow the database setup steps below

### 3. **Table Names Mismatch - FIXED**
- **Problem**: Code was querying `tables` but schema defined `restaurant_tables`
- **Fixed in**: `/backend/controllers/masterController.js` lines 10, 35
- **Change**: Updated all table queries to use correct `restaurant_tables` name

### 4. **Menu Images Not Showing - FIXED**
- **Fixed in**: `/app/admin/menu/page.tsx`
- **Changes**: 
  - Added image error handling with `failedImages` state
  - Proper URL construction with localhost fallback
  - Fallback emoji display for failed images

---

## Local Setup Instructions

### Step 1: Install MySQL

**On macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**On Windows:**
- Download from https://dev.mysql.com/downloads/mysql/
- Run the installer and complete the setup
- Start MySQL Server from Services or MySQL Workbench

**On Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
```

### Step 2: Verify MySQL Connection

```bash
mysql -u root -p
# Enter your password (default is empty or 'root' depending on your setup)
```

### Step 3: Initialize Database

From the project root directory:

```bash
cd /vercel/share/v0-project
npm run db:init
```

This will:
- Create the `restaurant_management` database
- Create all required tables (users, employees, menu_items, orders, etc.)
- Set up proper indexes and foreign keys

### Step 4: Create Admin User

```bash
npm run db:create-admin
```

Follow the prompts:
- **Username**: admin (or your choice)
- **Email**: admin@example.com (or your choice)
- **Password**: Choose a strong password
- **Phone**: (optional)

### Step 5: Verify Database Setup

```bash
mysql -u root -p restaurant_management
```

Then run these commands to verify tables exist:
```sql
SHOW TABLES;
SELECT * FROM users; -- Should show your admin user
DESCRIBE employees; -- Should show columns: id, user_id, first_name, last_name, position, phone, hire_date, status, created_at, updated_at
```

### Step 6: Update .env File (if needed)

Check `/vercel/share/v0-project/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root  # Change this to your MySQL password
DB_NAME=restaurant_management
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

### Step 7: Start the Application

```bash
cd /vercel/share/v0-project
npm run dev
```

This starts both:
- **Backend Server**: http://localhost:3001
- **Frontend Server**: http://localhost:3000

### Step 8: Login

1. Open http://localhost:3000
2. Login with your admin credentials (created in Step 4)
3. You should be redirected to the admin dashboard

---

## Database Schema Overview

### Tables Created

1. **users** - Stores login credentials and user information
   - Columns: id, username, email, password, role (admin/cashier/kitchen/manager), phone, status

2. **employees** - Stores employee details linked to users
   - Columns: id, user_id (FK), first_name, last_name, **position**, phone, hire_date, status

3. **categories** - Menu categories (Starters, Main Course, Beverages, etc.)

4. **menu_items** - Menu items with prices and descriptions
   - Columns: id, category_id, name, description, price, image_url, status

5. **tables** - Restaurant table management
   - Columns: id, table_number, seats, status (available/occupied/reserved)

6. **customers** - Customer information

7. **orders** - Order records with order items
   - Columns: id, table_id, customer_id, user_id, order_status, total_amount, payment_status

8. **order_items** - Items in each order
   - FK references to orders and menu_items

9. **settings** - Restaurant configuration settings

---

## Code Changes Made

### File 1: `/backend/controllers/masterController.js`

**Line 10**: 
```javascript
// Before:
const [tables] = await connection.execute('SELECT * FROM tables ORDER BY table_number');

// After:
const [tables] = await connection.execute('SELECT * FROM restaurant_tables ORDER BY table_number');
```

**Line 35**:
```javascript
// Before:
await connection.execute('UPDATE tables SET status = ? WHERE id = ?', [status, id]);

// After:
await connection.execute('UPDATE restaurant_tables SET status = ? WHERE id = ?', [status, id]);
```

**Line 162**:
```javascript
// Before:
'INSERT INTO employees (user_id, first_name, last_name, role, phone, hire_date) VALUES (?, ?, ?, ?, ?, ?)',
[userResult.insertId, first_name, last_name, role || 'cashier', phone || null, hire_date || new Date().toISOString().split('T')[0]]

// After:
'INSERT INTO employees (user_id, first_name, last_name, position, phone, hire_date) VALUES (?, ?, ?, ?, ?, ?)',
[userResult.insertId, first_name, last_name, role || 'cashier', phone || null, hire_date || new Date().toISOString().split('T')[0]]
```

### File 2: `/app/admin/menu/page.tsx`

Added `failedImages` state and error handling for image loading:

```typescript
const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

// In image rendering:
{item.image_url && !failedImages.has(item.id) ? (
  <img 
    src={item.image_url.startsWith('http') ? item.image_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${item.image_url}`} 
    alt={item.name} 
    className="w-10 h-10 rounded object-cover" 
    onError={() => {
      setFailedImages(prev => new Set([...prev, item.id]));
    }}
  />
) : (
  <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-xs">🍽️</div>
)}
```

---

## Troubleshooting

### "Connection refused" or "ECONNREFUSED"
- MySQL is not running
- Start MySQL service (see Step 1)

### "Unknown column 'role' in 'field list'" - Still Getting Error
- Ensure you ran `npm run db:init` to create the correct schema
- The database should have the `position` column in employees table

### "Invalid credentials" on login
- Admin user not created yet - run `npm run db:create-admin`
- Check username/password match exactly what you entered

### Images not showing in menu
- Browser may be caching old data - clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check browser DevTools Network tab to see if image requests are succeeding
- Verify `NEXT_PUBLIC_API_URL` is set correctly in .env

### "Username or email already exists"
- When creating employees, ensure username and email are unique
- Check existing employees list first

---

## API Endpoints

All endpoints require authentication (JWT token in Authorization header):

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/register` - Register new user

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee

### Menu Items  
- `GET /api/menu-items` - Get all menu items
- `POST /api/menu-items` - Create menu item
- `PUT /api/menu-items/:id` - Update menu item
- `DELETE /api/menu-items/:id` - Delete menu item

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order

---

## Default Admin Credentials (After Setup)

You'll create these yourself in Step 4, but example:
- **Username**: admin
- **Email**: admin@example.com
- **Password**: (your choice)
- **Role**: admin

---

## Next Steps After Setup

1. Create additional users/employees for different roles (Cashier, Kitchen Staff)
2. Add restaurant settings (name, address, tax rate, etc.)
3. Create menu categories
4. Add menu items with descriptions and images
5. Start creating orders and managing restaurant operations

---

## Support

If you encounter any issues:
1. Check that MySQL is running
2. Verify .env variables are set correctly
3. Check browser console (F12) for error messages
4. Check server logs (terminal output)
5. Ensure all npm dependencies are installed (`npm install`)

