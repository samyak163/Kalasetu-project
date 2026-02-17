# Phase 1: Quality Gate Findings

> **Date:** 2026-02-17
> **Agents used:** build-check, code-review, security-review, test-check
> **Verdict:** REJECT — Critical security issues must be fixed before any demo

---

## Summary

| Gate | Result | Details |
|------|--------|---------|
| Build Check | PASS (with warnings) | 1 lint error, 64 warnings, 2 oversized bundles |
| Code Review | REJECT | 3 critical, 8 high, 8 medium, 6 low issues |
| Security Review | REJECT | 4 critical, 6 high, 8 medium, 5 low issues |
| Test Check | FAIL | Zero test infrastructure exists |

---

## CRITICAL Issues (Fix First — Phase 1 Blockers)

### C1: Client-Controlled Payment Amount (Security)
- **File:** `paymentController.js:13-68`
- **Issue:** `createPaymentOrder` accepts `amount` directly from `req.body`. A user can pay 1 INR for a 5000 INR service.
- **Fix:** Server determines amount from booking/service price, not client.

### C2: Unauthenticated Cloudinary Signature Endpoint (Security)
- **File:** `uploadRoutes.js:8-40`
- **Issue:** `GET /api/uploads/signature` has no auth middleware. Anyone can get upload credentials.
- **Fix:** Add `protectAny` middleware.

### C3: Notification Injection (Security)
- **File:** `notificationController.js:14-49`, `notificationRoutes.js:18-20`
- **Issue:** Any authenticated user can send notifications to any other user, including broadcast to ALL users.
- **Fix:** Make send-to-user, send-to-users, and broadcast admin-only.

### C4: SameSite=None Disables CSRF Protection (Security)
- **File:** `generateToken.js:12-18`, `adminAuthController.js:34-39`
- **Issue:** Cookies use `SameSite=None` in production (needed for cross-origin), but no CSRF token exists.
- **Fix:** Implement CSRF token pattern (custom header `X-CSRF-Token`).

### C5: Webhook Signature on Re-serialized JSON (Code Review)
- **File:** `paymentController.js:383-395`, `server.js:123`
- **Issue:** `JSON.stringify(req.body)` may not match original body for signature verification.
- **Fix:** Use `express.raw()` for webhook route to capture raw body.

---

## HIGH Issues (Fix in Phase 1)

### H1: Timing-Vulnerable Signature Comparison
- **File:** `razorpay.js:82, 177`
- **Fix:** Use `crypto.timingSafeEqual()` for all HMAC comparisons.

### H2: Public Artisan Endpoints Leak Sensitive Data
- **File:** `artisanController.js:22-43`
- **Issue:** Bank details, Aadhar, PAN, OTP codes, reset tokens visible on public endpoints.
- **Fix:** Add restrictive `.select()` excluding all sensitive fields.

### H3: Artisan Model Missing `select: false` on Password
- **File:** `artisanModel.js:23`
- **Fix:** Add `select: false` like User model. Update login to use `.select('+password')`.

### H4: Admin Login Has No Rate Limiting
- **File:** `adminRoutes.js:37`
- **Fix:** Add `adminLoginLimiter` (10 per 15 min) and account lockout.

### H5: Payment Verification No Payer Ownership Check
- **File:** `paymentController.js:74-126`
- **Fix:** Check `payment.payerId === req.user.id` before marking captured.

### H6: Availability Upsert Mass Assignment
- **File:** `availabilityRoutes.js:15-22`
- **Fix:** Validate with Zod, whitelist allowed fields.

### H7: Video Routes Reimplemented protectAny Incorrectly
- **File:** `videoRoutes.js:15-30`
- **Fix:** Replace custom auth middleware with `protectAny`.

### H8: Chat Routes Duplicate protectAny Logic
- **File:** `chatRoutes.js:17-48`
- **Fix:** Replace with `protectAny`.

### H9: Admin processRefund Doesn't Call Razorpay
- **File:** `adminDashboardController.js:445-467`
- **Fix:** Call `refundPayment()` before marking as refunded.

### H10: Payment Amount No Zod Validation
- **File:** `paymentController.js:14`
- **Fix:** Add Zod schema for amount (positive number, max limit).

### H11: Admin getAllPayments Leaks Password Hashes via Populate
- **File:** `adminDashboardController.js:366-368`
- **Fix:** Add `.select('fullName email profileImageUrl')` to populate calls.

---

## MEDIUM Issues (Fix in Phase 1 if time permits)

| # | Issue | File |
|---|-------|------|
| M1 | Artisan registration skips Zod validation | authController.js:47 |
| M2 | Error handler leaks stack in non-production | errorMiddleware.js:88 |
| M3 | Client can set booking price to 0 | bookingController.js:83 |
| M4 | Webhook idempotency check is no-op | paymentController.js:401 |
| M5 | Non-atomic refund creates duplicate risk | paymentController.js:298 |
| M6 | Error messages exposed in public endpoints | artisanController.js:32 |
| M7 | Email templates XSS via userName | paymentController.js:610 |
| M8 | Dead code in refund check | paymentController.js:329 |
| M9 | recomputeRating ObjectId vs string | reviewController.js:119 |
| M10 | ChatContext stale closure | ChatContext.jsx:93 |
| M11 | RequireAuth blocks artisans from shared routes | RequireAuth.jsx:9 |
| M12 | Admin dashboard date mutation bug | adminDashboardController.js:18 |
| M13 | No pagination on public artisan list | artisanController.js:36 |

---

## LOW Issues (Optional for Phase 1)

| # | Issue | File |
|---|-------|------|
| L1 | console.log/console.error in production | Multiple files |
| L2 | Unused nodemailer import | userAuthController.js:7 |
| L3 | Logout redirects to wrong login page | AuthContext.jsx:149 |
| L4 | Admin logout cookie mismatch | adminAuthController.js:80 |
| L5 | Contact form no rate limiting | contactRoutes.js:6 |
| L6 | OTP rate limit too generous (20/15min) | otpRoutes.js:13 |
| L7 | JWT missing user type claim | generateToken.js:4 |

---

## Build Issues

| # | Issue | Severity |
|---|-------|----------|
| B1 | 1 lint error: `process` not defined in `generate-icons.js` | Low |
| B2 | 64 lint warnings (~40 unused vars, ~24 missing hook deps) | Low |
| B3 | vendor-stream bundle 1.45MB (Stream Chat SDK) | Medium |
| B4 | index bundle 1.66MB (main app bundle) | Medium |

---

## Test Infrastructure (Current: Nothing)

| What | Status |
|------|--------|
| Backend test framework | None |
| Backend test files | None |
| Frontend test framework | None |
| Frontend test files | None |
| E2E framework | None |
| CI test execution | Skipped (no test script) |

**Recommendation:** Vitest for both backend and frontend. Playwright for E2E.

---

## Phase 1 Priority Order

Based on findings, the Phase 1 work should be tackled in this order:

1. **Security CRITICAL fixes** (C1-C5) — Must fix before demo
2. **Security HIGH fixes** (H1-H11) — Must fix before demo
3. **Bug fixes** (M3, M8, M9, M10, M11, M12) — Fix broken functionality
4. **Code quality** (M1, M2, M6, M7, L1-L7) — Clean up
5. **Build fixes** (B1-B4) — Clean lint, optimize bundles
6. **Test setup** — Vitest config, first auth tests

---

*Generated: 2026-02-17 by quality gate agents*
