# TASK: Fix Sign Out Not Working

## Priority: CRITICAL 🔴

## Problem
When a user clicks on their profile dropdown and selects "Sign Out", **nothing happens** - the user remains logged in. This is a critical security and UX issue.

## Current Behavior
1. User clicks on their profile avatar/dropdown
2. Dropdown menu appears with options: "View Profile", "Settings", "Sign Out"
3. User clicks "Sign Out"
4. **Nothing happens** - user stays logged in
5. Page doesn't redirect, user session persists

## Expected Behavior
1. User clicks "Sign Out"
2. User session is cleared (tokens, cookies, localStorage)
3. User is redirected to login page or home page
4. User cannot access protected routes without logging in again

## Files Likely Involved
- Profile dropdown component (contains sign out button)
- `AuthContext.jsx` or authentication context/provider
- Logout API endpoint or auth service
- Routing/navigation guards

## Investigation Needed
1. **Find the sign-out button** in the dropdown menu
2. **Check the onClick handler** - is it calling the right function?
3. **Find the logout/signout function** in AuthContext or auth service
4. **Check if it's clearing**:
   - Cookies (especially the auth token cookie)
   - localStorage/sessionStorage
   - Auth context state
5. **Check if it's calling the backend** logout endpoint
6. **Check if there's proper redirect** after logout

## Possible Root Causes
- Sign out onClick handler is missing or not connected
- Logout function exists but has bugs (not clearing state properly)
- API call to logout endpoint is failing silently
- Cookies not being cleared due to httpOnly flag
- State not being updated in AuthContext
- No redirect after logout
- Event handler not being triggered

## Related Files to Check
- `kalasetu-frontend/src/context/AuthContext.jsx`
- Profile dropdown/header component
- `kalasetu-frontend/src/lib/axios.js` (for API calls)
- Backend: `kalasetu-backend/routes/authRoutes.js` (logout endpoint)
- Backend: `kalasetu-backend/controllers/authController.js`

## Success Criteria
- [ ] User can click "Sign Out" from dropdown
- [ ] User session is completely cleared (cookies, localStorage, state)
- [ ] User is redirected to login page or home
- [ ] User cannot access protected routes without logging in again
- [ ] No console errors during sign out
- [ ] Works for all user types (user, artisan, admin)

## Test Instructions
1. Login as user: `user@test.com / Test@123456`
2. Navigate to any protected page
3. Click profile dropdown
4. Click "Sign Out"
5. Verify:
   - Redirect to login/home page
   - Cannot access protected routes
   - Cookies are cleared
   - Can login again successfully

## Additional Context
- Backend running at: http://localhost:5000
- Frontend running at: http://localhost:5173
- Test Credentials:
  - User: user@test.com / Test@123456
  - Artisan: artisan@test.com / Test@123456
  - Admin: admin@kalasetu.com / Admin@123456

## Notes
This is a **security issue** - users must be able to log out properly.
