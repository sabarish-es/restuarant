# Employee Add Error - Complete Troubleshooting Guide

## Problem: "Server error" when adding employee

### What Was Fixed

1. **Backend Error Handling** (`backend/controllers/masterController.js`)
   - Enhanced `createEmployee()` with detailed error logging
   - Properly handle connection cleanup on errors
   - Extract actual error messages from database errors
   - Detect duplicate username/email errors

2. **Connection Management**
   - Ensure database connections are always released
   - Prevent connection pool exhaustion
   - Better error reporting for connection issues

### How to Debug

#### Step 1: Check Backend Console Logs
When you add an employee, look at the backend terminal output. You should see:
```
[v0] Creating employee with data: { username, email, first_name, last_name, ... }
[v0] User created with ID: X
[v0] Employee created with ID: Y
```

If you see an error:
```
[v0] Error creating employee: <error message>
```

This tells you the exact problem!

#### Step 2: Common Issues

**Issue: "Username or email already exists"**
- Solution: Use a unique username/email
- Database has a unique constraint on these fields

**Issue: "Database connection failed"**
- Solution: Ensure MySQL server is running
- Command: `npm run dev` starts both frontend and backend

**Issue: "Missing required fields"**
- Solution: Fill in all fields: username, email, password, first_name, last_name
- Phone is optional

**Issue: "Duplicate entry"**
- Solution: Check that username and email don't already exist in database

### Testing Checklist

1. Start the project
   ```bash
   npm run dev
   ```

2. Go to Admin → Employees

3. Click "Add Employee"

4. Fill in form:
   - Username: `testuser123`
   - Email: `test@example.com`
   - Password: `Test@123`
   - First Name: `John`
   - Last Name: `Doe`
   - Role: `cashier`
   - Phone: (optional)

5. Click "Add"

6. You should see:
   - Browser alert: "Employee added successfully"
   - Employee appears in the list
   - Backend logs show: "[v0] Employee created with ID: X"

### If Still Getting Error

1. **Check backend is running**
   - Frontend should be on http://localhost:3000
   - Backend should be on http://localhost:3001
   - Visit http://localhost:3001/api/health (should show `{"status":"ok"}`)

2. **Check MySQL is running**
   - Database name: `restaurant_db`
   - User: `root`
   - Password: check `backend/.env`

3. **Check database has tables**
   ```bash
   # From backend directory
   npm run db:init  # Initializes database tables
   ```

4. **Check browser console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for `[v0]` prefixed messages
   - These show the exact error details

### What the Fix Does

The improved error handling now:
- ✅ Logs every step of employee creation
- ✅ Shows actual database error messages
- ✅ Properly detects duplicate username/email
- ✅ Always releases database connections
- ✅ Prevents generic "Server error" messages
- ✅ Makes debugging much easier

### Manual Testing Steps

Test 1 - Valid new employee:
```
Username: emp001
Email: emp001@restaurant.com
Password: Pass123!
First: Alice
Last: Smith
```
✅ Should succeed

Test 2 - Duplicate username:
```
Username: emp001  (same as above)
Email: newemail@restaurant.com
Password: Pass123!
First: Bob
Last: Jones
```
❌ Should fail with "Username or email already exists"

Test 3 - Missing field:
```
Username: emp002
Email: (leave empty)
Password: Pass123!
First: Charlie
Last: Brown
```
❌ Should fail with "Missing required fields"
