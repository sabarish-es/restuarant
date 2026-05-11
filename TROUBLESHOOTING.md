# Troubleshooting Guide

## Quick Fixes

### 1. "Server error" or API Connection Issues

**Symptom**: Any API call fails with "Server error" or "Connection refused"

**Solution**:
```bash
# Make sure backend is running
npm run dev
```

This starts both frontend (3000) and backend (3001).

**Verify backend is working**:
- Open browser to `http://localhost:3001/api/health`
- Should see: `{ "status": "ok" }`

---

### 2. Dashboard Shows "Error Loading Dashboard"

**Symptom**: Dashboard page shows error message

**Possible Causes**:
- Backend server not running (see #1 above)
- Database not connected
- Invalid API token

**Solution**:
1. Check backend is running: `npm run dev`
2. Verify database connection in `.env`
3. Try refreshing the page (Ctrl+R or Cmd+R)
4. Check browser console (F12) for detailed error

**Example Error in Console**:
```
[v0] Dashboard fetch error: Failed to fetch
```
→ Backend not running

```
[v0] Dashboard fetch error: Unauthorized
```
→ Not logged in, try logging out and back in

---

### 3. Menu Edit Shows "Bind parameters must not contain undefined"

**Symptom**: Error when updating menu items

**Solution**: Already fixed! Make sure you have the latest code:
```bash
git pull
```

If issue persists:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page
3. Try again

---

### 4. Category Delete Shows "Server error"

**Symptom**: Cannot delete any category

**Possible Causes**:
- Category has menu items (cannot delete)
- Database connection issue

**Solution**:
1. Check if category has items attached
2. If it does, delete the items first
3. Then delete the category
4. Check backend logs for specific error

**Error Message**:
```
Cannot delete category with existing menu items
```
→ Remove menu items from category first, then try delete

---

### 5. "Failed to fetch employee details" in Activities

**Symptom**: Cannot view employee details

**Solution**:
1. Verify backend is running
2. Check employee exists in database
3. Look at backend logs (should show `[v0] Fetching details for employee: X`)

---

### 6. Bill Not Printing After Order

**Symptom**: Order created but bill won't print

**Possible Causes**:
- Pop-up blocker blocking print window
- Backend bill endpoint not responding
- Browser security issue

**Solution**:
1. Disable pop-up blocker for this site
2. Check backend logs for `[v0] Print bill request for order`
3. Try in a different browser
4. Open Developer Console (F12) to see errors

---

### 7. Orders Not Showing in Admin Page

**Symptom**: Admin orders page is empty

**Possible Causes**:
- No orders created yet
- Backend not running
- Filter set incorrectly

**Solution**:
1. Create an order in Cashier
2. Go back to Admin → Orders
3. Check the "All" filter is selected
4. Refresh page (Ctrl+R)
5. Check browser console for errors

---

## Debug Mode

### Enable Detailed Logging

The application already logs all operations with `[v0]` prefix.

**Check Console Output**:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Watch logs
npm run dev 2>&1 | grep "\[v0\]"
```

### Common Log Messages

**Order Creation**:
```
[v0] Creating order with data: { tableId, customerId, itemCount, orderType, userId }
[v0] Order created with ID: 123
[v0] Order items inserted
```

**Dashboard**:
```
[v0] Fetching dashboard stats...
[v0] Dashboard stats fetched: { totalOrders: 5, totalSales: 2500 }
```

**Menu Update**:
```
[v0] Updating menu item: { id, name, category, price }
```

**Employee Details**:
```
[v0] Fetching details for employee: 5
[v0] Employee found: cashier_name
```

### Database Connection Issues

If you see:
```
[v0] Error releasing connection: Connection lost
```

**Solution**:
1. Check MySQL is running
2. Verify connection string in `.env`
3. Restart backend: `npm run dev`

---

## Database Verification

### Check if Tables Exist

```sql
-- Connect to your database
mysql -u root -p restaurant_db

-- Show all tables
SHOW TABLES;

-- Should see tables like:
-- categories
-- menu_items
-- orders
-- order_items
-- customers
-- employees
-- users
-- tables
-- settings
```

### Check if Data Exists

```sql
-- Check orders
SELECT COUNT(*) as total_orders FROM orders;

-- Check menu items
SELECT COUNT(*) as total_items FROM menu_items;

-- Check categories
SELECT COUNT(*) as total_categories FROM categories;

-- Check customers
SELECT COUNT(*) as total_customers FROM customers;
```

---

## Browser Developer Tools

### Check Network Requests

1. Open Developer Tools (F12 or Right-click → Inspect)
2. Go to **Network** tab
3. Refresh page
4. Look for failed requests (red X)
5. Click on failed request to see error details

### Check Console Errors

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Look for errors (red text with [v0] prefix)
4. Copy the full error message for troubleshooting

---

## Reset Everything

If things are really broken:

```bash
# 1. Stop the server (Ctrl+C in terminal)

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 4. Restart server
npm run dev

# 5. Clear browser cache
# Ctrl+Shift+Delete → Select "All time" → Clear Data

# 6. Refresh browser
# Ctrl+R or Cmd+R
```

---

## Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused` | Backend not running | Run `npm run dev` |
| `Unauthorized` | Not logged in | Login at http://localhost:3000 |
| `Cannot GET /api/...` | Wrong endpoint | Check server.js routes |
| `ENOENT: no such file` | File not found | Check file paths in .env |
| `ER_NO_SUCH_TABLE` | Table doesn't exist | Run database setup script |
| `Access denied for user` | Wrong DB password | Check .env credentials |
| `CORS error` | Backend not allowing requests | Restart backend |

---

## Getting More Help

### Check Logs

Always include:
1. **Backend console output** (when error occurs)
2. **Browser console errors** (F12 → Console)
3. **Network request details** (F12 → Network → Failed Request)
4. **Error messages** (copy full text, including [v0] prefix)

### Files to Check

- `.env` - Database and API configuration
- `backend/server.js` - API endpoints and routing
- `backend/config/db.js` - Database connection
- `lib/api.ts` - Frontend API calls
- Console logs with `[v0]` prefix

---

## Performance Tips

### If App is Slow

1. **Check database**: Large tables can slow queries
   ```sql
   SELECT COUNT(*) FROM orders;  -- Check order count
   ```

2. **Optimize queries**: If many orders, add pagination
3. **Check network**: Slow API responses?
4. **Check browser**: Too many open tabs?

### Database Maintenance

```sql
-- Optimize tables
OPTIMIZE TABLE orders;
OPTIMIZE TABLE order_items;
OPTIMIZE TABLE customers;

-- Check table size
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb 
FROM information_schema.tables 
WHERE table_schema = 'restaurant_db';
```

---

## Next Steps

1. Make sure `npm run dev` is running
2. Refresh your browser
3. Try the operations again
4. If still having issues, check the logs with `[v0]` prefix
5. Verify database is connected and has data

All errors are now logged with clear messages to help you troubleshoot!
