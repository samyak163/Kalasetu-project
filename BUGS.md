# BUGS.md - KalaSetu Issues & Technical Debt

This document catalogs all known bugs, security issues, incomplete features, and technical debt that needs to be addressed.

---

## CRITICAL ISSUES (Fix Immediately)

### 1. MessagesPage ChatContext Missing
**File:** `kalasetu-frontend/src/pages/MessagesPage.jsx`
**Issue:** Imports `useChat` hook that doesn't exist in ChatContext - will crash at runtime
**Fix:** Either create the `useChat` hook in ChatContext or fix the import

### 2. Bookings Page is a Stub
**File:** `kalasetu-frontend/src/pages/dashboard/artisan/Bookings.jsx`
**Issue:** Only shows "Coming soon" message - no actual functionality
**Impact:** Core feature completely missing

### 3. AuthContext Conditional Children Rendering
**File:** `kalasetu-frontend/src/context/AuthContext.jsx:198`
```jsx
{!loading && children}
```
**Issue:** Only renders children when loading is false - can cause hydration mismatch and component mounting issues in SSR/hydration scenarios
**Fix:** Always render children, pass loading state down instead

### 4. N+1 Query Problem in Dashboard
**File:** `kalasetu-backend/controllers/artisanDashboardController.js:15-74`
**Issue:** 7 separate database queries that should be 1-2 aggregation pipelines
```javascript
const activeBookings = await Booking.countDocuments({...});
const completedBookings = await Booking.countDocuments({...});
const completedBookingsData = await Booking.find({...});
const reviewCount = await Review.countDocuments({...});
// ... 3 more queries
```
**Impact:** Severe performance degradation as data grows

### 5. Sensitive Data Not Encrypted
**File:** `kalasetu-backend/models/artisanModel.js:96-106`
**Issue:** Bank account details stored as plain text
```javascript
accountNumber: { type: String, default: '' }, // NOT encrypted!
```
**Fix:** Encrypt PII data at rest using mongoose-encryption or field-level encryption

---

## HIGH PRIORITY ISSUES

### Security Vulnerabilities

#### 6. XSS Vulnerability in Search Results
**File:** `kalasetu-frontend/src/pages/SearchResults.jsx:91-107`
**Issue:** Uses `dangerouslySetInnerHTML` for Algolia highlights without sanitization
**Fix:** Sanitize HTML using DOMPurify before rendering

#### 7. ReDoS Vulnerability
**File:** `kalasetu-backend/controllers/searchController.js:224`
```javascript
{ fullName: { $regex: q, $options: 'i' } }  // Direct user input!
```
**Issue:** User input passed directly to regex without escaping
**Fix:** Use `escapeRegex()` consistently or use MongoDB $text search

#### 8. Webhook Idempotency Missing
**File:** `kalasetu-backend/controllers/paymentController.js:344-356`
**Issue:** No idempotency key checking - duplicate webhook events could cause double-processing payments
**Fix:** Store processed webhook IDs and check before processing

#### 9. Rate Limiting Too Permissive
**File:** `kalasetu-backend/server.js:119-125`
```javascript
max: 1000, // 1000 requests per 15 minutes = 1.1 req/sec per IP
```
**Issue:** Allows brute force attacks on login endpoints
**Fix:** Implement per-endpoint rate limits (stricter on auth routes)

#### 10. Missing Input Sanitization
**File:** `kalasetu-backend/controllers/contactController.js:16-44`
**Issue:** Zod validates length but doesn't strip HTML/script tags
**Risk:** XSS in email templates if data used unsafely

### Authentication & Authorization

#### 11. Firebase Users Skip Email Verification
**File:** `kalasetu-backend/controllers/authController.js:306-310`
**Issue:** New Firebase users get full access immediately without email verification
**Fix:** Implement verification flow for Firebase sign-ups

#### 12. Inconsistent User ID Handling
**File:** `kalasetu-backend/controllers/bookingController.js:10-13`
```javascript
const userId = req.user?._id || req.user?.id;
```
**Issue:** Inconsistent between `_id` and `id` across codebase
**Fix:** Standardize on one field name

#### 13. Wrong Context Usage in Dashboard
**File:** `kalasetu-frontend/src/pages/ArtisanDashboardPage.jsx:6`
**Issue:** Uses `currentUser` which doesn't exist in AuthContext, should use `auth.user`

### Missing Error Handling

#### 14. Silent Failures in Booking Communication Setup
**File:** `kalasetu-backend/controllers/bookingController.js:96-117`
```javascript
try {
  // Stream chat setup
} catch (err) {
  console.error('Failed to prepare Stream chat', err.message);
  // Continues without throwing - user never knows chat failed
}
```

#### 15. Silent Error Catching in Notifications
**File:** `kalasetu-frontend/src/context/NotificationContext.jsx:45,53`
```javascript
catch (_) {}  // Silently swallows all errors
```

#### 16. Webhook Errors Not Retried
**File:** `kalasetu-backend/controllers/paymentController.js:382-388`
**Issue:** Webhook failures logged but not queued for retry - payment state can be inconsistent

---

## MEDIUM PRIORITY ISSUES

### Database Issues

#### 17. Missing Database Indexes
| Model | Missing Index | Query Pattern |
|-------|--------------|---------------|
| `bookingModel.js` | `(user, status)` | User booking list filtering |
| `bookingModel.js` | `(user, createdAt)` | User booking history sorted |
| `bookingModel.js` | `respondedAt` | Filtering responded bookings |
| `paymentModel.js` | `createdAt` | Time-based payment queries |
| `paymentModel.js` | `(payerId, createdAt)` | Payment history queries |

#### 18. Email Validation Regex Too Restrictive
**File:** `kalasetu-backend/models/userModel.js:16-19`
```javascript
match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
```
**Issue:** Doesn't allow `+` tags (user+tag@email.com) or longer TLDs (.museum, .photography)

#### 19. Multiple Update Operations Instead of Bulk
**File:** `kalasetu-backend/controllers/bookingController.js:78-120`
**Issue:** `ensureCommunicationChannels` does multiple separate `updateOne` calls
**Fix:** Use single bulk update operation

### Frontend Component Issues

#### 20. Undefined Component Reference
**File:** `kalasetu-frontend/src/pages/MessagesPage.jsx:89`
**Issue:** References `<CustomChannelPreview />` which is not imported or defined

#### 21. Missing PropTypes Validation
Components missing prop validation:
- `ArtisanSearch.jsx`
- `SearchResults.jsx` (LoadingState, ResultsView, ArtisanCard, ServiceCard)
- `ProfileTab.jsx`
- `ChatInterface.jsx`

#### 22. Image Upload Hardcoded Refresh
**File:** `kalasetu-frontend/src/components/profile/tabs/ProfileTab.jsx:128`
```javascript
window.location.reload()
```
**Issue:** Breaks optimistic updates, poor UX

#### 23. Race Condition in Image Upload
**File:** `kalasetu-frontend/src/components/profile/tabs/ProfileTab.jsx:71-73`
**Issue:** Progress interval not properly cleared if component unmounts during upload

### Memory Leak Risks

#### 24. setTimeout Without Cleanup
**File:** `kalasetu-backend/controllers/authController.js:81-85`
```javascript
setTimeout(() => {
  indexArtisan(artisan).catch(err => {
    console.error('Failed to index artisan');
  });
}, 0);
```
**Issue:** Error objects accumulate if indexArtisan fails repeatedly

#### 25. setImmediate Without Error Handling
**File:** `kalasetu-backend/controllers/userAuthController.js:91-102`
**Issue:** Background user update operations not properly tracked

#### 26. OneSignal Handler Not Cleaned Up
**File:** `kalasetu-frontend/src/hooks/useNotifications.js:23`
**Issue:** `setNotificationClickHandler()` called without cleanup on unmount

### Hardcoded Values

#### 27. Hardcoded Production URL
**File:** `kalasetu-frontend/src/config/env.config.js:9`
```javascript
'https://kalasetu-api-k2d8.onrender.com'
```

#### 28. Hardcoded Localhost Fallback
**File:** `kalasetu-backend/controllers/authController.js:254`
```javascript
const resetUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/reset-password`;
```

#### 29. Debug Logging in Production
**File:** `kalasetu-backend/server.js:229-255`
```javascript
console.log('Registered routes:');
console.log('- GET /');
// ... exposes API structure in logs
```

---

## LOW PRIORITY ISSUES

### Console Logging (46+ files affected)

**Backend files with console.log:**
- `server.js` - Route debugging
- `authController.js` - Password reset links logged
- `paymentController.js` - Payment events
- `razorpay.js` - Initialization logs
- `email.js` - Welcome email details
- `searchController.js` - Search errors

**Frontend files with console.log:**
- `AuthContext.jsx:142`
- `axios.js:18,24,37-47`
- `algolia.js:10,20`
- `ArtisanSearch.jsx:30`
- `SearchResults.jsx:52,87,357,534`
- `PaymentButton.jsx:55,61`
- `cloudinary.js:42`
- `ImageUpload.jsx:36,40`
- `env.config.js:189,191`
- `AdminDashboard.jsx:25`
- `AdminAuthContext.jsx:52,66,82,92`
- `OrderHistoryTab.jsx:24`

### Accessibility Issues

#### 30. Missing ARIA Labels
- `SearchResults.jsx` - Cards missing role attributes
- `ImageUpload.jsx` - Button missing aria-label
- `MessagesPage.jsx` - ChannelList missing navigation role
- `ChatInterface.jsx` - MessageList/MessageInput not labeled
- `SearchResults.jsx` - Modal inputs missing proper labels

#### 31. Tab Navigation Missing Semantics
**File:** `kalasetu-frontend/src/pages/UserProfilePage.jsx:39`
**Issue:** `aria-pressed` used but missing `role="tablist"` on parent

### Performance Optimizations Needed

#### 32. Missing Memoization
- `SearchResults.jsx:281` - ResultsView created inline every render
- `ProfileTab.jsx:175,182` - getInitials() and getPasswordStrengthLabel() recreated every render
- `SearchResults.jsx:126-164` - Handler functions recreated every render

#### 33. Services Loaded Per Card
**File:** `kalasetu-frontend/src/pages/SearchResults.jsx:352`
**Issue:** Each ArtisanCard loads services individually instead of batch loading

#### 34. Array.from() in Render
**File:** `kalasetu-frontend/src/pages/SearchResults.jsx:265`
```javascript
Array.from({ length: placeholderCount })
```
**Issue:** Creates new array every render

---

## INCOMPLETE FEATURES (TODOs in Code)

| Feature | File | Line | Status |
|---------|------|------|--------|
| Video call cleanup job | `jobHandlers.js` | 74 | Not implemented |
| Unread messages count | `artisanDashboardController.js` | 100 | Returns 0 placeholder |
| Order model integration | `userAuthController.js` | 341 | TODO comment |
| Support ticket creation | `userAuthController.js` | 349-355 | TODO comments |
| Withdrawal system | `paymentController.js` | 223-225 | Placeholder only |
| reCAPTCHA validation | `authController.js` | 51 | Disabled |
| Email verification async | `authController.js` | 89-118 | Gap in flow |

---

## Configuration Issues

### JWT & Cookie Security
**File:** `kalasetu-backend/config/env.config.js:32-42`
- JWT expiry is 7 days (too long for sensitive app)
- Cookie secure flag only in production (dev credentials interceptable)
- Missing refresh token rotation

### CORS Configuration
**File:** `kalasetu-backend/server.js:130-165`
- No rate limiting on CORS preflight requests
- `credentials: true` with loose CORS could enable CSRF

### Missing Security Headers
- No CSP (Content Security Policy) configured
- No HSTS enforcement documented
- Helmet defaults may not be sufficient

---

## Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security | 1 | 5 | 2 | 0 | 8 |
| Backend Bugs | 2 | 4 | 5 | 3 | 14 |
| Frontend Bugs | 2 | 3 | 8 | 6 | 19 |
| Performance | 1 | 0 | 2 | 3 | 6 |
| Missing Features | 0 | 0 | 7 | 0 | 7 |
| Configuration | 0 | 1 | 3 | 2 | 6 |
| **TOTAL** | **6** | **13** | **27** | **14** | **60** |

---

## Recommended Fix Order

1. **Week 1 - Critical Security**
   - Fix XSS in SearchResults
   - Fix ReDoS vulnerability
   - Encrypt bank details in artisanModel
   - Fix MessagesPage crash

2. **Week 2 - Core Functionality**
   - Implement Bookings page
   - Fix N+1 queries in dashboard
   - Add webhook idempotency
   - Fix AuthContext hydration issue

3. **Week 3 - Auth & Error Handling**
   - Implement Firebase email verification
   - Add proper error boundaries
   - Fix silent failures in booking flow
   - Standardize user ID handling

4. **Week 4 - Polish**
   - Remove all console.logs
   - Add missing indexes
   - Add PropTypes validation
   - Fix accessibility issues
