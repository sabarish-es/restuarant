# Restaurant App - Full Analysis and Fixes

## Issues Found & Solutions

### Issue 1: Admin Pages Redirecting to Login (Authentication Problem)

**Root Cause:** 
- The admin layout checks for token in `localStorage` on client-side
- If token is missing, it redirects to login
- Auth middleware on backend requires `Authorization` header with token
- Some API calls are missing `requiresAuth: true` flag

**Files Affected:**
- `app/admin/layout.tsx` - Has auth check but incomplete
- `lib/api.ts` - Some API endpoints don't have `requiresAuth: true`

**Solution:**
- Ensure all admin API calls have `requiresAuth: true`
- Fix the auth check in admin layout to properly persist auth state
- Update `categoryApi.getAll()` to use `requiresAuth: true`

---

### Issue 2: Menu Image Not Uploading

**Root Cause:**
- Frontend converts image to base64 data URL but doesn't remove the file after `handleAddItem`
- Backend correctly processes base64 images and saves them
- Issue is in the modal form reset - `formData.image` is set to `null` but the file input isn't cleared

**Files Affected:**
- `app/admin/menu/page.tsx` - handleAddItem function
- `backend/controllers/menuController.js` - Already handles images correctly

**Solution:**
- Clear the file input element manually using useRef
- Ensure the image is properly saved by resetting all form states correctly
- Fix the modal closure to reset file input

---

### Issue 3: Cashier "Take Order" Fails with Server Error

**Root Cause:**
- The API request is missing proper headers
- `categoryApi.getAll()` is called without `requiresAuth: true` but backend expects auth
- Missing error handling for the authorization failure

**Files Affected:**
- `app/cashier/page.tsx` - Fetch functions
- `lib/api.ts` - categoryApi missing auth requirement

**Solution:**
- Fix `categoryApi.getAll()` to include `requiresAuth: true`
- Ensure token is passed in all requests
- Add proper error logging

---

### Issue 4: Bill Not Printing

**Root Cause:**
- The `handlePrintBill` function has correct logic but may fail if order creation fails first
- Bill printing happens AFTER order is confirmed, but error handling shows alert before print

**Solution:**
- The code is actually correct, but users see the "Order created successfully" message
- Print window opens and closes correctly
- Solution: Ensure order creation succeeds first (fix Issue 3)

---

## Setup Instructions

### Prerequisites
- Node.js v18+ (check: `node --version`)
- MySQL Server running
- Port 3000 (Next.js) and 3001 (Backend) available

### Step 1: Database Setup

```bash
# Navigate to project root
cd /vercel/share/v0-project

# Initialize database tables
npm run db:init

# Create admin user
npm run db:create-admin
# Follow prompts: username: admin, password: admin123, role: admin
```

### Step 2: Environment Variables

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
JWT_SECRET=your_secret_key_here_change_in_production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=restaurant_db
PORT=3001
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Run Application

**Option A: Run both frontend and backend together**
```bash
npm run dev
```

**Option B: Run separately (for debugging)**

Terminal 1 - Frontend:
```bash
npm run dev
# or
npx next dev
```

Terminal 2 - Backend:
```bash
npm run backend
# or
node backend/server.js
```

### Step 5: Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Health check: http://localhost:3001/api/health

### Step 6: Login Credentials

After running `npm run db:create-admin`:

**Admin Login:**
- Username: admin
- Password: admin123

**Other Roles Available:**
- cashier
- kitchen
- waiter
- manager

---

## Testing Flow

1. **Admin Dashboard:**
   - Login as admin
   - Navigate to Menu Management
   - Click "Add New Item"
   - Fill form with: Name (e.g., "Biryani"), Category, Price, Description
   - Select image file
   - Click "Add Item"
   - Verify image appears in the table

2. **Cashier:**
   - Login as cashier or admin with cashier access
   - Go to /cashier
   - Select table or takeaway
   - Add menu items
   - Click "Checkout"
   - Confirm payment method
   - Bill should print automatically

3. **Categories:**
   - Admin → Categories
   - Add/Edit/Delete categories
   - Should work without redirecting to login

---

## File Structure

```
restaurant/
├── app/
│   ├── admin/
│   │   ├── menu/page.tsx         (Menu management - FIXED)
│   │   ├── categories/page.tsx   (Categories management)
│   │   └── layout.tsx            (Auth check - FIXED)
│   ├── cashier/page.tsx          (POS system - FIXED)
│   └── layout.tsx
├── backend/
│   ├── controllers/
│   │   ├── menuController.js     (Image upload - Already correct)
│   │   ├── orderController.js    (Order & Bill printing)
│   │   ├── authController.js
│   │   └── masterController.js
│   ├── middleware/auth.js
│   ├── config/db.js
│   └── server.js
├── lib/
│   └── api.ts                    (API calls - FIXED)
├── components/
└── package.json
```

---

## Fixes Applied

1. ✅ Fixed `categoryApi.getAll()` to include `requiresAuth: true`
2. ✅ Fixed menu image upload with proper file input reset
3. ✅ Fixed admin layout auth check
4. ✅ Fixed cashier page API calls
5. ✅ Bill printing will work once order creation succeeds

---

## Debugging Tips

### Check Backend Logs:
```bash
# Server will show [v0] debug logs for:
# - Database connections
# - Image processing
# - API requests
```

### Check Frontend Logs:
```javascript
// Browser console will show:
// [v0] messages for request/response debugging
```

### Common Issues:

1. **"Failed to fetch data. Ensure backend server is running on port 3001"**
   - Start backend: `npm run backend`
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`

2. **"Invalid credentials" at login**
   - Run `npm run db:create-admin` to create test user
   - Check MySQL is running

3. **"404 Not Found" for images**
   - Ensure `public/uploads/menu-items/` directory exists
   - Backend creates it automatically
   - Check file permissions

4. **"401 Unauthorized" on admin pages**
   - Login again, token might be expired
   - Clear localStorage and try again
   - Run `npm run dev` to restart

---

## Production Checklist

- [ ] Change `JWT_SECRET` in .env
- [ ] Update `NEXT_PUBLIC_API_URL` to production URL
- [ ] Set up proper image storage (S3 or Vercel Blob)
- [ ] Configure database backups
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Add proper error monitoring
