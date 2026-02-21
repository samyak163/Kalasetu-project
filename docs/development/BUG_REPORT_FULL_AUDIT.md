# KalaSetu Full Platform Audit — Bug Report

> **Audit Date:** 2026-02-21
> **Audited By:** Claude Code (Chrome MCP browser automation)
> **Environment:** Local dev — Backend port 5000, Frontend port 5173
> **Demo Accounts Used:** Rahul Deshmukh (user), Priya Sharma (artisan), KalaSetu Admin (super_admin)
> **Branch:** `claude/xenodochial-matsumoto`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Critical Bugs](#critical-bugs)
3. [High Severity Bugs](#high-severity-bugs)
4. [Medium Severity Bugs](#medium-severity-bugs)
5. [Low Severity Bugs](#low-severity-bugs)
6. [Pages That Passed Audit](#pages-that-passed-audit)
7. [Architectural Issues](#architectural-issues)
8. [Recommended Fix Order](#recommended-fix-order)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 5 |
| HIGH     | 8 |
| MEDIUM   | 10 |
| LOW      | 7 |
| **Total** | **30** |

### Audit Coverage

| Area | Pages Tested | Status |
|------|-------------|--------|
| **Public pages** | Homepage, Services, Artisan Profile, Legal pages | Fully tested |
| **User (customer) flows** | Login, Register, Dashboard, Payments, Preferences | Fully tested |
| **Artisan flows** | Login, Dashboard (all tabs), Service CRUD, Profile | Fully tested |
| **Admin panel** | All 9 pages (Dashboard, Artisans, Users, Reviews, Payments, Refunds, Bookings, Analytics, Settings) | Fully tested |

---

## Critical Bugs

### BUG-001: Payments Page Crash (TypeError)

- **Severity:** CRITICAL
- **Area:** User (Customer)
- **URL:** `/payments` (direct navigation)
- **Symptom:** White screen crash with `TypeError: payments.map is not a function`
- **Root Cause:** The payments page component attempts to call `.map()` on the API response, but the response is not an array (likely an object with `{ success, data }` wrapper, or the endpoint returns an error/non-array).
- **Files to investigate:**
  - `kalasetu-frontend/src/pages/PaymentsPage.jsx` — Shell component
  - `kalasetu-frontend/src/pages/dashboard/user/UserPayments.jsx:39` — `res.data.data || []` fallback, but line 89 calls `payments.map()` which crashes if the fallback didn't work
- **Fix approach:** Ensure `payments` state is always initialized as `[]` and the API response is validated as an array before setting state. Add error boundary.

---

### BUG-002: No 404 Page (Catch-all Route Shows "Artisan Not Found")

- **Severity:** CRITICAL
- **Area:** Public / All Users
- **URL:** Any invalid URL, e.g. `/nonexistent-page`
- **Symptom:** Instead of a proper 404 page, users see "Artisan not found" with artisan profile layout. This is confusing — users think they navigated to an artisan page.
- **Root Cause:** The `/:publicId` route in App.jsx matches ANY single-segment path before the catch-all `*` route can handle it. React Router matches `/:publicId` for `/nonexistent-page`, then `ArtisanProfilePage.jsx` tries to load that as an artisan publicId, fails, and shows "Artisan not found".
- **Files:**
  - `kalasetu-frontend/src/App.jsx:197` — Catch-all route exists but never reached for single-segment paths
  - `kalasetu-frontend/src/pages/ArtisanProfilePage.jsx:205` — Shows "Artisan not found" instead of redirecting to 404
- **Fix approach:** In `ArtisanProfilePage`, when the artisan lookup fails (404 from API), redirect to the NotFoundPage or render the NotFoundPage component. Alternatively, restructure the route to use `/artisan/:publicId` prefix.

---

### BUG-003: Admin Settings Page Inaccessible (Permission Bug)

- **Severity:** CRITICAL
- **Area:** Admin Panel
- **URL:** `/admin/settings`
- **Symptom:** Navigating to Settings redirects back to `/admin/login` even when logged in as super_admin. On first load, briefly shows "You do not have permission to perform this action" before redirect.
- **Root Cause:** The `checkPermission` middleware in the backend does NOT have a bypass for `super_admin` role. It blindly checks `req.user.permissions[resource][action]`. The Admin model defaults `settings.view` and `settings.edit` to `false` (line 80-82 of adminModel.js). The seed script doesn't override these. So even super_admin gets a 403 on `/api/admin/settings`, which the frontend interprets as an auth failure and redirects to login.
- **Files:**
  - `kalasetu-backend/middleware/authMiddleware.js:138-146` — `checkPermission` function:
    ```javascript
    export const checkPermission = (resource, action) => {
        return (req, res, next) => {
            if (!req?.user?.permissions?.[resource] || req.user.permissions[resource][action] !== true) {
                res.status(403);
                return next(new Error('You do not have permission to perform this action'));
            }
            next();
        };
    };
    ```
  - `kalasetu-backend/models/adminModel.js:80-82` — Settings defaults:
    ```javascript
    settings: {
        view: { type: Boolean, default: false },
        edit: { type: Boolean, default: false }
    }
    ```
  - `kalasetu-backend/routes/adminRoutes.js:159-160` — Routes that use this permission:
    ```javascript
    router.get('/settings', protectAdmin, checkPermission('settings', 'view'), getSettings);
    router.put('/settings', protectAdmin, checkPermission('settings', 'edit'), updateSettings);
    ```
- **Fix approach (RECOMMENDED):** Add super_admin bypass at the top of `checkPermission`:
  ```javascript
  export const checkPermission = (resource, action) => {
      return (req, res, next) => {
          if (req?.user?.role === 'super_admin') return next(); // bypass for super admin
          if (!req?.user?.permissions?.[resource] || req.user.permissions[resource][action] !== true) {
              res.status(403);
              return next(new Error('You do not have permission to perform this action'));
          }
          next();
      };
  };
  ```
  This is better than changing model defaults because it future-proofs against any new permission being added with `default: false`.

---

### BUG-004: Admin Dashboard Data Fetch Error

- **Severity:** CRITICAL
- **Area:** Admin Panel
- **URL:** `/admin/dashboard`
- **Symptom:** "An error occurred while fetching dashboard data" — the main admin landing page is broken.
- **Root Cause:** The dashboard endpoint likely fails on the backend. Could be a database aggregation error, or the endpoint may not exist. Backend logs didn't show a specific error for this route (possibly swallowed by error middleware).
- **Files to investigate:**
  - `kalasetu-frontend/src/pages/admin/AdminDashboard.jsx` — Frontend component
  - `kalasetu-backend/routes/adminRoutes.js` — Find the dashboard stats endpoint
  - `kalasetu-backend/controllers/adminController.js` — Find the handler function
- **Fix approach:** Check backend logs when hitting `/admin/dashboard`, identify the failing API call, fix the aggregation or data fetch.

---

### BUG-005: Artisan Bookings Tab "Failed to Load Bookings"

- **Severity:** CRITICAL
- **Area:** Artisan Dashboard
- **URL:** `/dashboard` → Bookings tab
- **Symptom:** "Failed to load bookings" error. The artisan (Priya) cannot see any bookings despite having 6 bookings visible in the admin panel.
- **Root Cause:** The bookings API endpoint for artisans is either returning an error, or the frontend is calling the wrong endpoint. The admin panel at `/admin/bookings` shows all 6 bookings successfully, so the data exists.
- **Files to investigate:**
  - `kalasetu-frontend/src/components/profile/tabs/BookingsTab.jsx` — Frontend component
  - `kalasetu-backend/routes/bookingRoutes.js` — Artisan bookings endpoint
  - Check if the endpoint uses `protect` middleware (artisan auth) correctly
- **Fix approach:** Test the artisan bookings API directly (`GET /api/bookings` with artisan auth cookie). Check if the endpoint filters by artisan ID correctly.

---

## High Severity Bugs

### BUG-006: Auth Pages Accessible While Logged In

- **Severity:** HIGH
- **Area:** User / Artisan
- **URL:** `/login`, `/register`, `/artisan/login`, `/artisan/register`, `/user/login`, `/user/register`
- **Symptom:** Logged-in users can navigate to login/register pages. They should be redirected to their dashboard.
- **Root Cause:** `App.jsx` (lines 82-87, 94-95) renders auth routes without any "redirect if authenticated" guard. The `RequireAuth` component only protects private routes — there's no inverse guard for auth routes.
- **Files:**
  - `kalasetu-frontend/src/App.jsx:82-87, 94-95` — Unprotected auth routes
  - `kalasetu-frontend/src/components/RequireAuth.jsx` — Only handles private route protection
- **Fix approach:** Create a `RedirectIfAuthenticated` wrapper component that checks `auth.user` and redirects to `/dashboard` (artisan) or `/` (user). Wrap all auth routes with it.

---

### BUG-007: "Top Artisans Near You" Always Empty

- **Severity:** HIGH
- **Area:** Public / Homepage
- **URL:** Homepage, below the hero section
- **Symptom:** "Top Artisans Near You" section always shows "No artisans found nearby" with an empty state, even though Priya Sharma exists and is verified.
- **Root Cause:** The component calls `/api/artisans/nearby` which requires geolocation. If geolocation is denied or unavailable, the fallback to `/api/artisans` also returns empty (possibly due to query params or error handling).
- **Files:**
  - `kalasetu-frontend/src/components/Maps/NearbyArtisans.jsx:32-76` — Fetch logic with fallback
  - `kalasetu-frontend/src/components/Maps/NearbyArtisans.jsx:101-113` — Empty state
- **Fix approach:** Ensure the fallback path (`/api/artisans` without location) actually returns artisans. Consider showing "Featured Artisans" instead of "Nearby" when location is unavailable.

---

### BUG-008: Forgot Password "Back to Login" Links to Wrong Page

- **Severity:** HIGH
- **Area:** Auth Flow
- **URL:** `/forgot-password`
- **Symptom:** When accessed from the user login context, "Back to Login" should go to `/user/login` but may link to `/artisan/login` depending on how the component determines context.
- **Files:**
  - `kalasetu-frontend/src/pages/ForgotPassword.jsx:29` — `loginPath` variable
  - `kalasetu-frontend/src/pages/ForgotPassword.jsx:89-91` — "Back to Login" link
- **Fix approach:** Verify that the `isUser` / context prop is correctly passed from the route. If the forgot password page is shared between both user types, ensure the route passes the correct context. Test both `/forgot-password` (from artisan login) and `/user/forgot-password` (from user login).

---

### BUG-009: Artisan Login "Create New Account" Links to Wrong Route

- **Severity:** HIGH
- **Area:** Auth Flow
- **URL:** `/artisan/login`
- **Symptom:** "Create new account" link goes to `/register` (the generic registration selector) instead of `/artisan/register`.
- **Files:**
  - `kalasetu-frontend/src/pages/LoginPage.jsx:110` — `<Link to="/register">` should be `<Link to="/artisan/register">`
- **Fix approach:** Change the link destination to `/artisan/register` when the LoginPage is rendered in artisan context.

---

### BUG-010: Artisan Dashboard Rating Mismatch (3 Different Values)

- **Severity:** HIGH
- **Area:** Artisan Dashboard
- **URL:** `/dashboard`
- **Symptom:** Three different rating values shown across the platform for the same artisan (Priya Sharma):
  - **Dashboard overview:** 0.0 rating, 0 reviews (WRONG)
  - **Dashboard Reviews tab:** 4.6 rating, 5 reviews
  - **Public profile page:** 4.7 rating, 28 reviews
- **Root Cause:** Three different data sources / API endpoints return inconsistent data:
  1. Dashboard stats endpoint returns zeros (likely not aggregating reviews)
  2. Reviews tab queries the Review collection directly (5 actual reviews)
  3. Public profile uses the Artisan model's `rating` and `totalReviews` fields (possibly stale/hardcoded seed data showing 28 reviews when only 5 exist)
- **Files to investigate:**
  - `kalasetu-frontend/src/components/profile/tabs/DashboardOverviewTab.jsx` — Dashboard stats
  - `kalasetu-frontend/src/components/profile/tabs/ReviewsTab.jsx` — Reviews tab
  - `kalasetu-frontend/src/pages/ArtisanProfilePage.jsx` — Public profile
  - `kalasetu-backend/models/artisanModel.js` — `rating` and `totalReviews` fields
  - `kalasetu-backend/scripts/seedShowcase.js` — Check if rating is hardcoded in seed
- **Fix approach:** Ensure all three views derive rating from the same source (the Review collection aggregation). The artisan model's `rating` field should be updated via a post-save hook on Review, or computed on-the-fly.

---

### BUG-011: Artisan Dashboard Empty Stat Cards

- **Severity:** HIGH
- **Area:** Artisan Dashboard
- **URL:** `/dashboard` → Overview tab
- **Symptom:** "Active Bookings", "Completed", and "Total Earned" all show as empty/zero despite the admin panel confirming 6 bookings (2 completed) exist.
- **Files:**
  - `kalasetu-frontend/src/components/profile/tabs/DashboardOverviewTab.jsx:61-66` — References `stats?.activeBookings`, `stats?.completedBookings`, `stats?.totalEarnings`
  - Backend: Artisan stats endpoint (likely `/api/artisan/stats` or `/api/artisan/dashboard`)
- **Fix approach:** Check what the stats API returns. The endpoint probably isn't aggregating bookings for this artisan correctly, or returns an empty object.

---

### BUG-012: Artisan Dashboard Shows "No Bookings Yet"

- **Severity:** HIGH
- **Area:** Artisan Dashboard
- **URL:** `/dashboard` → Overview tab
- **Symptom:** Shows "No bookings yet" on the overview despite 6 bookings existing (visible in admin panel).
- **Root Cause:** Related to BUG-011. The dashboard overview likely calls the same stats/bookings API that returns empty data.
- **Files:** Same as BUG-011
- **Fix approach:** Fix the underlying stats API (same fix as BUG-011).

---

### BUG-013: Admin Session Expires on Settings Navigation

- **Severity:** HIGH
- **Area:** Admin Panel
- **URL:** `/admin/settings`
- **Symptom:** After logging into admin and browsing other pages successfully, navigating to Settings causes redirect to login. Re-logging and going directly to Settings also redirects to login. Other admin pages work fine.
- **Root Cause:** This is a consequence of BUG-003. The 403 response from the settings API is being interpreted by the frontend's AdminAuthContext as an authentication failure, triggering a logout/redirect. The frontend should distinguish between 401 (unauthorized / session expired) and 403 (forbidden / no permission).
- **Files:**
  - `kalasetu-frontend/src/context/AdminAuthContext.jsx` — Check how it handles 403 vs 401
- **Fix approach:** Fix BUG-003 first (add super_admin bypass). Also fix the frontend to NOT redirect to login on 403 — show a "Permission Denied" message instead.

---

## Medium Severity Bugs

### BUG-014: Duplicate Search Forms & City Buttons in Navbar

- **Severity:** MEDIUM
- **Area:** Public / All Pages
- **URL:** Any page with the navbar
- **Symptom:** The navbar shows two sets of search inputs and location dropdowns — one for desktop and one for mobile — but both are visible at certain viewport widths.
- **Files:**
  - `kalasetu-frontend/src/components/Header.jsx:108-154` — Desktop location + search
  - `kalasetu-frontend/src/components/Header.jsx:200-240` — Mobile location + search
- **Fix approach:** Ensure mobile elements are hidden with `hidden md:flex` / `md:hidden` Tailwind classes consistently.

---

### BUG-015: Nested `<main>` Elements (Accessibility Violation)

- **Severity:** MEDIUM
- **Area:** Public / All Pages
- **URL:** Any page
- **Symptom:** HTML has nested `<main>` elements, violating ARIA rules. Screen readers may have difficulty identifying the primary content.
- **Files to investigate:**
  - `kalasetu-frontend/src/App.jsx` or layout component — Likely wraps content in `<main>`
  - Individual page components — Some may also have their own `<main>` tag
- **Fix approach:** Ensure only ONE `<main>` element exists in the DOM tree. Use `<div>` or `<section>` for inner wrappers.

---

### BUG-016: "1 results" Grammar Bug

- **Severity:** MEDIUM
- **Area:** Public / Search
- **URL:** `/services` (search results page)
- **Symptom:** Shows "1 results" instead of "1 result" when a single search result is found.
- **Fix approach:** Add conditional pluralization: `${count} result${count !== 1 ? 's' : ''}`

---

### BUG-017: Currency Symbol Missing from Artisan Profile Services

- **Severity:** MEDIUM
- **Area:** Public
- **URL:** Artisan profile page → Services section
- **Symptom:** Service prices shown without the ₹ symbol (e.g., "500" instead of "₹500").
- **Fix approach:** Add `₹` prefix to price display in the artisan profile services section.

---

### BUG-018: "Contact" Instead of Price on Some Service Cards

- **Severity:** MEDIUM
- **Area:** Public
- **URL:** Artisan profile page → Services section
- **Symptom:** Some services show "Contact" instead of displaying the actual price, even when a price exists in the database.
- **Fix approach:** Check the conditional logic that decides when to show "Contact" vs the actual price. Ensure it only shows "Contact" when the price is genuinely null/0.

---

### BUG-019: Admin Artisans — Category Shows "N/A"

- **Severity:** MEDIUM
- **Area:** Admin Panel
- **URL:** `/admin/artisans`
- **Symptom:** Priya Sharma's category shows "N/A" in the admin artisans table, despite being categorized as "Wellness & Beauty" on her public profile.
- **Root Cause:** The admin artisans endpoint might not populate the category field, or the frontend references a different field name than what the API returns.
- **Files to investigate:**
  - `kalasetu-frontend/src/pages/admin/AdminArtisans.jsx` — Check which field it renders for category
  - `kalasetu-backend/controllers/adminController.js` — Check the artisan listing query (may need `.populate()` or field selection)
  - `kalasetu-backend/models/artisanModel.js` — Check the `category` field definition

---

### BUG-020: Admin Artisans — Star Rating Shows 0

- **Severity:** MEDIUM
- **Area:** Admin Panel
- **URL:** `/admin/artisans`
- **Symptom:** Priya's rating shows as 0 stars in the admin artisan list, despite having a 4.6 average across 5 reviews.
- **Root Cause:** Related to BUG-010. The admin endpoint reads the Artisan model's `rating` field which may not be kept in sync with actual reviews.

---

### BUG-021: Admin Refunds — Inconsistent Stat Card Layout

- **Severity:** MEDIUM
- **Area:** Admin Panel
- **URL:** `/admin/refunds`
- **Symptom:** The "Processed" stat card shows both a count ("0") and a small "₹0" amount below it. Other stat cards (Total Requests, Pending, Processing, Rejected) only show counts. This creates visual inconsistency.
- **Fix approach:** Either add the ₹ amount to all stat cards that deal with money, or remove it from "Processed" to match the others.

---

### BUG-022: Admin Bookings — Rejected Status Missing from Stats

- **Severity:** MEDIUM
- **Area:** Admin Panel
- **URL:** `/admin/bookings`
- **Symptom:** Stat cards show: Total=6, Upcoming=1, Completed=2, Cancelled=1 — that accounts for only 4 bookings. The 2 "Rejected" bookings are not represented in any stat card.
- **Fix approach:** Add a "Rejected" stat card, or include rejected bookings in one of the existing categories.

---

### BUG-023: Service Modal — No Unsaved Changes Warning

- **Severity:** MEDIUM
- **Area:** Artisan Dashboard
- **URL:** `/dashboard` → Services tab → Add/Edit Service
- **Symptom:** Clicking outside the Add Service modal dismisses it immediately, losing all form data without a confirmation dialog.
- **Fix approach:** Add a `beforeClose` check — if form has unsaved changes, show "Discard changes?" confirmation.

---

## Low Severity Bugs

### BUG-024: Footer Shows Auth Links When Logged In

- **Severity:** LOW
- **Area:** Public / All Pages
- **URL:** Any page (footer)
- **Symptom:** Footer always shows "Artisan Login", "Join as Artisan", "Customer Login", "Sign Up" links even when the user is already logged in.
- **Files:**
  - `kalasetu-frontend/src/components/Footer.jsx:29-40` — No conditional rendering based on auth state
- **Fix approach:** Import `useAuth()` in Footer and conditionally hide auth links (or replace with "Dashboard" link) when `auth.user` exists.

---

### BUG-025: Privacy Policy "USER" in All Caps

- **Severity:** LOW
- **Area:** Legal Pages
- **URL:** `/privacy`
- **Symptom:** The Privacy Policy page uses "USER" in all-caps in body text, which looks like a template placeholder that wasn't properly replaced.
- **Fix approach:** Replace "USER" with "User" or "user" in the privacy policy text.

---

### BUG-026: Preferences Page Is a Placeholder

- **Severity:** LOW
- **Area:** User Dashboard
- **URL:** `/preferences` or user dashboard → Preferences
- **Symptom:** The preferences page exists in the navigation but shows placeholder content with no functional settings.
- **Fix approach:** Either implement real preferences (notification settings, language, etc.) or remove the link from navigation to avoid confusion.

---

### BUG-027: Footer Description Truncated

- **Severity:** LOW
- **Area:** Public / All Pages
- **URL:** Any page (footer)
- **Symptom:** The footer's KalaSetu description text appears cut off mid-sentence.
- **Fix approach:** Complete the description text.

---

### BUG-028: "2-5" Without Context on Artisan Profile

- **Severity:** LOW
- **Area:** Public
- **URL:** Artisan profile page (e.g., Priya Sharma)
- **Symptom:** Text "2-5" appears on the artisan profile without any label or context. Likely represents years of experience or a rating range, but is meaningless without a label.
- **Fix approach:** Add a label like "2-5 years experience" or whatever the field represents.

---

### BUG-029: Video Calls Page Shows "Unavailable"

- **Severity:** LOW (expected in dev)
- **Area:** User Dashboard
- **URL:** Video calls section
- **Symptom:** "Video Calls Unavailable — Video calls are not available at this time."
- **Root Cause:** Daily.co is not configured in the local dev environment (no `DAILY_API_KEY` env var). This is **expected behavior** in development — not a production bug.
- **Fix approach:** No fix needed for dev. Optionally add a dev-mode banner explaining "Video calls require Daily.co configuration."

---

### BUG-030: Admin Login Autofills Wrong Credentials

- **Severity:** LOW
- **Area:** Admin Panel
- **URL:** `/admin/login`
- **Symptom:** Browser autofills the admin login form with the user's credentials (`rahul@kalasetu.demo`) from the regular login form.
- **Fix approach:** Add `autocomplete="new-password"` to the password field and/or use a distinct `name` attribute to prevent browser autofill from matching.

---

## Pages That Passed Audit

These pages were tested and found to be working correctly:

| Page | Area | Notes |
|------|------|-------|
| Homepage hero & categories | Public | Beautiful design, categories clickable |
| Services listing page | Public | Search, filters, grid view all work (aside from "1 results" grammar) |
| Artisan profile page | Public | Services, portfolio, reviews all render (aside from minor display bugs) |
| Terms of Service | Public | Full content rendered correctly |
| Artisan Registration | Auth | Multi-step form works |
| User Registration | Auth | Form works correctly |
| Service CRUD (Create) | Artisan | Successfully created "Festival Mehndi Special" service |
| Service CRUD (Edit) | Artisan | Edit modal loads with existing data, saves correctly |
| Artisan Reviews tab | Artisan | Shows 5 reviews with 4.6 average, details expandable |
| Artisan Earnings tab | Artisan | Loads (shows zeros — expected with no payments) |
| Admin Artisans page | Admin | Lists artisans with search, filters, stats |
| Admin Users page | Admin | Lists 6 users with details |
| Admin Reviews page | Admin | 5 reviews, stats correct, filters work |
| Admin Payments page | Admin | Empty state correct (no payments), CSV export present |
| Admin Refunds page | Admin | Empty state correct, filters work |
| Admin Bookings page | Admin | 6 bookings with full details, Table/Calendar toggle, CSV export |
| Admin Analytics page | Admin | Revenue, bookings, categories all display correctly |

---

## Architectural Issues

### Issue 1: `checkPermission` Has No `super_admin` Bypass

**Impact:** Any new permission added with `default: false` will silently block super admins.

**Location:** `kalasetu-backend/middleware/authMiddleware.js:138-146`

**Current behavior:** Checks `req.user.permissions[resource][action] === true` for every request, including super_admin.

**Correct behavior:** `super_admin` should bypass all permission checks. The role hierarchy documented in `adminModel.js` says "super_admin — Full access to all resources" but the code doesn't implement this.

**Fix:** Add `if (req?.user?.role === 'super_admin') return next();` at the top of the middleware function.

---

### Issue 2: Rating Data is Inconsistent Across 3 Endpoints

**Impact:** Users, artisans, and admins all see different rating numbers for the same artisan.

**Root cause candidates:**
1. The Artisan model has `rating` and `totalReviews` fields that are set during seeding but never updated when new reviews are added
2. The dashboard stats endpoint computes ratings differently (or doesn't compute them at all)
3. The reviews tab does a correct aggregation from the Review collection

**Fix approach:** Use a single source of truth — either:
- (A) Add a post-save hook on Review model that recalculates and updates the Artisan's `rating` and `totalReviews`, OR
- (B) Always compute ratings on-the-fly from the Review collection (more accurate but slower)

---

### Issue 3: Frontend Treats 403 as Authentication Failure

**Impact:** Permission denied (403) triggers the same redirect-to-login flow as session expired (401), causing confusing UX.

**Location:** `kalasetu-frontend/src/context/AdminAuthContext.jsx`

**Fix:** Only redirect to login on 401. On 403, show an in-page "Permission Denied" message.

---

### Issue 4: Artisan Dashboard Stats API Appears Broken

**Impact:** The primary artisan management interface shows all-zero stats and "No bookings yet", making it useless for artisans.

**Likely cause:** The artisan dashboard stats endpoint either:
- Returns empty data
- Doesn't aggregate bookings correctly for the authenticated artisan
- Has a query filter bug (e.g., filtering by wrong artisan ID field)

**Investigation steps:**
1. Find the stats API endpoint (likely `/api/artisan/dashboard` or `/api/artisan/stats`)
2. Call it directly with Priya's auth cookie
3. Check the MongoDB aggregation pipeline

---

## Recommended Fix Order

Priority order based on user impact and fix complexity:

| Priority | Bug(s) | Effort | Impact |
|----------|--------|--------|--------|
| 1 | BUG-003 (checkPermission bypass) | 5 min | Unblocks admin settings + prevents future permission bugs |
| 2 | BUG-005 + BUG-011 + BUG-012 (Artisan dashboard/bookings) | 1-2 hrs | Artisan's primary management interface is broken |
| 3 | BUG-004 (Admin dashboard error) | 30 min | Admin landing page broken |
| 4 | BUG-010 (Rating mismatch) | 1 hr | Data integrity issue visible to all user types |
| 5 | BUG-001 (Payments crash) | 15 min | TypeError crash on navigation |
| 6 | BUG-002 (No 404 page) | 30 min | Bad UX for all invalid URLs |
| 7 | BUG-006 (Auth pages when logged in) | 20 min | Security/UX issue |
| 8 | BUG-013 (403 vs 401 handling) | 30 min | Prevents future admin confusion |
| 9 | BUG-007 (Nearby artisans empty) | 30 min | Homepage section always empty |
| 10 | Remaining MEDIUM/LOW bugs | 2-3 hrs | Polish and completeness |

---

## Test Data State After Audit

During the audit, the following test data was created:
- **New service:** "Festival Mehndi Special" (₹1,200, 45 min, Wellness & Beauty category) — created under Priya Sharma's account
- This service should be removed during cleanup or noted as test data

---

## How to Reproduce

1. Start backend: `cd kalasetu-backend && npm run dev`
2. Start frontend: `cd kalasetu-frontend && npm run dev`
3. Seed database: `cd kalasetu-backend && npm run seed`
4. Demo accounts:
   - User: `rahul@kalasetu.demo` / `Demo@1234`
   - Artisan: `priya@kalasetu.demo` / `Demo@1234`
   - Admin: `admin@kalasetu.demo` / `Admin@1234`
5. Navigate to each URL listed in the bug reports above to reproduce
