# Debug Guide for Recent Issues

## Issue 1: Auto-Logout When Clicking Menu Management

### Root Cause
When clicking "Menu Management", the page calls `categoryApi.getAll()` which requires authentication. If the backend returns a 401 error (token invalid), the API handler was clearing localStorage and redirecting to home page.

### What Was Happening
1. User clicks "Menu Management"
2. fetchData() calls categoryApi.getAll()
3. Backend returns 401 (Unauthorized) 
4. API handler clears token and redirects to "/"
5. User sees "Loading..." then redirected to login

### Fix Applied
**File: `lib/api.ts` (Lines 34-56)**

Changed the 401 handling to:
- Only logout if a token actually exists AND we got a 401
- Check if already on login page before redirecting
- Don't clear credentials if endpoint returns other errors
- Parse error messages from both `message` and `error` fields

**Before:**
```typescript
if (response.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}
```

**After:**
```typescript
if (response.status === 401 && typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('[v0] Token invalid, clearing auth');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
}
```

### Testing
1. Login to admin
2. Click "Menu Management" - should NOT redirect
3. Click "Categories" - should NOT redirect
4. Click other admin pages - should NOT redirect

If issue persists: Check browser console for "Token invalid" message

---

## Issue 2: Failed to Create Order - Empty Error Object

### Root Cause
The error response was returning empty `{}` because:
1. Response content-type might not be JSON
2. Response parsing was catching errors silently
3. Error message structure wasn't being checked properly

### What Was Happening
1. Cashier clicks "Proceed to Checkout"
2. Sends order creation request
3. Server returns error response
4. Frontend tries to parse response
5. If parsing fails, error object is empty
6. Shows "Failed to create order: Unknown error"

### Fix Applied
**File: `app/cashier/page.tsx` (Lines 202-240)**

Added comprehensive error handling:
1. Check content-type before parsing
2. Handle non-JSON responses gracefully
3. Log detailed error information
4. Check for both `message` and `error` fields

**Before:**
```typescript
let responseData;
try {
  responseData = await response.json();
} catch (parseError) {
  console.error('[v0] Failed to parse response:', parseError);
  alert('Failed to create order: Invalid response from server');
  return;
}
```

**After:**
```typescript
let responseData = {};
try {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    console.error('[v0] Non-JSON response:', text);
    responseData = { message: 'Invalid response format from server' };
  }
} catch (parseError) {
  console.error('[v0] Failed to parse response:', parseError);
  responseData = { message: 'Failed to parse server response' };
}
```

### Testing
1. Login as cashier
2. Select table or takeaway
3. Add items to order
4. Click "Proceed to Checkout"
5. Click "Confirm & Print Bill"
6. Check browser console for detailed error messages

If order fails:
- Console will show `[v0] Order creation failed:` with full error details
- Shows `status`, `message`, and response data

---

## How to Verify Fixes

### Check 1: Verify Token is Being Sent
Open browser DevTools (F12) → Network tab
1. Login as admin
2. Click "Menu Management"
3. Look for request to `/api/categories`
4. Check Headers section - should have:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

### Check 2: Monitor Auth Errors
Open browser DevTools → Console tab
1. Login and navigate around
2. Watch for `[v0]` prefixed messages
3. If you see `[v0] Token invalid, clearing auth` - token expired
4. If you see `[v0] Order creation failed:` - detailed error info

### Check 3: Verify Backend Responses
1. Start backend: `npm run backend`
2. Watch backend console for `[v0]` prefixed logs
3. Should see logs like:
   - `[v0] Creating order with data:`
   - `[v0] Order created with ID:`
   - `[v0] Error creating order:` (if there's an error)

---

## Common Error Messages and Solutions

### "Failed to create order: No token provided"
- **Cause**: Token not being sent with request
- **Fix**: Ensure user is logged in, check localStorage has 'token'
- **Check**: DevTools → Application → localStorage → verify 'token' exists

### "Failed to create order: Invalid token"
- **Cause**: Token is malformed or expired
- **Fix**: Logout and login again
- **Check**: Remove 'token' from localStorage and refresh

### "Failed to create order: Unauthorized role"
- **Cause**: User role is not 'cashier' or 'admin'
- **Fix**: User must have cashier or admin role to create orders
- **Check**: Check localStorage → 'user' object → 'role' field

### "Failed to create order: Invalid response format from server"
- **Cause**: Backend is returning non-JSON response
- **Fix**: Check backend is running and responding correctly
- **Check**: Run `curl http://localhost:3001/api/health` in terminal

### "Failed to create order: Failed to parse server response"
- **Cause**: Response body is corrupted or incomplete
- **Fix**: Restart backend server
- **Check**: Check backend console for errors

---

## Quick Debug Checklist

- [ ] Backend is running on port 3001
- [ ] Frontend is running on port 3000
- [ ] NEXT_PUBLIC_API_URL is set to http://localhost:3001/api
- [ ] MySQL database is running
- [ ] Admin user is created in database
- [ ] Token is stored in localStorage after login
- [ ] Token is sent in Authorization header
- [ ] Backend returns JSON responses with proper headers

---

## If Issues Persist

1. **Clear all browser data**
   - DevTools → Application → Clear site data
   - Or use: Ctrl+Shift+Delete

2. **Check environment variables**
   ```bash
   cat .env.local
   ```
   Should have:
   - `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
   - `JWT_SECRET=restaurant_app_secret_key_change_in_production`
   - `DB_PASSWORD=root` (or your MySQL password)

3. **Restart everything**
   ```bash
   # Kill both servers
   pkill node
   
   # Start fresh
   npm run dev
   ```

4. **Check database connection**
   ```bash
   # Test MySQL
   mysql -u root -p
   USE restaurant_db;
   SELECT COUNT(*) FROM users;
   ```

5. **Check API endpoint directly**
   ```bash
   # Get token first (from login)
   TOKEN="your_token_here"
   
   # Test categories endpoint
   curl -H "Authorization: Bearer $TOKEN" \
        http://localhost:3001/api/categories
   ```

---

## Files Modified

1. **lib/api.ts** - Fixed 401 error handling
2. **app/cashier/page.tsx** - Improved error handling and logging
3. **backend/server.js** - Added comment clarifying auth requirement

All changes are backward compatible and improve error handling without breaking existing functionality.
