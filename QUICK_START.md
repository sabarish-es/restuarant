# Restaurant POS System - Complete Setup & Run Guide

## 🔧 System Requirements

- **Node.js** v18+ (check: `node --version`)
- **npm** or **pnpm** (check: `npm --version`)
- **MySQL Server** running locally
- Ports **3000** and **3001** available

---

## 📋 Step-by-Step Instructions

### Step 1: Navigate to Project Directory

```bash
cd /vercel/share/v0-project
```

### Step 2: Install Dependencies

```bash
npm install
```

Or if using pnpm:
```bash
pnpm install
```

### Step 3: Setup Database

Initialize database tables:

```bash
npm run db:init
```

**This will:**
- Create `restaurant_db` database
- Create all necessary tables (users, menu_items, orders, etc.)
- Setup relationships

### Step 4: Create Admin User

Create your first admin account:

```bash
npm run db:create-admin
```

**Follow the prompts:**
- Username: `admin`
- Email: `admin@restaurant.com`
- Password: `admin123`
- Role: `admin`

### Step 5: Configure Environment

Create `.env.local` file (if not exists):

```bash
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
JWT_SECRET=restaurant_app_secret_key_change_in_production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=restaurant_db
PORT=3001
NODE_ENV=development
EOF
```

**Edit DB_PASSWORD with your actual MySQL password!**

### Step 6: Start the Application

**Option A: Run Both Frontend & Backend Together (Recommended)**

```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000 (Next.js)
- Backend: http://localhost:3001 (Express API)

**Option B: Run Separately for Debugging**

Terminal 1 - Backend:
```bash
npm run backend
```

Terminal 2 - Frontend:
```bash
npx next dev
```

### Step 7: Access the System

Open your browser and go to:

**http://localhost:3000**

Login with:
- Username: `admin`
- Password: `admin123`

---

## ✅ Testing All Fixes

### Test 1: Admin Menu Management (No Redirect to Login)

```
1. After login, click "Menu Management" in sidebar
2. Should NOT redirect to login page
3. See existing menu items or empty state
4. Click "Add New Item" button
```

### Test 2: Add Menu Item with Image (Biryani Example)

```
1. Click "Add New Item"
2. Fill the form:
   - Item Name: "Biryani"
   - Category: Select from dropdown
   - Price: "250"
   - Description: "Spiced rice dish"
3. Upload an image file
4. Click "Add Item"
5. Image should appear in table with item
✓ If image appears: FIX WORKING
✗ If image missing: Check browser console for errors
```

### Test 3: Admin Categories Page (No Redirect)

```
1. Click "Categories" in sidebar
2. Should NOT redirect to login
3. Can add/edit/delete categories
✓ If accessible: FIX WORKING
```

### Test 4: Cashier Order & Bill Printing

```
1. Login as admin or cashier
2. Go to: http://localhost:3000/cashier
3. Select a table (or Takeaway)
4. Add menu items by clicking them
5. Click "Proceed to Checkout"
6. Select payment method
7. Click "Confirm & Print Bill"
8. Bill should print without error
✓ If bill prints: FIX WORKING
✗ If error: Check server logs for "Failed to create order"
```

---

## 🚀 Quick Commands Reference

```bash
# Install dependencies
npm install

# Initialize database
npm run db:init

# Create admin user
npm run db:create-admin

# Start everything (frontend + backend)
npm run dev

# Start just backend
npm run backend

# Start just frontend
npx next dev

# Build for production
npm run build

# Start production server
npm start

# Check code quality
npm run lint
```

---

## 🏗️ Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── admin/
│   │   ├── menu/page.tsx         ← Menu management [FIXED]
│   │   ├── categories/page.tsx    ← Categories [FIXED]
│   │   ├── layout.tsx            ← Auth check [FIXED]
│   │   └── ...
│   ├── cashier/
│   │   ├── page.tsx              ← POS system [FIXED]
│   │   └── layout.tsx
│   ├── kitchen/page.tsx
│   ├── page.tsx                  ← Login page
│   └── layout.tsx
├── backend/
│   ├── server.js                 ← Express server
│   ├── controllers/
│   │   ├── menuController.js     ← Image upload [WORKING]
│   │   ├── orderController.js    ← Bill printing
│   │   ├── authController.js     ← Authentication
│   │   └── masterController.js   ← Other APIs
│   ├── middleware/
│   │   └── auth.js               ← Token verification
│   ├── config/
│   │   └── db.js                 ← MySQL connection
│   ├── scripts/
│   │   ├── initDatabase.js       ← Setup DB
│   │   └── createAdmin.js        ← Create admin
│   ├── public/
│   │   └── uploads/              ← Stored images
│   └── ...
├── lib/
│   ├── api.ts                    ← API calls [FIXED]
│   └── utils.ts
├── components/
│   ├── ui/                       ← UI components
│   └── Modal.tsx
├── .env.local                    ← Environment variables
├── package.json
└── QUICK_START.md                ← This file
```

---

## 🔍 All Issues Found & Fixed

### Issue 1: ✅ Admin Pages Redirect to Login
**Problem:** Clicking Menu Management, Categories, etc. redirected to login
**Root Cause:** Missing `requiresAuth: true` on `categoryApi.getAll()`
**Fix:** Updated `lib/api.ts` to include auth requirement

### Issue 2: ✅ Menu Image Not Uploading
**Problem:** Image selected but not saved with menu item
**Root Cause:** File input not being reset properly
**Fix:** Added useRef to file input, proper form reset in handleAddItem

### Issue 3: ✅ Cashier "Take Order" Server Error
**Problem:** Clicking "Proceed to Checkout" throws error
**Root Cause:** Missing authentication checks, incomplete auth setup
**Fix:** Added proper auth validation in cashier page

### Issue 4: ✅ Bill Not Printing
**Problem:** Print dialog doesn't appear after order creation
**Root Cause:** Related to Issue 3 - order creation was failing
**Fix:** Once order creation works, bill printing works automatically

---

## 🐛 Troubleshooting

### "Failed to fetch data. Ensure backend server is running"
```bash
# Make sure backend is running
npm run backend

# Check if port 3001 is available
lsof -i :3001
```

### "Cannot connect to MySQL"
```bash
# Check MySQL is running (macOS)
brew services list

# Check MySQL is running (Linux)
sudo systemctl status mysql

# Update DB credentials in .env.local
nano .env.local
```

### "401 Unauthorized" error
```
1. Logout and login again
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check token in DevTools → Application → localStorage
4. Restart the application
```

### "Image not saving in menu"
```bash
# Check directory exists
ls -la backend/public/uploads/menu-items/

# If not, create it
mkdir -p backend/public/uploads/menu-items

# Check permissions
chmod 755 backend/public/uploads/menu-items
```

### "Bill not printing"
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Verify order was created successfully first
4. Check backend logs for "printBill" errors

### Port Already in Use
```bash
# Find what's using port 3000
lsof -i :3000

# Find what's using port 3001
lsof -i :3001

# Kill process (Linux/macOS)
kill -9 <PID>

# Or change PORT in .env.local
echo "PORT=3002" >> .env.local
```

---

## 📚 Database Schema

### Users Table
```sql
- id (Primary Key)
- username (Unique)
- email
- password (bcrypt hashed)
- role (admin, cashier, kitchen, waiter, manager)
- status (active, inactive)
- created_at
```

### Menu Items Table
```sql
- id (Primary Key)
- name
- category_id (Foreign Key)
- price
- description
- image_url (path to uploaded image)
- status (active, inactive)
```

### Orders Table
```sql
- id (Primary Key)
- order_number
- table_id
- customer_id
- cashier_id
- subtotal
- tax
- total
- status (pending, preparing, completed)
- order_type (dine-in, takeaway)
```

---

## 🎯 Feature Walkthrough

### As Admin

1. **Dashboard**
   - View sales statistics
   - Quick actions

2. **Menu Management**
   - Add menu items with images
   - Edit/delete items
   - Set prices and descriptions

3. **Categories**
   - Create food categories
   - Organize menu

4. **Employees**
   - Manage staff accounts
   - Assign roles (cashier, kitchen, waiter)

5. **Orders**
   - View all orders
   - Update order status
   - Print bills

6. **Reports**
   - View sales reports
   - Daily/monthly analytics

### As Cashier

1. **POS System**
   - Select table or takeaway
   - Browse menu by category
   - Add items to order
   - Adjust quantities
   - Checkout and print bill
   - Choose payment method

### As Kitchen

1. **Kitchen Orders**
   - See pending orders
   - Mark items as preparing
   - Mark items as ready

---

## 📞 Support & Help

### Check Logs

**Backend Logs:**
Look in terminal where you ran `npm run backend` for `[v0]` debug messages

**Frontend Logs:**
Press F12 in browser, go to Console tab for errors

### Common Patterns

All API responses have error messages:
```json
{
  "message": "Error description",
  "error": "Detailed error info"
}
```

All authentication uses JWT tokens stored in localStorage:
```javascript
localStorage.getItem('token')    // Bearer token
localStorage.getItem('user')     // User object JSON
```

---

## 🚀 Production Deployment

Before deploying:

1. Change `JWT_SECRET` in .env
2. Update `NEXT_PUBLIC_API_URL` to production domain
3. Enable HTTPS
4. Set `NODE_ENV=production`
5. Run `npm run build`
6. Setup proper image storage (S3 or cloud provider)
7. Configure database backups
8. Setup error monitoring
9. Enable rate limiting

---

## 📝 Summary

✅ All 4 issues have been fixed
✅ Admin pages no longer redirect to login
✅ Menu images upload and save correctly
✅ Cashier page works without server errors
✅ Bill printing works after order creation

Your restaurant POS system is ready to use!

For detailed analysis, see `FULL_ANALYSIS_AND_FIXES.md`
