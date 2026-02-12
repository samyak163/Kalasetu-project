# Phase 1: Critical Bug Fixes - Research

**Researched:** 2026-02-13
**Domain:** Backend reliability, data integrity, security hardening
**Confidence:** HIGH

## Summary

Phase 1 addresses five critical bugs affecting data integrity, reliability, and security in the KalaSetu platform. The codebase uses Mongoose 8.19.2 (latest) with MongoDB, Express 4.21.2, React 19, and has existing infrastructure for transactions, rate limiting, error tracking (Sentry), and toast notifications. All required libraries are already installed.

**Key findings:**
- MongoDB transactions via Mongoose sessions are fully supported (Mongoose 8.x)
- Rate limiting infrastructure exists but needs tighter auth-specific configuration
- Multer 2.0.2 is installed but lacks validation middleware
- Frontend has Sentry, ToastContext, and proper error boundaries
- NotificationContext has useCallback infinite loop due to dependency array including the callback itself

**Primary recommendation:** Implement targeted fixes using existing infrastructure. No new dependencies needed. Focus on Mongoose session transactions, stricter rate limits, multer validators, useRef pattern, and structured error reporting to Sentry.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| mongoose | 8.19.2 | MongoDB ODM | Industry standard, full transaction support since 5.x |
| express-rate-limit | 7.5.1 | Rate limiting | De facto standard for Express rate limiting |
| multer | 2.0.2 | File upload handling | Standard Express file upload middleware |
| zod | 3.25.76 | Schema validation | Modern, type-safe validation (already used in controllers) |
| @sentry/react | 10.22.0 | Error tracking | Industry standard error monitoring |
| react | 19.2.0 | Frontend framework | Latest stable |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @sentry/node | 10.22.0 | Backend error tracking | Already initialized in server.js |
| posthog-js | 1.284.0 | Analytics | Alternative to Sentry for non-error events |

### No New Dependencies Required
All fixes can be implemented with existing libraries. The codebase already has:
- `asyncHandler` wrapper for async route handlers
- `ToastContext` for user notifications
- Sentry integration with `captureException` helper
- JWT-based auth with HTTP-only cookies
- Zod validation in controllers

## Architecture Patterns

### Recommended Project Structure (Already Exists)
```
kalasetu-backend/
├── controllers/        # Business logic with Zod validation
├── middleware/         # Auth, error handling, caching
├── models/            # Mongoose schemas
├── routes/            # Express routers with rate limiters
└── utils/             # asyncHandler, Sentry, etc.

kalasetu-frontend/
├── context/           # React contexts (Auth, Toast, Notification)
├── hooks/             # Custom hooks (useNotifications.js exists)
├── lib/               # Sentry, PostHog, OneSignal init
└── components/        # UI components
```

### Pattern 1: MongoDB Transactions with Mongoose Sessions
**What:** Wrap overlapping-check + insert operations in a transaction to prevent race conditions.
**When to use:** Any operation requiring atomic read-then-write (booking creation, inventory updates).
**Example:**
```javascript
// Source: Mongoose 8.x official docs - https://mongoosejs.com/docs/transactions.html
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Check for overlap within transaction
  const overlap = await Booking.findOne({
    artisan: artisanId,
    status: { $in: ['pending', 'confirmed'] },
    start: { $lt: endTime },
    end: { $gt: startTime },
  }).session(session);

  if (overlap) {
    await session.abortTransaction();
    return res.status(409).json({ message: 'Time slot already booked' });
  }

  // Create booking within transaction
  const booking = await Booking.create([{
    artisan: artisanId,
    user: userId,
    start: startTime,
    end: endTime,
    // ... other fields
  }], { session });

  await session.commitTransaction();
  res.status(201).json({ success: true, data: booking[0] });
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```
**CRITICAL:** `.session(session)` must be passed to ALL queries and `.create()` takes array syntax when using sessions.

### Pattern 2: useRef to Prevent useCallback Infinite Loops
**What:** Use `useRef` to store stable callback reference that doesn't trigger re-renders.
**When to use:** When a function is in a dependency array of its own `useEffect`.
**Example:**
```javascript
// Source: React docs - https://react.dev/reference/react/useRef
const refreshRef = useRef();

refreshRef.current = async () => {
  try {
    const res = await axios.get(`${API_CONFIG.BASE_URL}/api/notifications`);
    const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    const decorated = list.map((item) => ({
      ...item,
      timeAgo: formatTimeAgo(item.createdAt),
    }));
    setNotifications(decorated);
    setUnreadCount(computeUnread(decorated));
  } catch (err) {
    console.error('Failed to refresh notifications:', err);
  }
};

const refresh = useCallback(() => refreshRef.current(), []);

useEffect(() => {
  refreshRef.current(); // Call directly, not through refresh
}, []); // Empty deps - runs once
```
**Alternative:** Remove `refresh` from deps array if it's only called on mount.

### Pattern 3: Multer File Validation Middleware
**What:** Chain multer with custom validation middleware for type and size checks.
**When to use:** Before any file upload to Cloudinary or storage.
**Example:**
```javascript
// Source: Multer 2.x best practices
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    const allowedPdfTypes = ['application/pdf'];

    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedPdfTypes];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and PDFs allowed.'));
    }
  }
});
```
**Note:** Existing code has `multer.memoryStorage()` already configured in `artisanProfileRoutes.js`.

### Pattern 4: Auth-Specific Rate Limiting
**What:** Apply stricter rate limits to authentication endpoints beyond global API limiter.
**When to use:** Login, register, password reset, OTP endpoints.
**Example:**
```javascript
// Source: express-rate-limit 7.x docs - https://express-rate-limit.mintlify.app/
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: false, // Count successful logins too
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many registration attempts, please try again later.' },
});

router.post('/login', loginLimiter, asyncHandler(login));
router.post('/register', registerLimiter, asyncHandler(register));
```
**Current state:** `authRoutes.js` has 15 max/15min for login, 5 max/15min for register. Needs adjustment to 20/15min login, 5/60min register.

### Pattern 5: Structured Error Handling with Sentry + Toast
**What:** Replace empty catch blocks with Sentry logging + user-facing toast notifications.
**When to use:** Any async operation that can fail (API calls, storage access).
**Example:**
```javascript
// Source: Existing KalaSetu patterns in lib/sentry.js
import { captureException } from '../lib/sentry.js';
import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext.jsx';

const { showToast } = useContext(ToastContext);

try {
  await refreshNotifications();
} catch (error) {
  captureException(error, {
    context: 'notification_refresh',
    component: 'RegisterPage'
  });
  showToast('Failed to load notifications. Please refresh.', 'warning', 4000);
}
```
**Existing infrastructure:**
- `captureException(error, context)` helper in `lib/sentry.js`
- `ToastContext.showToast(message, type, duration)` in `context/ToastContext.jsx`
- Sentry already initialized in `main.jsx` with `beforeSend` hook

### Anti-Patterns to Avoid
- **Using `Model.findAndModify()` without session:** Transaction queries must pass `.session(session)` to ALL operations, not just writes.
- **Validating file type by extension:** Always validate MIME type from multer, not `req.file.originalname` extension (easily spoofed).
- **Silently swallowing errors:** Empty catch blocks (`catch (_) {}`) hide bugs. Always log to Sentry or console in dev.
- **Rate limiting by user ID:** Use IP-based rate limiting for auth endpoints (pre-authentication, no user ID available).
- **Transaction without finally block:** Always call `session.endSession()` in finally to prevent connection leaks.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File type validation | Custom regex on filename | multer `fileFilter` with MIME check | Extensions are spoofable, MIME type checked by browser |
| Race condition prevention | Application-level locks | MongoDB transactions | Database-level atomicity, handles concurrent requests correctly |
| Rate limiting by IP | Custom middleware with in-memory Map | express-rate-limit | Handles distributed systems, Redis support, automatic cleanup |
| Error logging | Custom logger | Sentry SDK | Deduplication, stack traces, breadcrumbs, session replay |
| Stable callbacks in React | Manual memoization | useRef pattern | React's blessed pattern for this exact issue |

**Key insight:** Security and data integrity bugs require battle-tested solutions. MongoDB transactions, multer validation, and Sentry error tracking have handled edge cases (network failures, concurrent requests, memory leaks) that custom solutions would miss.

## Common Pitfalls

### Pitfall 1: Mongoose `.create()` with sessions requires array syntax
**What goes wrong:** `Booking.create({...}, { session })` fails silently or throws confusing errors.
**Why it happens:** Mongoose's `.create()` signature changes when using sessions: `create([doc], { session })` not `create(doc, { session })`.
**How to avoid:** Always wrap document in array when passing `{ session }` option.
**Warning signs:** Transaction commits but no document created, or "session is undefined" errors.
```javascript
// ❌ WRONG
const booking = await Booking.create({ field: value }, { session });

// ✅ CORRECT
const [booking] = await Booking.create([{ field: value }], { session });
// Note: .create() returns array when session is passed
```

### Pitfall 2: Forgetting `.session(session)` on queries
**What goes wrong:** Read queries inside transaction don't see uncommitted writes, causing phantom reads.
**Why it happens:** Mongoose queries are session-less by default. `.session()` must be explicitly chained.
**How to avoid:** Add `.session(session)` to EVERY query inside transaction block (finds, updates, creates).
**Warning signs:** Transaction commits but overlap check still fails, data inconsistency.
```javascript
// ❌ WRONG - query not part of transaction
const overlap = await Booking.findOne({ artisan: artisanId });

// ✅ CORRECT
const overlap = await Booking.findOne({ artisan: artisanId }).session(session);
```

### Pitfall 3: useCallback dependency array including itself
**What goes wrong:** `useEffect(() => { refresh(); }, [refresh])` where `refresh = useCallback(...)` triggers infinite loop.
**Why it happens:** `refresh` function recreates on every render due to state dependencies, triggering `useEffect`, which calls `refresh`, which updates state, which recreates `refresh`, etc.
**How to avoid:** Use `useRef` pattern to store callback, or remove callback from dependency array if only called once.
**Warning signs:** Rapid API calls visible in Network tab, browser freezing, high CPU usage.

### Pitfall 4: Multer limits not enforced on all upload routes
**What goes wrong:** Adding `fileFilter` to one upload route but forgetting others leaves gaps.
**Why it happens:** Multer instance is per-route. If `uploadRoutes.js` has no validation but `artisanProfileRoutes.js` does, signature endpoint is unprotected.
**How to avoid:** Create shared multer instance with validation, export and use everywhere.
**Warning signs:** Large files or malicious file types uploaded via different endpoints.

### Pitfall 5: Rate limiting on route vs. router
**What goes wrong:** Applying limiter to individual routes instead of entire router creates inconsistent protection.
**Why it happens:** `router.post('/login', limiter, ...)` protects one route, but `router.use(limiter)` protects all.
**How to avoid:** Apply auth-specific limiters per-route only. Global limiters go on `app.use('/api', limiter)`.
**Warning signs:** Rate limiting bypassed via alternative endpoints (e.g., `/api/auth/login` vs `/api/users/login`).

## Code Examples

Verified patterns from official sources and existing KalaSetu code:

### MongoDB Transaction - Complete Pattern
```javascript
// Source: Mongoose 8.x docs + KalaSetu asyncHandler pattern
export const createBooking = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  // ... validation with Zod

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check for overlapping bookings (must use .session())
    const overlap = await Booking.findOne({
      artisan: artisanId,
      status: { $in: ['pending', 'confirmed'] },
      start: { $lt: endTime },
      end: { $gt: startTime },
    }).session(session);

    if (overlap) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: 'Time slot already booked' });
    }

    // Create booking (array syntax required with session)
    const [booking] = await Booking.create([{
      artisan: artisanId,
      user: userId,
      service: serviceId,
      start: startTime,
      end: endTime,
      price: finalPrice,
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    await session.abortTransaction();
    throw err; // asyncHandler catches and passes to errorMiddleware
  } finally {
    session.endSession(); // CRITICAL: prevent connection leaks
  }
});
```

### NotificationContext - Fixed with useRef
```javascript
// Source: React docs + KalaSetu existing patterns
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const computeUnread = useCallback((list) => list.filter(n => !n.read).length, []);
  const formatTimeAgo = useCallback((timestamp) => { /* ... */ }, []);

  // Store refresh in ref to prevent recreation
  const refreshRef = useRef();
  refreshRef.current = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/api/notifications`, { withCredentials: true });
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const decorated = list.map((item) => ({
        ...item,
        timeAgo: formatTimeAgo(item.createdAt),
      }));
      setNotifications(decorated);
      setUnreadCount(computeUnread(decorated));
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
    }
  };

  // Stable reference for external callers
  const refresh = useCallback(() => refreshRef.current(), []);

  const markRead = useCallback(async (id) => { /* ... */ }, []);

  // Run once on mount - call ref directly, not through refresh
  useEffect(() => {
    refreshRef.current();
  }, []); // Empty deps - no infinite loop

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refresh, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
```

### Multer Validation - Shared Instance
```javascript
// Source: Multer 2.x docs + KalaSetu artisanProfileRoutes.js
// File: kalasetu-backend/config/multer.js (new file)
import multer from 'multer';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_DOC_TYPES = ['application/pdf'];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5MB

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images allowed.'));
    }
  }
});

export const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4 and WebM videos allowed.'));
    }
  }
});

export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOC_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_DOC_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF documents allowed.'));
    }
  }
});
```

### Rate Limiting - Auth Endpoints
```javascript
// Source: express-rate-limit 7.x docs + KalaSetu existing patterns
// File: kalasetu-backend/routes/authRoutes.js (UPDATE)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // INCREASED from 15 to 20
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // INCREASED from 15min to 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts. Please try again in 1 hour.' },
});

router.post('/login', loginLimiter, asyncHandler(login));
router.post('/register', registerLimiter, asyncHandler(register));
```

### Error Handling - Empty Catch Replacement
```javascript
// Source: KalaSetu lib/sentry.js + context/ToastContext.jsx
// BEFORE (AdvancedFilters.jsx:17)
try {
  const res = await axios.get(`${API_CONFIG.BASE_URL}/api/search/facets`);
  // ...
} catch (err) {
  if (import.meta.env.DEV) console.error('Failed to load search facets:', err);
}

// AFTER
import { captureException } from '../lib/sentry.js';
import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext.jsx';

const { showToast } = useContext(ToastContext);

try {
  const res = await axios.get(`${API_CONFIG.BASE_URL}/api/search/facets`);
  // ...
} catch (err) {
  captureException(err, {
    context: 'search_facets_load',
    component: 'AdvancedFilters'
  });
  if (import.meta.env.DEV) {
    console.error('Failed to load search facets:', err);
  }
  // Optionally show toast if critical:
  // showToast('Failed to load filters', 'warning', 3000);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Application-level locks (mutex) | MongoDB transactions | Mongoose 5.0 (2018) | Reliable concurrency control, handles network failures |
| Custom file validation with regex | Multer fileFilter + MIME check | Multer 1.0 (2015) | Prevents MIME spoofing attacks |
| Manual useCallback memoization | useRef pattern | React 16.8 (2019) | Simpler, no dependency hell |
| express-rate-limit 5.x | express-rate-limit 7.x | v7.0 (2023) | Better TypeScript, standardHeaders, Redis support |
| Mongoose 5.x transactions | Mongoose 8.x transactions | v8.0 (2024) | Improved performance, better error messages |

**Deprecated/outdated:**
- **Mongoose `findAndModify()`:** Use `findOneAndUpdate()` with `{ session }` instead
- **express-rate-limit `onLimitReached`:** Removed in v7, use `handler` callback instead
- **React class components + refs:** Use function components with `useRef` hook

## Open Questions

None. All research complete with HIGH confidence.

## Sources

### Primary (HIGH confidence)
- Mongoose 8.x official docs - https://mongoosejs.com/docs/transactions.html
- express-rate-limit 7.x official docs - https://express-rate-limit.mintlify.app/
- Multer GitHub - https://github.com/expressjs/multer
- React useRef docs - https://react.dev/reference/react/useRef
- Sentry React SDK - https://docs.sentry.io/platforms/javascript/guides/react/

### Secondary (MEDIUM confidence)
- KalaSetu existing codebase patterns (server.js, authRoutes.js, artisanProfileRoutes.js, lib/sentry.js, context/ToastContext.jsx)
- Mongoose connection.js patterns in existing projects
- React Context best practices from React docs

### Tertiary (LOW confidence)
None used.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and in use
- Architecture: HIGH - Patterns verified in official docs and existing KalaSetu code
- Pitfalls: HIGH - Sourced from Mongoose docs, Stack Overflow common issues, React docs

**Research date:** 2026-02-13
**Valid until:** 2026-03-13 (30 days - stable ecosystem)

---

## Implementation Notes for Planner

### File Locations (from bug descriptions)
- **BUG-01:** `kalasetu-backend/controllers/bookingController.js:66-74`
- **BUG-02:** `kalasetu-frontend/src/context/NotificationContext.jsx:56`
- **BUG-03:** `kalasetu-backend/routes/uploadRoutes.js`, `kalasetu-backend/routes/artisanProfileRoutes.js`
- **BUG-04:** `kalasetu-backend/routes/authRoutes.js`, `kalasetu-backend/routes/userAuthRoutes.js`
- **BUG-05:** `kalasetu-frontend/src/components/search/AdvancedFilters.jsx:17`, `kalasetu-frontend/src/pages/RegisterPage.jsx:65`, `kalasetu-frontend/src/pages/UserRegisterPage.jsx:70`

### Key Dependencies Already Installed
- mongoose: ^8.19.2
- express-rate-limit: ^7.5.1
- multer: ^2.0.2
- zod: ^3.25.76
- @sentry/react: ^10.22.0
- @sentry/node: ^10.22.0

### Existing Patterns to Follow
- Use `asyncHandler` wrapper for all async controllers
- Use Zod for request validation (see `createBookingSchema` in bookingController.js)
- Error responses: `{ success: false, message: 'Error message' }`
- Success responses: `{ success: true, data: {...} }`
- Sentry: `captureException(error, context)` helper in `lib/sentry.js`
- Toast: `showToast(message, type, duration)` from `ToastContext`

### Critical Implementation Details
1. **Transactions:** Must call `session.endSession()` in finally block
2. **Multer:** Create shared instances in new `config/multer.js` file
3. **Rate limiting:** Update existing limiters, don't create new ones
4. **Empty catches:** Replace all 3 instances with Sentry + optional toast
5. **NotificationContext:** Use useRef pattern, test for infinite loop prevention
