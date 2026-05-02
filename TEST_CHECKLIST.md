# Test Checklist - All Fixes

## Before Testing
1. Run `npm run dev` to start both frontend (3000) and backend (3001)
2. Login with admin credentials: `admin / admin123`
3. Wait for "Backend running on port 3001" message in terminal

## Categories Management ✓
- [ ] Go to Admin → Categories
- [ ] Add new category
  - [ ] Enter category name
  - [ ] Click Add Category
  - [ ] Verify success message
  - [ ] New category appears in list
- [ ] Edit category
  - [ ] Click edit icon
  - [ ] Verify edit modal appears with current data
  - [ ] Update name and save
  - [ ] Verify list updates
- [ ] Delete category
  - [ ] Click delete icon
  - [ ] Confirm deletion
  - [ ] Verify removed from list

## Menu Management - FIXED ✓
- [ ] Go to Admin → Menu Management
- [ ] Verify categories load in dropdown
  - [ ] If empty, create categories first
- [ ] Add new menu item
  - [ ] Enter Name: "Test Pizza"
  - [ ] Select Category: "Any category"
  - [ ] Enter Price: "250"
  - [ ] Enter Description: "Test description"
  - [ ] Click "Add New Item"
  - [ ] **Should see success message** (no JSON parse error)
  - [ ] Item should appear in list
- [ ] Search items
  - [ ] Type in search box
  - [ ] Items should filter
- [ ] Delete item
  - [ ] Click delete icon
  - [ ] Confirm deletion
  - [ ] Verify removed from list

## Employees Management - FIXED ✓
- [ ] Go to Admin → Employees
- [ ] Verify employees load (may be empty)
- [ ] Add new employee
  - [ ] Enter Username: "testuser"
  - [ ] Enter Email: "test@example.com"
  - [ ] Enter Password: "test123"
  - [ ] Enter First Name: "Test"
  - [ ] Enter Last Name: "User"
  - [ ] Select Role: "cashier"
  - [ ] Click "Add Employee"
  - [ ] **Should see success message** (no Internal Server Error)
  - [ ] Employee should appear in list
- [ ] Delete employee
  - [ ] Click delete icon
  - [ ] Confirm deletion
  - [ ] Verify removed from list

## Tables Management - FIXED ✓
- [ ] Go to Admin → Tables
- [ ] **Should load without 404 error**
- [ ] Verify table list displays
- [ ] Change table status
  - [ ] Click status button for a table
  - [ ] Select new status
  - [ ] Verify changes

## API Error Handling Tests

### Network Error Test
1. Stop backend server (Ctrl+C)
2. Try to add a category
3. Should see helpful error message: "Backend server is running on port 3001"
4. Restart backend with `npm run dev`

### Invalid Data Test
1. Try to add employee without filling required fields
2. Should show validation message before making API call

### Field Name Test (Automatic)
- Menu items now convert `category_id` to `categoryId` before sending to backend
- This prevents mismatched field name errors

## Error Message Examples

### Good Error Messages (After Fix)
- "API Error: Internal Server Error" → Shows server error
- "Failed to fetch categories" → Shows specific failure point
- "Make sure the backend server is running on port 3001" → Provides solution

### Bad Error Messages (Fixed)
- ~~"Unexpected token 'S', "Server act"... is not valid JSON"~~ → Fixed
- ~~"API Error: Internal Server Error" (with no details)~~ → Now better handled

## Console Logs to Check

Open browser DevTools (F12) and check Console tab for:
- All [v0] debug messages should be clear and helpful
- No "JSON parse" errors
- Helpful error messages when operations fail

## Performance Check
- [ ] Switching between admin pages is smooth
- [ ] Adding items doesn't freeze the UI
- [ ] Search is responsive
- [ ] Modals open/close smoothly

## Database Check
- [ ] Categories created are saved to database
- [ ] Menu items created are saved
- [ ] Employees created are saved
- [ ] Data persists after page reload

## Final Verification
- [ ] All three main issues are fixed:
  1. Menu add item works (no JSON parse error)
  2. Employee add works (no Internal Server Error)
  3. Tables load (no 404 error)
- [ ] No console errors on admin pages
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] Error handling is user-friendly

## If Tests Fail

### Menu Add Still Failing
1. Check database has categories (no menu items without category)
2. Verify categoryId field is being sent (not category_id)
3. Check backend logs for detailed error

### Employee Add Still Failing
1. Verify all required fields filled
2. Check backend database has `users` and `employees` tables
3. Verify bcrypt is installed in backend

### Tables Still 404
1. Verify backend has `restaurant_tables` table
2. Check auth middleware isn't blocking access
3. Verify token is valid

## Debugging Commands

```bash
# Start backend with verbose logging
npm run dev

# Check if backend is running
curl http://localhost:3001/api/health

# Check token in localStorage (DevTools Console)
console.log(localStorage.getItem('token'))

# Clear localStorage if auth issues
localStorage.clear()
# Then reload page and login again
```

## Success Criteria
All tests should pass without:
- JSON parse errors
- Internal server errors
- 404 errors
- Missing category dropdowns
- Database constraint errors
