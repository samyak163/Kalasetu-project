# TASK: Fix Silent Error Handling

## Priority: MEDIUM

## Problem
Multiple places in the code silently catch and ignore errors, making debugging impossible and leaving users confused.

## Files to Fix

### 1. NotificationContext.jsx
`kalasetu-frontend/src/context/NotificationContext.jsx`

**Current (lines ~45, 53):**
```jsx
catch (_) {}  // Silently swallows all errors
```

**Fix:**
```jsx
catch (error) {
  console.error('Failed to fetch notifications:', error);
  // Optionally set an error state
  setNotificationError(error.message);
}
```

### 2. Booking Communication Setup
`kalasetu-backend/controllers/bookingController.js`

**Current (around lines 96-117):**
```javascript
try {
  // Stream chat setup
} catch (err) {
  console.error('Failed to prepare Stream chat for booking', err.message);
  // Continues without notifying anyone
}
```

**Fix:**
```javascript
try {
  // Stream chat setup
} catch (err) {
  console.error('Failed to prepare Stream chat for booking', err.message);
  // Log to Sentry
  Sentry.captureException(err, {
    tags: { feature: 'booking-chat' },
    extra: { bookingId: booking._id }
  });
  // Add to booking response so frontend knows
  booking.chatSetupFailed = true;
}
```

### 3. AuthContext.jsx
`kalasetu-frontend/src/context/AuthContext.jsx`

**Current (line ~142):**
```jsx
} catch (error) {
  console.error("Logout error:", error);
}
```

**This one is okay** - logout errors shouldn't block the user. But we could improve:
```jsx
} catch (error) {
  console.error("Logout error:", error);
  // Still clear local state even if server logout failed
  // The cookie will expire anyway
}
```

### 4. Header.jsx - Geolocation
`kalasetu-frontend/src/components/Header.jsx`

**Current (lines ~165-177):**
```jsx
} catch (error) {
  console.error('Geocoding error:', error);
  alert('Failed to get location. Please enter manually.');
}
```

**This is fine** - user gets feedback via alert. But could improve UX:
```jsx
} catch (error) {
  console.error('Geocoding error:', error);
  setLocationError('Unable to detect location. Please enter manually.');
  // Show error in UI instead of alert
}
```

## General Pattern to Follow

### Bad:
```javascript
try {
  await doSomething();
} catch (e) {
  // Nothing - silent failure
}
```

### Better:
```javascript
try {
  await doSomething();
} catch (error) {
  // 1. Log for debugging
  console.error('doSomething failed:', error);

  // 2. Report to monitoring (production)
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error);
  }

  // 3. Give user feedback (if user-facing)
  setError('Something went wrong. Please try again.');

  // OR re-throw if caller should handle it
  throw error;
}
```

## Create Error Utility

Create `kalasetu-frontend/src/utils/errorHandler.js`:

```javascript
import * as Sentry from '@sentry/react';

/**
 * Handle errors consistently across the app
 */
export function handleError(error, context = {}) {
  // Always log to console in development
  console.error(`Error in ${context.component || 'unknown'}:`, error);

  // Report to Sentry in production
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      tags: context.tags || {},
      extra: context.extra || {},
    });
  }

  // Return user-friendly message
  return getUserFriendlyMessage(error);
}

function getUserFriendlyMessage(error) {
  // Network errors
  if (error.code === 'ERR_NETWORK') {
    return 'Unable to connect. Please check your internet connection.';
  }

  // API errors with message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Timeout
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  // Default
  return 'Something went wrong. Please try again.';
}

export default handleError;
```

## Usage Example

```jsx
import { handleError } from '../utils/errorHandler';

async function fetchData() {
  try {
    const response = await api.get('/api/something');
    return response.data;
  } catch (error) {
    const message = handleError(error, {
      component: 'MyComponent',
      tags: { feature: 'data-fetch' },
      extra: { userId: user.id }
    });
    setError(message);
    return null;
  }
}
```

## Steps

1. Create error handler utility
2. Fix NotificationContext silent catches
3. Fix booking controller - add error tracking
4. Search codebase for `catch (_)` and `catch (e) {}` patterns
5. Update each to use proper error handling

## Search Commands

```bash
# Find silent catches in frontend
grep -r "catch.*{}" kalasetu-frontend/src/
grep -r "catch.*(_)" kalasetu-frontend/src/

# Find silent catches in backend
grep -r "catch.*{}" kalasetu-backend/
grep -r "catch.*(_)" kalasetu-backend/
```

## Success Criteria
- No more `catch (_) {}` or empty catch blocks
- All errors logged with context
- User-facing errors show friendly messages
- Critical errors reported to Sentry
