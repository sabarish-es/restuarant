# FoodieHub - Quick Start Guide

## ✅ All Errors Are Fixed!

Your FoodieHub restaurant management system is now fully functional with all reported errors resolved.

---

## Get Started in 3 Steps

### Step 1: Initialize Database (First Time Only)
```bash
npm run db:init
```
This creates the database schema and populates sample data.

### Step 2: Start the Application
```bash
npm run dev
```
This starts both:
- **Frontend:** http://localhost:3000 (Next.js)
- **Backend:** http://localhost:3001 (Node.js API)

### Step 3: Login with Demo Account
- **Username:** `admin`
- **Password:** `admin123`

---

## What's Now Fixed

### ✅ Image Upload (Menu Items)
- **Issue:** "Data too long for column 'image_url'"
- **Status:** FIXED - Images now save as files properly
- **Test:** Go to Admin → Menu → Add New Item → Upload Image

### ✅ Orders Page
- **Issue:** "Incorrect arguments to mysqld_stmt_execute"
- **Status:** FIXED - Orders load without SQL errors
- **Test:** Go to Admin → Orders → See order list

### ✅ Browser Console
- **Issue:** "Attempting to parse unsupported color function 'lab'"
- **Status:** FIXED - All colors converted to standard HSL
- **Test:** Open DevTools (F12) → Console → No errors

### ✅ Debug Output
- **Issue:** Console cluttered with unnecessary logs
- **Status:** FIXED - Removed all debug logging
- **Test:** Console only shows real errors

---

## Feature Testing Checklist

### Menu Management ✅
```
1. Go to Admin → Menu Management
2. Click "Add New Item"
3. Fill in: Name, Category, Price, Description
4. Select an image file
5. Click "Add Item"
✅ Should succeed without errors
✅ Image appears in menu list
```

### Edit Menu Item ✅
```
1. In Menu, click Edit (pencil icon)
2. Change item details
3. Optionally upload new image
4. Click "Update Item"
✅ Changes saved immediately
✅ Image updates correctly
```

### Orders Management ✅
```
1. Go to Admin → Orders
2. View list of all orders
3. Filter by status (Pending, Preparing, etc.)
✅ Orders load without SQL errors
✅ Filtering works correctly
✅ Order details display properly
```

### Create Order ✅
```
1. Go to Cashier Dashboard
2. Click "New Order"
3. Select table and add items
4. Review and print bill
✅ Order creates successfully
✅ Bill prints without errors
```

---

## Database Structure

The system uses MySQL with these main tables:
- `users` - Admin, Cashier, Kitchen staff accounts
- `categories` - Menu categories (Appetizers, Main, etc.)
- `menu_items` - Restaurant menu items with images
- `orders` - Customer orders
- `order_items` - Items within orders
- `tables` - Restaurant table management
- `customers` - Customer information
- `employees` - Staff details
- `settings` - System configuration

---

## Key Endpoints

### Frontend Routes
- `/` - Login page
- `/admin` - Admin dashboard
- `/admin/menu` - Menu management
- `/admin/orders` - Orders management
- `/admin/categories` - Category management
- `/cashier` - Cashier interface
- `/kitchen` - Kitchen display

### API Routes (Backend on :3001)
- `POST /api/auth/login` - User login
- `GET/POST /api/menu-items` - Menu items
- `GET/POST /api/categories` - Categories
- `GET/POST /api/orders` - Orders
- `GET /api/orders/:id/print` - Print bill

---

## Troubleshooting

### Frontend Not Loading
```bash
# Kill any existing processes
ps aux | grep node
kill -9 <PID>

# Start fresh
npm run dev
```

### Database Connection Error
```bash
# Check MySQL is running
# Update .env with correct credentials:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_management
DB_PORT=3306

# Reinitialize
npm run db:init
```

### Port Already in Use
```bash
# If port 3000 or 3001 is in use
# Find and kill the process
lsof -i :3000
lsof -i :3001
kill -9 <PID>

# Or change port in package.json scripts
```

### Image Upload Still Failing
1. Check `/public/uploads/menu-items/` directory exists
2. Verify file permissions (should be writable)
3. Check image file size (should be reasonable, <5MB)

---

## Default Demo Account

```
Username: admin
Password: admin123
Role: Admin
```

This account has access to all features. You can create additional users in the admin panel.

---

## Default Sample Data

The system includes sample data:
- **Categories:** Appetizers, Main Course, Beverages, Desserts, Breads
- **Menu Items:** 12 popular Indian dishes
- **Tables:** 8 restaurant tables
- **Settings:** Tax rate (5%), restaurant name, currency (INR)

---

## Production Deployment

When deploying to production:

1. Change admin password
2. Update database credentials
3. Set proper environment variables
4. Enable HTTPS
5. Set NEXT_PUBLIC_API_URL correctly
6. Create backup of database
7. Test all features thoroughly

---

## File Structure

```
/vercel/share/v0-project/
├── app/                    # Next.js frontend
│   ├── admin/             # Admin pages
│   ├── cashier/           # Cashier interface
│   ├── kitchen/           # Kitchen display
│   └── globals.css        # Styling
├── backend/               # Node.js backend
│   ├── controllers/       # API handlers
│   ├── config/           # Database config
│   ├── server.js         # Express server
│   └── database.sql      # Schema
├── public/               # Static files & uploads
│   └── uploads/          # Menu item images
├── lib/                  # Utilities & API client
└── package.json          # Dependencies
```

---

## Next Steps

1. ✅ Start the app: `npm run dev`
2. ✅ Login with admin/admin123
3. ✅ Create some menu items with images
4. ✅ Create orders and test the workflow
5. ✅ Customize with your restaurant info

---

## Support

All critical errors have been fixed:
- ✅ Image upload working
- ✅ Orders loading correctly
- ✅ No CSS color errors
- ✅ Clean console output

The system is ready for use!

---

**Last Updated:** May 12, 2026
**Status:** All Systems Operational ✅
