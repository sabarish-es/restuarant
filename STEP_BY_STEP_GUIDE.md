# Step-by-Step Guide: Running the Restaurant POS System

## 🚀 Quick Start (5 Minutes)

### Step 1: Open Terminal
```bash
# Navigate to project
cd /vercel/share/v0-project
```

### Step 2: Install Dependencies
```bash
npm install
```
⏱️ Takes 1-2 minutes

### Step 3: Setup Database
```bash
npm run db:init
```
✅ Creates database and tables

### Step 4: Create Admin User
```bash
npm run db:create-admin
```

When prompted, enter:
- **Username:** admin
- **Email:** admin@restaurant.com  
- **Password:** admin123
- **Role:** admin

### Step 5: Start the Application
```bash
npm run dev
```

**You should see:**
```
> next dev
  ▲ Next.js 16.2.4
  - Local:        http://localhost:3000
  
Server running on port 3001
```

### Step 6: Open in Browser
```
http://localhost:3000
```

### Step 7: Login
- **Username:** admin
- **Password:** admin123

✅ **You're in!**

---

## 📋 Detailed Step-by-Step Instructions

### Prerequisite Check

```bash
# Check Node.js (should be v18+)
node --version

# Check npm
npm --version

# Check MySQL is running
mysql -u root -p -e "SELECT 1"
# If MySQL asks for password, enter: root
```

---

### Complete Setup Walkthrough

#### 1️⃣ Navigate to Project

```bash
cd /vercel/share/v0-project
```

Your terminal should show:
```
/vercel/share/v0-project $
```

#### 2️⃣ Create Environment File

```bash
# Copy the template
cp .env.example .env.local 2>/dev/null || cat > .env.local << 'EOF'
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

**Edit .env.local if your MySQL password is different:**
```bash
nano .env.local
# Or
vim .env.local
# Or
code .env.local  # If VS Code is installed
```

Press Ctrl+X (nano) to save.

#### 3️⃣ Install All Dependencies

```bash
npm install
```

You'll see:
```
npm warn deprecated ...
added 500+ packages in 45s
```

#### 4️⃣ Initialize Database

```bash
npm run db:init
```

**Output should show:**
```
[v0] Connecting to database...
[v0] Creating tables...
[v0] Database initialized successfully
```

#### 5️⃣ Create Admin Account

```bash
npm run db:create-admin
```

**Follow the interactive prompts:**
```
? Enter username: admin
? Enter email: admin@restaurant.com
? Enter password: admin123
? Confirm password: admin123
? Select role:
  > Admin
    Cashier
    Kitchen
Admin user created successfully!
```

#### 6️⃣ Start Application

```bash
npm run dev
```

**Wait for output showing BOTH servers running:**
```
> next dev
  ▲ Next.js 16.2.4
  - ready on http://localhost:3000

Server running on port 3001
```

#### 7️⃣ Open Browser

Type in address bar:
```
http://localhost:3000
```

You should see the login page with:
- FoodieHub logo
- Username field
- Password field
- Login button

#### 8️⃣ Login

| Field | Value |
|-------|-------|
| Username | admin |
| Password | admin123 |

Click "Login" button.

#### 9️⃣ You're In! 🎉

You should see the Admin Dashboard with:
- Sidebar with menu items (Dashboard, Menu Management, Categories, etc.)
- Main content area showing statistics
- Top right: Admin profile indicator

---

## ✅ Testing Each Feature (After Login)

### Test 1: Menu Management (No Redirect)

```
1. In sidebar, click "Menu Management"
   Expected: See menu items page (not redirected to login)
   ✓ If shows menu: FIX WORKING
   ✗ If redirected to login: Need to restart

2. Click "Add New Item" button
   Expected: Modal dialog appears

3. Fill the form:
   - Item Name: "Biryani"
   - Category: Select from dropdown
   - Price: "250"
   - Description: "Spiced rice with meat"

4. Click image upload button
   Expected: File picker opens

5. Select an image file (jpg, png, etc.)
   Expected: Image preview appears in the form

6. Click "Add Item" button
   Expected: 
   - Modal closes
   - Alert: "Item added successfully"
   - Item appears in table WITH IMAGE
   ✓ If image shows: FIX WORKING
   ✗ If no image: Check browser console for errors
```

### Test 2: Categories Page (No Redirect)

```
1. Click "Categories" in sidebar
   Expected: Categories page loads (not redirected)
   ✓ If shows: FIX WORKING

2. Click "Add Category"
   Expected: Form appears

3. Enter:
   - Name: "Breads"
   - Description: "Indian breads"

4. Click "Add"
   Expected: Category appears in list
```

### Test 3: Cashier Order System

```
1. Click "Logout" in sidebar

2. Login as cashier:
   (Create one first from Admin → Employees)
   OR use: admin account

3. Go to URL: http://localhost:3000/cashier
   Expected: Table selection modal appears

4. Click any "Available" table
   Expected:
   - Modal closes
   - Menu with items appears
   - Left sidebar shows categories

5. Click on a menu item (e.g., "Biryani")
   Expected: Item added to "Current Order" on right

6. Click "+" button to increase quantity
   Expected: Quantity increases, total updates

7. Add 2-3 more items

8. Click "Proceed to Checkout"
   Expected:
   - Checkout view appears
   - Shows subtotal, tax, total
   - Payment method buttons appear

9. Select payment method (Cash/Card/UPI)
   Expected: Button highlights

10. Click "Confirm & Print Bill"
    Expected:
    - Alert: "Order #ORD... created successfully"
    - NO server error
    - Print dialog appears
    ✓ If bill dialog opens: FIX WORKING
    ✗ If error: Check terminal logs
```

---

## 🛠️ Running Separately (For Debugging)

If you want to run backend and frontend in separate terminals:

### Terminal 1 - Backend Server

```bash
npm run backend
```

Output should show:
```
Server running on port 3001
[v0] Connected to database
```

### Terminal 2 - Frontend (In different terminal)

```bash
npx next dev
```

Output should show:
```
▲ Next.js 16.2.4
  - ready on http://localhost:3000
```

Both must be running for the app to work.

---

## 🐛 If Something Goes Wrong

### Problem: "npm command not found"
```bash
# Install Node.js from nodejs.org
# Then close and reopen terminal
node --version
npm --version
```

### Problem: "Cannot connect to MySQL"
```bash
# Check if MySQL is running (macOS)
brew services list

# Start MySQL if stopped (macOS)
brew services start mysql

# Check MySQL (Linux)
sudo systemctl status mysql

# Start MySQL (Linux)
sudo systemctl start mysql
```

### Problem: "Port 3000 or 3001 already in use"
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env.local
echo "PORT=3002" >> .env.local
```

### Problem: "Failed to fetch categories" error
```bash
1. Make sure backend is running: npm run backend
2. Check .env.local has correct NEXT_PUBLIC_API_URL
3. Restart the application
```

### Problem: "Invalid credentials" on login
```bash
1. Username must be: admin
2. Password must be: admin123
3. If still fails, run: npm run db:create-admin again
```

### Problem: Image not saving in menu
```bash
# Check if directory exists
ls -la backend/public/uploads/menu-items/

# Create if missing
mkdir -p backend/public/uploads/menu-items

# Check permissions
chmod 755 backend/public/uploads/menu-items
```

---

## 📊 Verify Everything Works

### Test Checklist

- [ ] Admin Dashboard loads
- [ ] Can see all menu items without redirect
- [ ] Can add menu item with image
- [ ] Image appears in table
- [ ] Can add categories without redirect
- [ ] Cashier page loads (table selection)
- [ ] Can add items to order
- [ ] Can proceed to checkout without error
- [ ] Bill prints without error
- [ ] Can logout and login again

---

## 📁 Project Structure Overview

```
/vercel/share/v0-project/
│
├── app/                          # Frontend (Next.js)
│   ├── admin/
│   │   ├── menu/page.tsx        # ✅ FIXED - Menu management
│   │   ├── categories/page.tsx  # ✅ FIXED - Categories
│   │   ├── layout.tsx           # ✅ FIXED - Auth check
│   │   └── ...
│   ├── cashier/
│   │   ├── page.tsx             # ✅ FIXED - POS system
│   │   └── layout.tsx
│   ├── kitchen/page.tsx
│   ├── page.tsx                 # Login page
│   └── layout.tsx
│
├── backend/                      # API Server (Express)
│   ├── server.js                # Main server
│   ├── controllers/
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── authController.js
│   │   └── masterController.js
│   ├── middleware/auth.js       # Token verification
│   ├── config/db.js             # Database connection
│   ├── scripts/
│   │   ├── initDatabase.js
│   │   └── createAdmin.js
│   └── public/uploads/          # Stored images
│
├── lib/
│   ├── api.ts                   # ✅ FIXED - API calls
│   └── utils.ts
│
├── components/                  # UI Components
│   ├── ui/                      # shadcn/ui components
│   ├── Modal.tsx
│   └── theme-provider.tsx
│
├── .env.local                   # Environment variables
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
│
├── QUICK_START.md               # Quick guide
├── STEP_BY_STEP_GUIDE.md       # This file
├── ISSUES_ANALYSIS_AND_SOLUTIONS.md  # Detailed analysis
└── FULL_ANALYSIS_AND_FIXES.md   # Complete documentation
```

---

## 🔄 Typical Workflow After Setup

### First Time Setup (Done!)
```
✓ Install dependencies
✓ Initialize database
✓ Create admin user
✓ Start application
```

### Daily Usage

**Start the app:**
```bash
cd /vercel/share/v0-project
npm run dev
```

**Admin:**
```
1. Go to http://localhost:3000
2. Login as admin
3. Add menu items with images
4. Manage employees
5. View reports
```

**Cashier:**
```
1. Go to http://localhost:3000/cashier
2. Select table
3. Add items
4. Checkout
5. Print bill
```

**Kitchen:**
```
1. Go to http://localhost:3000/kitchen
2. See pending orders
3. Mark as preparing
4. Mark as complete
```

---

## 💡 Quick Tips

### Restart Application
```bash
# Press Ctrl+C in terminal (stops the servers)
# Then run again
npm run dev
```

### Clear Browser Cache
```
Chrome: Ctrl+Shift+Delete
Firefox: Ctrl+Shift+Delete
Safari: Develop menu → Empty Web Storage
```

### Check Server Logs
Look in the terminal where you ran `npm run dev` for `[v0]` messages:
```
[v0] Fetching categories...
[v0] Image saved to: /uploads/menu-items/menu-item-123.jpg
[v0] Creating order...
```

### Reset Everything
```bash
# Stop the app (Ctrl+C)
# Then:
npm run db:init      # Reinitialize database
npm run db:create-admin  # Create admin again
npm run dev          # Start fresh
```

---

## ✅ You're Ready!

All issues have been fixed. The system is ready to use.

### Summary of Fixes
1. ✅ Admin pages no longer redirect to login
2. ✅ Menu images upload and display correctly
3. ✅ Cashier system works without server errors
4. ✅ Bills print successfully

### Next Steps
1. Create menu items with images
2. Add employees (cashier, kitchen)
3. Setup tables
4. Start taking orders
5. View reports

### Need Help?
- Check terminal logs for errors
- See ISSUES_ANALYSIS_AND_SOLUTIONS.md for detailed info
- See QUICK_START.md for troubleshooting

**Happy restaurant managing! 🍽️**
