# FoodHub - Troubleshooting Guide

## Common Issues and Solutions

### 1. ❌ "Invalid credentials" Error on Login

**Problem**: You enter correct username/password but get "Invalid credentials"

**Root Causes & Solutions**:

#### Solution 1: Admin User Not Created
```bash
# Check if database has users
mysql -u root -p restaurant_management -e "SELECT username FROM users;"

# If empty, create admin user
npm run db:create-admin
```

#### Solution 2: Database Not Initialized
```bash
# Re-initialize database
npm run db:init

# Then create admin
npm run db:create-admin
```

#### Solution 3: Wrong Credentials
- Double-check your username and password (case-sensitive)
- Password must match exactly (no spaces)
- Verify you're using the correct admin account

#### Solution 4: Database Connection Issue
```bash
# Check MySQL is running
# macOS/Linux
mysql -u root -p

# Then type your password and check:
SHOW DATABASES;

# Should show: restaurant_management
```

---

### 2. ❌ "Cannot find module 'mysql2'"

**Problem**: Error when starting backend

```
Error: Cannot find module 'mysql2'
```

**Solution**:
```bash
# Install all dependencies
npm install

# Or install mysql2 specifically
npm install mysql2
```

---

### 3. ❌ "ECONNREFUSED - Connection refused" 

**Problem**: Backend can't connect to MySQL

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions**:

#### Check MySQL is Running
```bash
# macOS
brew services list | grep mysql
brew services start mysql-server

# Windows (if using MySQL service)
# Open Services > MySQL > Start

# Linux
sudo systemctl start mysql
sudo systemctl status mysql

# Docker
docker ps | grep mysql
```

#### Check Database Credentials
Edit `backend/.env`:
```env
DB_HOST=localhost        # or 127.0.0.1
DB_PORT=3306            # default MySQL port
DB_USER=root            # your username
DB_PASSWORD=password    # your password (no password = leave blank)
DB_NAME=restaurant_management
```

#### Test Connection
```bash
mysql -h localhost -u root -p

# Or with password directly (space after -p is important!)
mysql -h localhost -u root -pYOUR_PASSWORD

# Should see:
# mysql>
```

---

### 4. ❌ "Database 'restaurant_management' doesn't exist"

**Problem**: Database tables not created

**Solution**:
```bash
# Initialize database and create all tables
npm run db:init

# Verify tables were created
mysql -u root -p restaurant_management -e "SHOW TABLES;"
```

Expected tables:
```
users
categories
menu_items
tables
customers
orders
order_items
employees
settings
```

---

### 5. ❌ "Port 3001 already in use"

**Problem**: Backend won't start because port 3001 is taken

**Solution**:

#### Find What's Using Port 3001
```bash
# macOS/Linux
lsof -i :3001

# Windows (in PowerShell as Admin)
netstat -ano | findstr :3001
```

#### Kill the Process
```bash
# macOS/Linux
kill -9 <PID>

# Example: kill -9 12345
```

#### Or Use Different Port
Edit `backend/.env`:
```env
PORT=3002  # Use a different port
```

---

### 6. ❌ "NEXT_PUBLIC_API_URL not set"

**Problem**: Frontend can't find backend API

**Solution**: Ensure `.env` in root has:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Restart dev server:
```bash
npm run dev
```

---

### 7. ❌ Admin User Creation Fails

**Problem**: Running `npm run db:create-admin` gives error

**Solutions**:

#### Check Database is Initialized
```bash
npm run db:init
```

#### Check Username Doesn't Exist
```bash
mysql -u root -p restaurant_management -e "SELECT username FROM users WHERE username='admin';"

# If exists, use different username
npm run db:create-admin
```

#### Check User Has Correct Permissions
```bash
mysql -u root -p -e "SELECT user, host, Select_priv, Insert_priv FROM mysql.user WHERE user='root';"
```

---

### 8. ❌ "Cannot GET /api/health" (404 Error)

**Problem**: Backend API not responding

**Checklist**:
- ✅ Is backend running? (Look for "Server running on port 3001")
- ✅ Is frontend trying to reach correct URL? (Check `NEXT_PUBLIC_API_URL`)
- ✅ Are there CORS issues? (Check browser console)

**Test API**:
```bash
curl http://localhost:3001/api/health

# Should return:
# {"status":"ok"}
```

---

### 9. ❌ JWT Token Errors

**Problem**: "Invalid token" or "No token provided"

#### Cause 1: JWT_SECRET Mismatch
- Each time you restart server, if `JWT_SECRET` is different, tokens become invalid
- Ensure `JWT_SECRET` is consistent in `backend/.env`

#### Cause 2: Token Expired
- Tokens expire after 7 days (check authController.js)
- User needs to login again

#### Cause 3: Incorrect Header Format
- Frontend must send: `Authorization: Bearer <token>`
- Not: `Authorization: <token>`

---

### 10. ❌ "EADDRINUSE" or "Port Already in Use"

**Problem**: Both frontend and backend trying to use same port

```bash
# Check what's running on ports
lsof -i :3000      # Frontend
lsof -i :3001      # Backend

# Update PORT in backend/.env if needed
```

---

### 11. ❌ Frontend Can't Connect to Backend

**Problem**: CORS errors in browser console

**Check**:
1. Backend `.env` has correct PORT
2. Frontend `.env` has correct `NEXT_PUBLIC_API_URL`
3. CORS is enabled in `backend/server.js` ✅ Already included

**Example CORS Error**:
```
Access to XMLHttpRequest at 'http://localhost:3001/api/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**: Restart both servers
```bash
npm run dev
```

---

### 12. ❌ Unexpected Token Errors

**Problem**: JSON parsing errors

**Cause**: Sending data in wrong format

**Example Error**:
```
SyntaxError: Unexpected token < in JSON at position 0
```

**Solution**: Ensure you're sending valid JSON
```javascript
// ✅ Correct
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: '123' })
})

// ❌ Wrong
fetch('/api/auth/login', {
  method: 'POST',
  body: { username: 'admin', password: '123' }  // Not JSON!
})
```

---

## Debug Commands

### Verify Database Setup
```bash
# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'restaurant_management';"

# Check tables exist
mysql -u root -p restaurant_management -e "SHOW TABLES;"

# Check users table
mysql -u root -p restaurant_management -e "SELECT id, username, email, role FROM users;"

# Check specific user
mysql -u root -p restaurant_management -e "SELECT * FROM users WHERE username='admin';"
```

### Check Environment Variables
```bash
# Backend env (Linux/macOS)
cat backend/.env

# Windows
type backend\.env

# Check in Node
node -e "require('dotenv').config({path: 'backend/.env'}); console.log(process.env)"
```

### Test Backend API
```bash
# Health check
curl http://localhost:3001/api/health

# Login (replace with your credentials)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'

# Get categories (if you have token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/categories
```

### Check Node/npm Versions
```bash
node --version    # Should be v18+
npm --version
```

---

## Reset Everything

If nothing works, completely reset:

```bash
# 1. Stop both servers (Ctrl+C)

# 2. Drop and recreate database
mysql -u root -p -e "DROP DATABASE restaurant_management;"

# 3. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 4. Initialize fresh database
npm run db:init

# 5. Create admin user
npm run db:create-admin

# 6. Start everything
npm run dev
```

---

## Getting More Help

### Check Log Files
- Browser Console: F12 → Console tab (frontend errors)
- Terminal Output: Backend logs (server errors)

### Common Log Messages

✅ **Good signs**:
```
Server running on port 3001
Connected to database
User logged in successfully
```

❌ **Bad signs**:
```
ECONNREFUSED (database not running)
Cannot find module (dependency missing)
Invalid token (JWT issue)
EADDRINUSE (port in use)
```

---

**Still stuck?** 
1. Check the exact error message
2. Search this guide for the error
3. Try the reset everything steps
4. Check SETUP.md for more details

---

**Last Updated**: May 2, 2026
