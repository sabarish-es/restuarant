# Database Verification & Testing Checklist

## ✅ Pre-Setup Verification

Before running the database initialization, verify:

### 1. MySQL Server Running
```bash
# Check if MySQL is running
mysql --version
mysql -u root -p -h localhost

# If not running, start it:
# macOS (with Homebrew):
brew services start mysql

# Ubuntu/Linux:
sudo service mysql start

# Windows:
# Open Services and start MySQL80 (or your version)
```

### 2. Node.js & npm Installed
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

### 3. Dependencies Installed
```bash
npm install
```

---

## 🚀 Setup Verification

### Step 1: Environment Configuration
```bash
# Check .env file exists and has correct values
cat .env

# Expected output:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=sabarish0227E
# DB_NAME=restaurant_management
# DB_PORT=3306
# JWT_SECRET=your_secret_key_here
```

### Step 2: Run Database Initialization
```bash
npm run db:init
```

**Expected output:**
```
========================================
  Restaurant - Database Initialization
========================================

Step 1: Connecting to MySQL server...
Host: localhost

✅ Connected to MySQL server

Step 2: Preparing database...
✅ Cleaned up existing database

Step 3: Creating new database and tables...
  ✓ users
  ✓ categories
  ✓ menu_items
  ✓ tables
  ✓ customers
  ✓ orders
  ✓ order_items
  ✓ employees
  ✓ employee_activities
  ✓ payment_records
  ✓ settings
  ✓ Data inserted

========================================
✅ Database initialized successfully!
   Created 11 tables with sample data
========================================
```

---

## 🔍 Post-Setup Verification

### 1. Verify Database Creation
```bash
mysql -u root -p -e "SHOW DATABASES LIKE 'restaurant%';"

# Expected output:
# | Database                |
# | restaurant_management   |
```

### 2. Verify All Tables Created
```bash
mysql -u root -p restaurant_management -e "SHOW TABLES;"

# Expected output:
# | Tables_in_restaurant_management |
# | categories                       |
# | customers                        |
# | employee_activities              |
# | employees                        |
# | menu_items                       |
# | order_items                      |
# | orders                           |
# | payment_records                  |
# | settings                         |
# | tables                           |
# | users                            |
```

### 3. Verify Data Insertion
```bash
mysql -u root -p restaurant_management -e "SELECT COUNT(*) as total FROM users;"

# Expected output:
# | total |
# |   1   |  (admin user)
```

### 4. Verify Admin User
```bash
mysql -u root -p restaurant_management -e "SELECT username, role, status FROM users LIMIT 1;"

# Expected output:
# | username | role  | status |
# | admin    | admin | active |
```

### 5. Verify Categories
```bash
mysql -u root -p restaurant_management -e "SELECT COUNT(*) as total FROM categories;"

# Expected output:
# | total |
# |   5   |  (5 sample categories)
```

### 6. Verify Menu Items
```bash
mysql -u root -p restaurant_management -e "SELECT COUNT(*) as total FROM menu_items;"

# Expected output:
# | total |
# |  12   |  (12 sample items)
```

### 7. Verify Tables
```bash
mysql -u root -p restaurant_management -e "SELECT COUNT(*) as total FROM tables;"

# Expected output:
# | total |
# |   8   |  (8 sample tables)
```

---

## 🧪 Application Testing

### Step 1: Start Backend Server
```bash
npm run backend
# or
node backend/server.js

# Expected output:
# Server running on port 3001
```

### Step 2: Test API Health Check
```bash
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok"}
```

### Step 3: Test Authentication
```bash
# Login with default credentials
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Expected response:
# {
#   "message": "Login successful",
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {
#     "id": 1,
#     "username": "admin",
#     "email": "admin@foodiehub.com",
#     "role": "admin"
#   }
# }
```

### Step 4: Test Get Categories (Protected Route)
```bash
# First, get token from login above, then:
curl -X GET http://localhost:3001/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected response:
# [
#   {
#     "id": 1,
#     "name": "Appetizers",
#     "description": "Starters and appetizers",
#     "status": "active"
#   },
#   ...
# ]
```

### Step 5: Test Get Menu Items
```bash
curl -X GET http://localhost:3001/api/menu-items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected response:
# [
#   {
#     "id": 1,
#     "name": "Samosa",
#     "category_id": 1,
#     "price": "50.00",
#     "category_name": "Appetizers",
#     "status": "active"
#   },
#   ...
# ]
```

### Step 6: Test Get Tables
```bash
curl -X GET http://localhost:3001/api/tables \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected response:
# [
#   {
#     "id": 1,
#     "table_number": "T1",
#     "capacity": 2,
#     "status": "available",
#     "location": "Window"
#   },
#   ...
# ]
```

---

## 🔧 Troubleshooting Tests

### Test 1: Database Connection
```bash
mysql -u root -p -h localhost restaurant_management -e "SELECT 1;"

# If error: Check DB_HOST, DB_USER, DB_PASSWORD in .env
```

### Test 2: User Authentication
```bash
mysql -u root -p restaurant_management \
  -e "SELECT id, username, email FROM users WHERE username='admin';"

# If no results: Admin user was not created
# Solution: Re-run npm run db:init
```

### Test 3: Check Foreign Key Constraints
```bash
mysql -u root -p restaurant_management -e "SHOW ENGINE INNODB STATUS\G" | grep "FOREIGN KEY"

# Should show relationships are intact
```

### Test 4: Verify Indexes
```bash
mysql -u root -p restaurant_management -e "SHOW INDEXES FROM orders;"

# Should show indexes on: id, status, cashier_id, customer_id, table_id, created_at
```

### Test 5: Check Table Relationships
```bash
mysql -u root -p restaurant_management \
  -e "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA='restaurant_management' 
      AND REFERENCED_TABLE_NAME IS NOT NULL;"

# Should show all foreign key relationships
```

---

## 📊 Data Integrity Tests

### Test 1: Verify Cascading Deletes
```bash
# This should work (cascade delete)
mysql -u root -p restaurant_management \
  -e "DELETE FROM orders WHERE id = 999999;"
# Should NOT throw error even if order doesn't exist
```

### Test 2: Verify Foreign Key Constraints
```bash
# This should FAIL (invalid category_id)
mysql -u root -p restaurant_management \
  -e "INSERT INTO menu_items (name, category_id, price) VALUES ('Test', 9999, 100);"

# Expected error: Foreign key constraint fails
```

### Test 3: Verify Unique Constraints
```bash
# This should FAIL (duplicate username)
mysql -u root -p restaurant_management \
  -e "INSERT INTO users (username, email, password, role) VALUES ('admin', 'test@test.com', 'pwd', 'cashier');"

# Expected error: Duplicate entry 'admin' for key 'username'
```

### Test 4: Sample Query Test
```bash
mysql -u root -p restaurant_management \
  -e "SELECT o.id, o.total, c.name as customer, rt.table_number 
      FROM orders o 
      LEFT JOIN customers c ON o.customer_id = c.id 
      LEFT JOIN tables rt ON o.table_id = rt.id LIMIT 5;"

# Should return no results (no sample orders created)
```

---

## ✅ Full Verification Script

Create a file `verify-setup.sh`:

```bash
#!/bin/bash

echo "🔍 Restaurant DB Setup Verification"
echo "===================================="
echo ""

# Check MySQL
echo "1️⃣  Checking MySQL..."
if mysql -u root -p -e "SELECT 1" > /dev/null 2>&1; then
  echo "   ✅ MySQL is running"
else
  echo "   ❌ MySQL is not running"
  exit 1
fi

# Check database
echo "2️⃣  Checking database..."
if mysql -u root -p -e "USE restaurant_management" > /dev/null 2>&1; then
  echo "   ✅ Database exists"
else
  echo "   ❌ Database does not exist"
  exit 1
fi

# Check tables
echo "3️⃣  Checking tables..."
TABLE_COUNT=$(mysql -u root -p restaurant_management -se "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='restaurant_management'")
echo "   ✅ Found $TABLE_COUNT tables"

# Check admin user
echo "4️⃣  Checking admin user..."
ADMIN_COUNT=$(mysql -u root -p restaurant_management -se "SELECT COUNT(*) FROM users WHERE username='admin'")
if [ "$ADMIN_COUNT" -eq 1 ]; then
  echo "   ✅ Admin user exists"
else
  echo "   ❌ Admin user does not exist"
fi

# Check menu items
echo "5️⃣  Checking menu items..."
ITEM_COUNT=$(mysql -u root -p restaurant_management -se "SELECT COUNT(*) FROM menu_items")
echo "   ✅ Found $ITEM_COUNT menu items"

# Check tables
echo "6️⃣  Checking restaurant tables..."
TABLE_COUNT=$(mysql -u root -p restaurant_management -se "SELECT COUNT(*) FROM \`tables\`")
echo "   ✅ Found $TABLE_COUNT restaurant tables"

echo ""
echo "===================================="
echo "✅ All checks passed!"
echo "===================================="
```

Run it:
```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

---

## 🎯 Final Checklist

- [ ] MySQL is installed and running
- [ ] Node.js 18+ is installed
- [ ] .env file is created with correct credentials
- [ ] `npm install` completed successfully
- [ ] `npm run db:init` ran without errors
- [ ] Database `restaurant_management` exists
- [ ] All 11 tables are created
- [ ] Admin user was created (username: admin)
- [ ] Sample data was inserted (categories, menu items, tables)
- [ ] Backend server starts with `npm run dev`
- [ ] API health check works: `/api/health`
- [ ] Authentication works with admin credentials
- [ ] Protected routes require valid token
- [ ] All table relationships are intact

---

## 🚀 Ready to Go!

Once all checks pass, you're ready to:
1. Start the development server: `npm run dev`
2. Access frontend: http://localhost:3000
3. Access backend API: http://localhost:3001
4. Login with admin credentials
5. Start creating orders and managing your restaurant!

---

**Need help?** Refer to DATABASE_SETUP.md for detailed information.
