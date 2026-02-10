# TASK: Remove Console Logs from Production Code

## Priority: MEDIUM (Production Cleanup)

## Problem
46+ files contain console.log/error/warn statements that:
- Leak information in production
- Clutter browser console
- Can expose sensitive data
- Unprofessional for production app

## Strategy

### Option A: Remove All Console Logs (Simple)

Search and remove/comment all console statements.

### Option B: Use Logger Utility (Better)

Create a logger that only logs in development.

## Implementation (Option B - Recommended)

### Step 1: Create Logger Utility

Create `kalasetu-frontend/src/utils/logger.js`:

```javascript
/**
 * Logger utility that only logs in development
 * In production, logs are suppressed or sent to monitoring
 */

const isDev = import.meta.env.DEV;

const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },

  info: (...args) => {
    if (isDev) console.info('[INFO]', ...args);
  },

  warn: (...args) => {
    if (isDev) console.warn('[WARN]', ...args);
    // Could also send to Sentry in production
  },

  error: (...args) => {
    // Always log errors, but could send to Sentry
    console.error('[ERROR]', ...args);
    // In production, you might want:
    // if (!isDev) Sentry.captureMessage(args.join(' '));
  },

  debug: (...args) => {
    if (isDev) console.debug('[DEBUG]', ...args);
  },

  // For tracking specific features
  track: (feature, data) => {
    if (isDev) console.log(`[TRACK:${feature}]`, data);
  }
};

export default logger;
```

Create `kalasetu-backend/utils/logger.js`:

```javascript
/**
 * Backend logger utility
 * Could be replaced with Winston/Pino in future
 */

const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },

  info: (...args) => {
    console.info(new Date().toISOString(), '[INFO]', ...args);
  },

  warn: (...args) => {
    console.warn(new Date().toISOString(), '[WARN]', ...args);
  },

  error: (...args) => {
    console.error(new Date().toISOString(), '[ERROR]', ...args);
  },

  debug: (...args) => {
    if (isDev) console.debug(new Date().toISOString(), '[DEBUG]', ...args);
  },

  // Request logging
  request: (req, message) => {
    if (isDev) {
      console.log(`[${req.method}] ${req.path}`, message);
    }
  }
};

export default logger;
```

### Step 2: Find and Replace Console Statements

**Frontend files to update:**

| File | Lines | Action |
|------|-------|--------|
| `AuthContext.jsx` | 142 | Replace with logger.error |
| `axios.js` | 18, 24, 37-47 | Replace with logger.debug or remove |
| `algolia.js` | 10, 20 | Replace with logger.warn/error |
| `ArtisanSearch.jsx` | 30 | Replace with logger.error |
| `SearchResults.jsx` | 52, 87, 357, 534 | Replace with logger.error |
| `PaymentButton.jsx` | 55, 61 | Replace with logger.error |
| `cloudinary.js` | 42 | Replace with logger.error |
| `ImageUpload.jsx` | 36, 40 | Replace with logger.error |
| `env.config.js` | 189, 191 | Replace with logger.warn |
| `AdminDashboard.jsx` | 25 | Replace with logger.error |
| `AdminAuthContext.jsx` | 52, 66, 82, 92 | Replace with logger.error |
| `OrderHistoryTab.jsx` | 24 | Replace with logger.error |
| `Header.jsx` | 31, 166, 172, 298, 304 | Replace with logger.error |

**Backend files to update:**

| File | Action |
|------|--------|
| `server.js` | Remove route logging (lines 229-255) or wrap in isDev check |
| `authController.js` | Replace console.log with logger |
| `paymentController.js` | Replace with logger |
| `razorpay.js` | Replace initialization logs |
| `email.js` | Replace email logging |
| `searchController.js` | Replace error logging |

### Step 3: Quick Search Commands

```bash
# Frontend
cd kalasetu-frontend
grep -rn "console\." src/ --include="*.jsx" --include="*.js"

# Backend
cd kalasetu-backend
grep -rn "console\." . --include="*.js" --exclude-dir=node_modules
```

### Step 4: Example Replacements

**Before:**
```javascript
console.log('Payment created:', order);
console.error('Failed to create payment:', error);
```

**After:**
```javascript
import logger from '../utils/logger';

logger.debug('Payment created:', order);
logger.error('Failed to create payment:', error);
```

**For server.js route logging:**

Before:
```javascript
console.log('Registered routes:');
console.log('- GET /');
// ...many more
```

After:
```javascript
if (process.env.NODE_ENV !== 'production') {
  console.log('Registered routes:');
  console.log('- GET /');
  // ...
}
// OR just remove entirely - not needed in production
```

## Files That Are OK to Keep Console

Some console statements are acceptable:
- `console.error` in catch blocks (errors should be visible)
- Startup messages like "Server running on port X"
- Critical warnings

## Steps

1. Create logger utility (frontend and backend)
2. Export from utils/index.js
3. Go file by file and replace:
   - `console.log` → `logger.debug` or remove
   - `console.error` → `logger.error`
   - `console.warn` → `logger.warn`
4. Remove debug-only logging entirely
5. Test that app still works
6. Verify production build has no console output

## Success Criteria
- No `console.log` visible in production
- Errors still logged (via logger.error)
- Development mode still has useful logs
- No sensitive data in any logs
