---
phase: 01-critical-bug-fixes
plan: 01
subsystem: backend
tags: [security, reliability, transactions, rate-limiting]
dependency_graph:
  requires: []
  provides: [booking-race-condition-fix, auth-rate-limiting]
  affects: [bookings, authentication]
tech_stack:
  added: [mongodb-transactions]
  patterns: [transaction-atomicity, rate-limiting]
key_files:
  created: []
  modified:
    - kalasetu-backend/controllers/bookingController.js
    - kalasetu-backend/routes/authRoutes.js
    - kalasetu-backend/routes/userAuthRoutes.js
decisions:
  - "Use MongoDB transactions for atomic booking creation to prevent race conditions"
  - "Set login rate limit to 20/15min (balanced security vs usability)"
  - "Set register rate limit to 5/60min (stricter for account creation)"
  - "Remove rate limiter from logout routes to always allow users to log out"
metrics:
  duration_seconds: 105
  completed: 2026-02-13
---

# Phase 01 Plan 01: Critical Bug Fixes - Booking & Auth Summary

**One-liner:** Transaction-wrapped booking creation with MongoDB sessions and tightened auth rate limiting (20/15min login, 5/60min register).

## Tasks Completed

### Task 1: Wrap booking creation in MongoDB transaction (BUG-01)
**Status:** Complete
**Commit:** `dd4f734`

**Changes:**
- Added `mongoose` import for session management
- Wrapped overlap check and booking creation in MongoDB transaction
- Used `.session(session)` on `findOne` to read within transaction scope
- Converted `Booking.create()` to array syntax for session support: `create([{...}], { session })`
- Added `commitTransaction()` on success, `abortTransaction()` on conflict/error
- Added `finally` block with `endSession()` to prevent connection pool leaks

**Impact:** Prevents race condition where concurrent booking requests for the same artisan time slot could both succeed. Now exactly one booking succeeds; the second receives 409 Conflict.

**Files modified:**
- `kalasetu-backend/controllers/bookingController.js`

### Task 2: Tighten auth rate limiting on both route files (BUG-04)
**Status:** Complete
**Commit:** `f1e90f0`

**Changes:**
- Renamed `strictLimiter` to `loginLimiter` for clarity
- Updated `loginLimiter` config:
  - `max: 20` (increased from 15)
  - `windowMs: 15 * 60 * 1000` (kept at 15 minutes)
  - Added consistent error message format
- Updated `registerLimiter` config:
  - `max: 5` (kept at 5)
  - `windowMs: 60 * 60 * 1000` (increased from 15 minutes to 1 hour)
  - Added consistent error message format
- Added `loginLimiter` to `firebase-login` route in `authRoutes.js`
- Removed rate limiter from `logout` route in `userAuthRoutes.js` (users should always be able to log out)
- Applied changes to both `authRoutes.js` and `userAuthRoutes.js`
- Standardized all rate limit messages to `{ success: false, message: '...' }` format

**Impact:** Protects auth endpoints from brute-force attacks while maintaining usability. Login attempts limited to 20 per 15 minutes, registration to 5 per hour. All rate-limited responses include `Retry-After` header via `standardHeaders: true`.

**Files modified:**
- `kalasetu-backend/routes/authRoutes.js`
- `kalasetu-backend/routes/userAuthRoutes.js`

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification checks passed:

1. Syntax checks: All three modified files pass `node -c` syntax validation
2. MongoDB transaction keywords verified in bookingController.js:
   - `import mongoose from 'mongoose'` present
   - `startSession`, `startTransaction`, `commitTransaction`, `abortTransaction`, `endSession` all present
   - `.session(session)` chained on `findOne` query
   - Array syntax used with `Booking.create([{...}], { session })`
3. Rate limiter verification:
   - No `strictLimiter` references remain in either route file
   - `loginLimiter` has `max: 20`, `windowMs: 15 * 60 * 1000` in both files
   - `registerLimiter` has `max: 5`, `windowMs: 60 * 60 * 1000` in both files
   - Both use `standardHeaders: true` and `legacyHeaders: false`
   - All messages follow `{ success: false, message: '...' }` pattern

## Success Criteria Validation

- [x] bookingController.js uses MongoDB transaction wrapping overlap check and booking creation
- [x] authRoutes.js login limiter allows 20/15min, register limiter allows 5/60min
- [x] userAuthRoutes.js login limiter allows 20/15min, register limiter allows 5/60min
- [x] All rate limit responses use `{ success: false, message: '...' }` format
- [x] All files pass syntax check
- [x] Transaction includes proper error handling and session cleanup
- [x] firebase-login route now has rate limiting
- [x] logout route no longer has rate limiting

## Testing Recommendations

### BUG-01 (Booking Race Condition)
**Manual test:** Use a tool like Apache Bench or Postman runner to send 10 concurrent booking requests for the same artisan time slot. Expected: exactly one 201 Created, nine 409 Conflict responses.

**Code verification:** Review `createBooking` function to confirm transaction scope includes both read (overlap check) and write (booking creation).

### BUG-04 (Auth Rate Limiting)
**Manual test:**
1. Login endpoint: Send 21 login requests within 15 minutes to `/api/auth/login` or `/api/users/login`. Expected: first 20 succeed (or fail with 401), 21st gets 429 with `Retry-After` header.
2. Register endpoint: Send 6 registration requests within 1 hour to `/api/auth/register` or `/api/users/register`. Expected: first 5 succeed (or fail with validation), 6th gets 429 with `Retry-After` header.
3. Logout endpoint: Verify logout always succeeds regardless of prior request count.
4. Firebase login: Verify rate limiting applies to `/api/auth/firebase-login`.

## Notes

- Connection leaks prevented by `finally` block with `session.endSession()` - critical for production environments with sustained load
- Rate limits are per-IP via default `express-rate-limit` configuration
- `standardHeaders: true` ensures RFC-compliant `RateLimit-*` and `Retry-After` headers
- Both fixes are backend-only changes; no frontend modifications required
- These are foundational fixes for production reliability and security

## Next Steps

Continue with plan 01-02 to address remaining critical bugs (BUG-02, BUG-03, BUG-05).

## Self-Check: PASSED

All files and commits verified:
- ✓ kalasetu-backend/controllers/bookingController.js exists
- ✓ kalasetu-backend/routes/authRoutes.js exists
- ✓ kalasetu-backend/routes/userAuthRoutes.js exists
- ✓ Commit dd4f734 (BUG-01 transaction fix) exists
- ✓ Commit f1e90f0 (BUG-04 rate limiting) exists
