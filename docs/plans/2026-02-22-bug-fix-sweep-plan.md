# Bug-Fix Sweep Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 29 platform bugs across 5 waves with agent-team parallelism and verification gates.

**Architecture:** Wave-based execution — sequential waves, parallel agents within each wave. Foundation infrastructure fixes first (auth middleware, routing), then backend APIs, then frontend UI, then polish. Each wave commits only after build verification passes.

**Tech Stack:** Node.js/Express (backend), React 18 + Tailwind (frontend), MongoDB/Mongoose (database), Vite (build)

---

## Pre-Flight

### Step 0.1: Create feature branch

```bash
cd kalasetu-project
git checkout main && git pull
git checkout -b fix/full-audit-sweep
```

### Step 0.2: Verify clean build

```bash
cd kalasetu-frontend && npm run build && npm run lint
```

Expected: zero errors, zero warnings in src/

---

## Wave 1: Foundation (Sequential — 3 bugs)

> These fix shared infrastructure. Must land before any other wave.

### Task 1.1: BUG-003 — Add super_admin bypass to checkPermission

**Files:**
- Modify: `kalasetu-backend/middleware/authMiddleware.js:138-146`

**Step 1: Apply fix**

In `authMiddleware.js`, the `checkPermission` function at line 138 currently checks permissions without any role bypass. Add `super_admin` bypass as the first line inside the returned middleware:

```javascript
export const checkPermission = (resource, action) => {
    return (req, res, next) => {
        // super_admin bypasses all permission checks
        if (req?.user?.role === 'super_admin') return next();
        if (!req?.user?.permissions?.[resource] || req.user.permissions[resource][action] !== true) {
            res.status(403);
            return next(new Error('You do not have permission to perform this action'));
        }
        next();
    };
};
```

**Step 2: Verify**

Start backend: `cd kalasetu-backend && npm run dev`
The admin settings endpoint (`GET /api/admin/settings`) should now return 200 for super_admin instead of 403.

---

### Task 1.2: BUG-013 — Distinguish 403 vs 401 in admin panel

**Files:**
- Modify: `kalasetu-frontend/src/components/admin/AdminLayout.jsx:41-43`

**Step 1: Add permission denied state to AdminLayout**

Currently `AdminLayout.jsx` line 41-43 redirects to login when `!isAuthenticated`. This is correct for 401 (not logged in). But the problem is that `AdminAuthContext.jsx` sets `isAuthenticated = false` on ANY error (line 33), including 403.

Fix `AdminAuthContext.jsx` — in the `checkAuth` function (line 25-40), the catch block at line 33 clears auth on any error. We need it to only clear on 401:

In `kalasetu-frontend/src/context/AdminAuthContext.jsx`, replace the catch block:

```javascript
  const checkAuth = async () => {
    try {
      const response = await api.get('/api/admin/auth/me');
      if (response.data.success) {
        if (response.data.csrfToken) setCsrfToken(response.data.csrfToken);
        setAdmin(response.data.admin);
        setIsAuthenticated(true);
      }
    } catch (err) {
      // Only clear auth on 401 (unauthorized) — not on 403 (forbidden)
      if (err.response?.status !== 403) {
        setAdmin(null);
        setIsAuthenticated(false);
        setCsrfToken(null);
      }
    } finally {
      setLoading(false);
    }
  };
```

Note: This `checkAuth` only fires on `/api/admin/auth/me` (which never returns 403), so this is a safety net. The real fix is BUG-003 above. But we also need to prevent page-level 403s from triggering logout. Add an axios interceptor approach is overkill — BUG-003 fix eliminates the source.

**Step 2: Verify**

With BUG-003 fix applied, navigate to `/admin/settings` as super_admin. Should load settings page without redirecting to login.

---

### Task 1.3: BUG-002 — Fix 404 routing for invalid URLs

**Files:**
- Modify: `kalasetu-frontend/src/pages/ArtisanProfilePage.jsx:200-212`

**Step 1: Import NotFoundPage and render it instead of the error Alert**

In `ArtisanProfilePage.jsx`, the error state at lines 200-212 currently shows an inline "Artisan not found" Alert. Replace it with the actual NotFoundPage component.

Add import at top of file:
```javascript
import NotFoundPage from './NotFoundPage';
```

Replace the error block (lines 200-212):

```javascript
  // ---------- Error state ----------
  if (error || !artisan) {
    // If artisan not found (404 from API or no data), show the global 404 page
    // This handles /:publicId matching for non-artisan URLs like /nonexistent-page
    return <NotFoundPage />;
  }
```

**Step 2: Verify**

Navigate to `/nonexistent-page` — should show the NotFoundPage with search and category links, not "Artisan not found" with artisan profile layout.

---

### Task 1.4: Wave 1 verification gate

```bash
cd kalasetu-frontend && npm run build && npm run lint
```

Expected: zero errors. If clean, commit:

```bash
git add kalasetu-backend/middleware/authMiddleware.js kalasetu-frontend/src/context/AdminAuthContext.jsx kalasetu-frontend/src/pages/ArtisanProfilePage.jsx
git commit -m "fix: wave 1 — checkPermission bypass, 403 handling, 404 routing (BUG-002,003,013)"
```

---

## Wave 2: Backend API Fixes (3 parallel agents — 5 bugs)

> Agents A, B, C run in parallel. No file overlap between them.

### Task 2.1 (Agent A): BUG-004 — Fix admin dashboard stats

**Files:**
- Modify: `kalasetu-backend/controllers/adminDashboardController.js:62-163`

**Step 1: Investigate and fix the payment aggregation**

The `getDashboardStats` function at line 96-104 aggregates payments with `{ $match: { status: 'completed' } }`. But the Payment model uses Razorpay statuses: `created`, `pending`, `authorized`, `captured`, `refunded`, `failed`. The status `'completed'` never matches any documents.

Fix: Change the match filter at line 98 to use the correct statuses:

```javascript
    let paymentStats = { totalRevenue: 0, totalTransactions: 0 };
    try {
      const payments = await Payment.aggregate([
        { $match: { status: { $in: ['captured', 'paid'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' }, totalTransactions: { $sum: 1 } } }
      ]);
      if (payments.length > 0) paymentStats = payments[0];
    } catch {
      // ignore if payments not available
    }
```

**Step 2: Also verify the endpoint doesn't crash**

The entire function is wrapped in try/catch and returns 500 on error. But check that all the aggregation pipelines (lines 75-133) work with the seed data. The `Artisan.aggregate` for `topCategories` groups by `$category` but the artisan model field is `craft`, not `category`. This returns empty results but doesn't crash.

Fix the topCategories aggregation at line 129 to use `$craft`:

```javascript
    const topCategories = await Artisan.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$craft', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
```

**Step 3: Verify**

Start backend, hit `GET /api/admin/dashboard/stats` — should return 200 with overview data. `topCategories` should show actual craft values.

---

### Task 2.2 (Agent B): BUG-005 + BUG-011 + BUG-012 — Fix artisan bookings and dashboard stats

**Files:**
- Investigate: `kalasetu-backend/controllers/bookingController.js:256-264`
- Investigate: `kalasetu-backend/controllers/artisanDashboardController.js:31-133`
- Investigate: `kalasetu-frontend/src/components/profile/tabs/BookingsTab.jsx`
- Investigate: `kalasetu-frontend/src/components/profile/tabs/DashboardOverviewTab.jsx`

**Step 1: Debug the artisan bookings endpoint**

`getArtisanBookings` (bookingController.js:256-264) uses `req.user?._id` to query bookings. The `protect` middleware sets `req.user` to the Artisan document. This should work.

Check if the issue is that bookings were created with a different artisan ID format (string vs ObjectId). The seed script may create bookings with `artisan: artisanId` as string.

**Investigation approach:**
1. Start backend with `npm run dev`
2. Log in as Priya (artisan) via the frontend
3. Check browser dev tools Network tab for `/api/bookings/artisan` — what error/response comes back?
4. Check backend console for any errors
5. Verify in MongoDB: `db.bookings.find({ artisan: ObjectId("...priya's id...") })` — do documents exist?

**Step 2: Fix root cause**

Most likely fix: The seed script creates bookings but may not cast `artisan` field to ObjectId. Or the `protect` middleware's `req.user._id` type doesn't match the stored reference.

If the issue is the seed script, fix the seed to use proper ObjectId references.

If the aggregate in `artisanDashboardController.js:44` uses `artisanId` directly from `req.user._id` (which is an ObjectId), but `Booking.aggregate` needs `$match: { artisan: artisanId }` — this should work since Mongoose aggregations don't auto-cast. Ensure `artisanId` is indeed an ObjectId:

```javascript
import mongoose from 'mongoose';
// ... in getDashboardStats:
const artisanId = new mongoose.Types.ObjectId(req.user._id);
```

**Step 3: Verify**

After fix: Login as Priya → Dashboard shows non-zero stats. Bookings tab shows the 6 bookings. `DashboardOverviewTab` shows correct `activeBookings`, `completedBookings`, `totalEarnings`.

---

### Task 2.3 (Agent C): BUG-010 + BUG-020 — Fix rating sync

**Files:**
- Modify: `kalasetu-backend/models/reviewModel.js` (add post-save hook)
- Modify: `kalasetu-backend/models/artisanModel.js:161-162` (field reference)
- Investigate: `kalasetu-backend/scripts/seedShowcase.js` (seed data)

**Step 1: Add post-save hook to Review model**

After a review is created or updated, recalculate the artisan's average rating and total review count. Add this hook at the end of `reviewModel.js`, before `export default`:

```javascript
// Recalculate artisan's averageRating and totalReviews after every review save
reviewSchema.post('save', async function () {
  try {
    const Review = this.constructor;
    const stats = await Review.aggregate([
      { $match: { artisan: this.artisan, status: 'active' } },
      {
        $group: {
          _id: '$artisan',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const Artisan = (await import('./artisanModel.js')).default;
    if (stats.length > 0) {
      await Artisan.findByIdAndUpdate(this.artisan, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    } else {
      await Artisan.findByIdAndUpdate(this.artisan, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (err) {
    // Non-critical — log but don't fail the review save
    console.error('Failed to update artisan rating stats:', err.message);
  }
});

// Also recalculate after review deletion/status change
reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (!doc) return;
  try {
    const Review = doc.constructor;
    const stats = await Review.aggregate([
      { $match: { artisan: doc.artisan, status: 'active' } },
      {
        $group: {
          _id: '$artisan',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const Artisan = (await import('./artisanModel.js')).default;
    if (stats.length > 0) {
      await Artisan.findByIdAndUpdate(doc.artisan, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    } else {
      await Artisan.findByIdAndUpdate(doc.artisan, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (err) {
    console.error('Failed to update artisan rating stats:', err.message);
  }
});
```

**Step 2: Fix seed script**

In the seed script, after creating reviews, trigger a manual recalculation:

```javascript
// After all reviews are created, recalculate artisan stats
const reviewStats = await Review.aggregate([
  { $match: { artisan: artisan._id, status: 'active' } },
  { $group: { _id: '$artisan', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
]);
if (reviewStats.length > 0) {
  await Artisan.findByIdAndUpdate(artisan._id, {
    averageRating: Math.round(reviewStats[0].avg * 10) / 10,
    totalReviews: reviewStats[0].count
  });
}
```

**Step 3: Verify**

Re-seed: `cd kalasetu-backend && npm run seed`
Check Priya's profile: dashboard overview, reviews tab, and public profile should all show the same rating and review count.

---

### Task 2.4: Wave 2 verification gate

```bash
cd kalasetu-frontend && npm run build && npm run lint
```

Commit:
```bash
git add -A
git commit -m "fix: wave 2 — admin dashboard stats, artisan bookings/stats, rating sync (BUG-004,005,010,011,012,020)"
```

---

## Wave 3: Frontend Critical (4 parallel agents — 7 bugs)

> Agents D, E, F, G run in parallel. No file overlap.

### Task 3.1 (Agent D): BUG-001 — Fix payments page crash

**Files:**
- Modify: `kalasetu-frontend/src/pages/dashboard/user/UserPayments.jsx:35-44`

**Step 1: Add defensive array validation**

The `fetchPayments` function at line 38-39 does `res.data.data || []`. This handles undefined but not objects/non-arrays. Add explicit Array.isArray check:

```javascript
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/payments?type=sent&limit=50');
      const data = res.data?.data;
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load payments', 'error');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };
```

**Step 2: Verify**

Navigate to `/dashboard/payments` as a logged-in user. Should show either payment list or "No payments yet" EmptyState — never crash.

---

### Task 3.2 (Agent E): BUG-006 — Redirect authenticated users from auth pages

**Files:**
- Create: `kalasetu-frontend/src/components/RedirectIfAuth.jsx`
- Modify: `kalasetu-frontend/src/App.jsx:82-96`

**Step 1: Create RedirectIfAuth component**

```javascript
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Inverse of RequireAuth — redirects AWAY from auth pages if already logged in.
 * Artisans go to /artisan/dashboard, users go to /dashboard.
 */
const RedirectIfAuth = ({ children }) => {
  const { auth, loading } = useContext(AuthContext);

  if (loading) return null;

  if (auth.user) {
    const destination = auth.userType === 'artisan' ? '/artisan/dashboard' : '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default RedirectIfAuth;
```

**Step 2: Wrap auth routes in App.jsx**

Import at top:
```javascript
import RedirectIfAuth from './components/RedirectIfAuth';
```

Wrap auth routes (lines 82-96). Replace:

```jsx
{/* Unified Auth Selectors */}
<Route path="login" element={<AuthSelector />} />
<Route path="register" element={<RegisterSelector />} />

{/* Direct Artisan Auth Routes */}
<Route path="artisan/login" element={<LoginPage />} />
<Route path="artisan/register" element={<RegisterPage />} />

{/* USER Auth Routes (NEW) */}
<Route path="user/login" element={<UserLoginPage />} />
<Route path="user/register" element={<UserRegisterPage />} />
```

With:

```jsx
{/* Unified Auth Selectors */}
<Route path="login" element={<RedirectIfAuth><AuthSelector /></RedirectIfAuth>} />
<Route path="register" element={<RedirectIfAuth><RegisterSelector /></RedirectIfAuth>} />

{/* Direct Artisan Auth Routes */}
<Route path="artisan/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
<Route path="artisan/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />

{/* USER Auth Routes (NEW) */}
<Route path="user/login" element={<RedirectIfAuth><UserLoginPage /></RedirectIfAuth>} />
<Route path="user/register" element={<RedirectIfAuth><UserRegisterPage /></RedirectIfAuth>} />
```

**Step 3: Verify**

Login as Rahul → navigate to `/login` → should redirect to `/dashboard`.
Login as Priya → navigate to `/artisan/login` → should redirect to `/artisan/dashboard`.

---

### Task 3.3 (Agent F): BUG-007 — Fix NearbyArtisans always empty

**Files:**
- Modify: `kalasetu-frontend/src/components/Maps/NearbyArtisans.jsx:28-76`
- Investigate: `kalasetu-backend/routes/artisanRoutes.js` and controller for `/api/artisans` endpoint

**Step 1: Investigate why fallback returns empty**

The NearbyArtisans component (line 49) calls `/api/artisans` with `{ params: { limit: 20 } }` as fallback. The response is checked for `response.data?.artisans` (array) or `response.data` (array).

Check what the backend `/api/artisans` endpoint actually returns. It may return `{ success: true, data: [...] }` instead of `{ artisans: [...] }`.

**Step 2: Fix the response parsing**

In the fallback logic at lines 49-53 and 64-68, add support for `response.data.data` (the standard KalaSetu API response shape):

```javascript
      if (apiArtisans.length === 0) {
        try {
          const allResponse = await api.get('/api/artisans', {
            params: { limit: 20 }
          });
          const d = allResponse.data;
          const allArtisans = Array.isArray(d?.artisans) ? d.artisans
            : Array.isArray(d?.data) ? d.data
            : Array.isArray(d) ? d
            : [];
          setArtisans(allArtisans.slice(0, 10));
        } catch (fallbackErr) {
          console.warn('Fallback fetch failed:', fallbackErr);
          setArtisans([]);
        }
      }
```

Apply the same fix to the outer catch block fallback (lines 63-72).

**Step 3: Also check the nearby endpoint**

The primary endpoint `/api/artisans/nearby` requires artisans to have `location.coordinates` set. If Priya's seed data doesn't have coordinates, the geo query returns empty, and the fallback kicks in. Verify the seed script sets `location.coordinates` for Priya.

**Step 4: Verify**

Homepage → "Nearby Artisans" section should show Priya (or at least 1 artisan) instead of empty state.

---

### Task 3.4 (Agent G): BUG-008 + BUG-009 — Fix auth page cross-links

**Files:**
- Modify: `kalasetu-frontend/src/pages/LoginPage.jsx:110`
- Verify: `kalasetu-frontend/src/pages/ForgotPassword.jsx:29`

**Step 1: Fix LoginPage register link (BUG-009)**

At `LoginPage.jsx:110`, the "Create new account" link points to `/register` (generic selector). Since LoginPage is used exclusively for artisan login (it calls `artisanLogin()`), it should link to `/artisan/register`.

Change line 110:
```jsx
<Link to="/artisan/register" className="font-semibold text-brand-500 hover:text-brand-600 transition-colors">
  Create new account
</Link>
```

**Step 2: Verify ForgotPassword (BUG-008)**

`ForgotPassword.jsx:29` uses `const loginPath = USER ? '/user/login' : '/artisan/login';`. The `USER` prop is passed from the route in `App.jsx:96`:
```jsx
<Route path="user/forgot-password" element={<ForgotPassword USER />} />
```
And line 88:
```jsx
<Route path="forgot-password" element={<ForgotPassword />} />
```

This is correct — `/forgot-password` → artisan login, `/user/forgot-password` → user login. The bug report says the link may go to the wrong page "depending on how the component determines context" — but the prop-based approach is correct. Verify by visiting both URLs and checking the "Back to Login" link destination.

If the link works correctly, mark BUG-008 as "not reproducible with current code" in the commit message.

**Step 3: Verify**

`/artisan/login` → "Create new account" → should navigate to `/artisan/register`.
`/forgot-password` → "Back to Login" → should navigate to `/artisan/login`.
`/user/forgot-password` → "Back to Login" → should navigate to `/user/login`.

---

### Task 3.5: Wave 3 verification gate

```bash
cd kalasetu-frontend && npm run build && npm run lint
```

Commit:
```bash
git add -A
git commit -m "fix: wave 3 — payments crash, auth redirects, nearby artisans, login links (BUG-001,006,007,008,009)"
```

---

## Wave 4: Medium Severity (4 parallel agents — 9 bugs)

> Agents H, I, J, K run in parallel.

### Task 4.1 (Agent H): BUG-014 + BUG-015 — Duplicate search visibility + nested main

**Files:**
- Investigate: `kalasetu-frontend/src/components/Header.jsx:106,198`
- Modify: `kalasetu-frontend/src/pages/SearchResults.jsx:216`
- Investigate: `kalasetu-frontend/src/components/Layout.jsx:13`

**Step 1: Investigate BUG-014**

Header.jsx uses `hidden lg:flex` (line 106) and `lg:hidden` (line 198) — these are correct responsive breakpoints. The bug may only appear at the exact `lg` breakpoint (1024px) if both are momentarily visible. Test at 1024px viewport width.

If both are indeed visible at some width, the fix is ensuring the breakpoints use the exact same threshold. If NOT reproducible, note as "not reproducible" in commit.

**Step 2: Fix BUG-015 — Remove nested main from SearchResults**

`Layout.jsx:13` wraps all page content in `<main id="main-content">`. `SearchResults.jsx:216` has its own `<main>` tag — this creates invalid nested `<main>` elements.

Change line 216 of SearchResults.jsx from:
```jsx
<main className="px-4 pb-8 max-w-container mx-auto">
```
To:
```jsx
<div className="px-4 pb-8 max-w-container mx-auto">
```

And change the corresponding closing `</main>` tag to `</div>`.

Also check all other pages for `<main>` tags — they should NOT have their own `<main>` since Layout provides one. Search: `grep -r "<main" kalasetu-frontend/src/pages/`

**Step 3: Verify**

View page source — only one `<main>` element in DOM. Run aXe accessibility checker if available.

---

### Task 4.2 (Agent I): BUG-016 + BUG-017 + BUG-018 — Search grammar + price display

**Files:**
- Modify: `kalasetu-frontend/src/pages/SearchResults.jsx:203`
- Modify: `kalasetu-frontend/src/components/artisan/ServicesTab.jsx:118`
- Investigate: `kalasetu-frontend/src/components/profile/tabs/ServicesTab.jsx:278`

**Step 1: Fix "1 results" grammar (BUG-016)**

At SearchResults.jsx line 203, change:
```javascript
`${filteredArtisans.length + filteredServices.length} results`
```
To:
```javascript
`${count} result${count !== 1 ? 's' : ''}`
```
(Where `count = filteredArtisans.length + filteredServices.length`)

**Step 2: Fix currency display (BUG-017)**

At `kalasetu-frontend/src/components/artisan/ServicesTab.jsx:118`, the price shows `service.price.toLocaleString('en-IN')` without the rupee symbol. The `IndianRupee` icon is present as a Lucide component, but some users may not see it clearly.

This may actually be correctly styled with the icon. Verify visually. If the icon IS showing, this bug may be "as designed" — the icon serves as the currency symbol.

If the icon is missing or too small, add a text rupee symbol:
```jsx
{service.price > 0 ? `₹${service.price.toLocaleString('en-IN')}` : 'Contact for pricing'}
```

**Step 3: Fix "Contact" text (BUG-018)**

The "Contact" text shows when `service.price === 0`. This is correct for services that don't have a fixed price. But if the service HAS a price in the database and it's still showing "Contact", the issue is that `price` is undefined or null (which is falsy and matches `> 0` as false).

Fix by checking more explicitly:
```jsx
{service.price != null && service.price > 0
  ? `₹${service.price.toLocaleString('en-IN')}`
  : 'Contact for pricing'}
```

**Step 4: Verify**

Search for services → "1 result" (not "1 results"). Artisan profile → services show `₹500` format.

---

### Task 4.3 (Agent J): BUG-019 + BUG-022 — Admin artisan category + booking stats

**Files:**
- Modify: `kalasetu-frontend/src/pages/admin/AdminArtisans.jsx:277`
- Modify: `kalasetu-frontend/src/pages/admin/AdminBookings.jsx:245-270`
- Modify: `kalasetu-backend/controllers/adminDashboardController.js:601-626` (getBookingsStats)

**Step 1: Fix category display (BUG-019)**

At AdminArtisans.jsx line 277, `artisan.category` is used but the Artisan model has `craft` (not `category`). Change:
```jsx
{artisan.category || 'N/A'}
```
To:
```jsx
{artisan.craft || artisan.category || 'N/A'}
```

**Step 2: Add "rejected" to booking stats (BUG-022)**

In `adminDashboardController.js`, the `getBookingsStats` function (lines 601-626) counts `totalBookings`, `upcoming`, `completed`, `cancelled` but NOT `rejected`. The Booking model has `rejected` as a valid status.

Add rejected count to the Promise.all:
```javascript
    const [totalBookings, upcoming, completed, cancelled, rejected] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed', start: { $gte: new Date() } }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments({ status: 'rejected' })
    ]);
```

Add to response:
```javascript
    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        upcoming,
        completed,
        cancelled,
        rejected,
        cancellationRate
      }
    });
```

**Step 3: Add "Rejected" stat card to AdminBookings.jsx**

In the stat cards section (lines 245-270), add a "Rejected" card after "Cancelled":
```jsx
<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
  <div className="text-sm text-gray-600 truncate">Rejected</div>
  <div className="text-2xl font-bold text-red-600 mt-1">{stats?.rejected || 0}</div>
</div>
```

**Step 4: Verify**

Admin artisans page shows "Wellness & Beauty" (or actual craft) instead of "N/A". Admin bookings shows all 6 bookings accounted for in stat cards.

---

### Task 4.4 (Agent K): BUG-021 + BUG-023 — Refund stat cards + service modal warning

**Files:**
- Modify: `kalasetu-frontend/src/pages/admin/AdminRefunds.jsx:151-178`
- Modify: `kalasetu-frontend/src/components/profile/ServiceFormSheet.jsx`

**Step 1: Fix refund stat card layout consistency (BUG-021)**

In AdminRefunds.jsx, the "Processed" stat card shows both a count and a `₹` amount while others only show counts. For consistency, either:
- (A) Remove the ₹ amount from "Processed" card, OR
- (B) Add ₹ amounts to "Pending" and "Processing" cards too

Option (A) is simpler — remove the extra ₹ line from the "Processed" card. Find the "Processed" card in lines 151-178 and remove the secondary amount display line.

**Step 2: Add unsaved changes warning (BUG-023)**

In `ServiceFormSheet.jsx`, the BottomSheet's `onClose` handler fires immediately when clicking outside. Add a dirty-form check.

Add a `isDirty` state tracker at the top of the component:
```javascript
const [isDirty, setIsDirty] = useState(false);
```

On any form field change, set `setIsDirty(true)`.

Create a guarded close handler:
```javascript
const handleClose = () => {
  if (isDirty && !window.confirm('You have unsaved changes. Discard?')) {
    return;
  }
  onClose();
};
```

Pass `handleClose` instead of `onClose` to the BottomSheet and Cancel button.

Reset `isDirty` to `false` on successful save and when the sheet opens with new data.

**Step 3: Verify**

Admin refunds: all stat cards have consistent layout. Service modal: fill in form data, click outside → confirmation dialog appears.

---

### Task 4.5: Wave 4 verification gate

```bash
cd kalasetu-frontend && npm run build && npm run lint
```

Commit:
```bash
git add -A
git commit -m "fix: wave 4 — search grammar, pricing display, admin category/stats, service modal warning (BUG-014-023)"
```

---

## Wave 5: Low Severity + Polish (3 parallel agents — 5 bugs)

> Agents L, M, N run in parallel.

### Task 5.1 (Agent L): BUG-024 + BUG-027 — Footer auth links + description

**Files:**
- Modify: `kalasetu-frontend/src/components/Footer.jsx`

**Step 1: Conditional auth links (BUG-024)**

Import auth context:
```javascript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
```

Add inside the component:
```javascript
const { auth } = useContext(AuthContext);
const isLoggedIn = !!auth?.user;
```

Replace the "For Artisans" section (lines 27-31):
```jsx
<h3 className="text-sm font-semibold text-brand-200 tracking-wider uppercase">For Artisans</h3>
<ul className="mt-4 space-y-4">
  {isLoggedIn && auth.userType === 'artisan' ? (
    <li><Link to="/artisan/dashboard" className="text-base text-brand-200/60 hover:text-white transition-colors">Dashboard</Link></li>
  ) : !isLoggedIn ? (
    <>
      <li><Link to="/artisan/login" className="text-base text-brand-200/60 hover:text-white transition-colors">Artisan Login</Link></li>
      <li><Link to="/artisan/register" className="text-base text-brand-200/60 hover:text-white transition-colors">Join as Artisan</Link></li>
    </>
  ) : null}
</ul>
```

Apply similar logic to the "For Customers" section (lines 37-40).

**Step 2: Fix truncated description (BUG-027)**

The footer description at line 14 reads: "Connecting you with the heart of craftsmanship. Discover unique, handmade products from local artisans."

This may appear truncated at certain widths due to CSS. Check if the text is actually cut off or if it's a design choice. If the text is genuinely truncated (ends mid-sentence), complete it. If the current text is complete and just appears cut off visually, no fix needed.

**Step 3: Verify**

Login → footer shows "Dashboard" link instead of login/register links. Logged out → footer shows login/register links.

---

### Task 5.2 (Agent M): BUG-025 + BUG-028 — Privacy "USER" + experience label

**Files:**
- Modify: `kalasetu-frontend/src/pages/PrivacyPolicy.jsx:36-37`
- Modify: `kalasetu-frontend/src/components/artisan/AboutTab.jsx:57` or `ProfileHeader.jsx:68`

**Step 1: Fix "USER" casing (BUG-025)**

At PrivacyPolicy.jsx lines 36-37:
```jsx
<li>To register you as a new USER or artisan</li>
<li>To manage your account and provide USER support</li>
```
Change to:
```jsx
<li>To register you as a new user or artisan</li>
<li>To manage your account and provide user support</li>
```

**Step 2: Add label to experience value (BUG-028)**

At `AboutTab.jsx:57`, the InfoChip shows `artisan.yearsOfExperience` as raw value (e.g., "2-5"). The `label="Experience"` is already set, but the `value` needs a "years" suffix:

```jsx
<InfoChip icon={Briefcase} label="Experience" value={`${artisan.yearsOfExperience} years`} />
```

At `ProfileHeader.jsx:68`, it already shows " exp":
```jsx
<StatChip icon={Briefcase} value={`${artisan.yearsOfExperience} exp`} />
```
This is fine — "2-5 exp" is slightly ambiguous but readable. For clarity, change to "years":
```jsx
<StatChip icon={Briefcase} value={`${artisan.yearsOfExperience} yrs`} />
```

**Step 3: Verify**

Privacy Policy → lowercase "user" in both sentences. Artisan profile → "2-5 years" instead of "2-5".

---

### Task 5.3 (Agent N): BUG-026 + BUG-030 — Preferences + admin autofill

**Files:**
- Modify: `kalasetu-frontend/src/pages/dashboard/user/Preferences.jsx`
- Modify: `kalasetu-frontend/src/pages/admin/AdminLogin.jsx:46,53`

**Step 1: Improve Preferences page (BUG-026)**

The current Preferences page is a bare stub. Two options:
- (A) Build a real preferences UI — out of scope for bug fix sweep
- (B) Make the stub look intentional with proper styling

Go with (B) — style the "coming soon" message with the design system:

```jsx
import { Settings } from 'lucide-react';
import { EmptyState } from '../../../components/ui';

const Preferences = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
      <EmptyState
        icon={<Settings className="w-12 h-12" />}
        title="Preferences Coming Soon"
        description="Notification settings, language preferences, and more will be available in an upcoming update."
      />
    </div>
  );
};

export default Preferences;
```

**Step 2: Fix admin login autofill (BUG-030)**

At AdminLogin.jsx line 46, the email input has no `autocomplete` attribute. At line 53, the password input also lacks it. Add distinct name attributes and autocomplete to prevent browser from confusing admin login with user login:

Line 46 email input — add:
```jsx
name="admin-email"
autoComplete="username"
```

Line 53 password input — add:
```jsx
name="admin-password"
autoComplete="current-password"
```

Note: Using `autocomplete="off"` is widely ignored by browsers. Using `autocomplete="username"` with a distinct `name` attribute helps browsers create a separate autofill entry for admin login.

**Step 3: Verify**

Preferences page shows styled EmptyState. Admin login form no longer autofills with user credentials (may need to clear browser saved passwords to test).

---

### Task 5.4: Wave 5 verification gate

```bash
cd kalasetu-frontend && npm run build && npm run lint
```

Commit:
```bash
git add -A
git commit -m "fix: wave 5 — footer auth links, privacy text, preferences page, admin autofill, experience label (BUG-024-028,030)"
```

---

## Post-Sweep Gates

### Task 6.1: Full code review

Run `/review-code` on all modified files across all 5 waves.

### Task 6.2: Security review

Run `/review-security` on:
- `kalasetu-backend/middleware/authMiddleware.js` (BUG-003 — permission bypass)
- `kalasetu-frontend/src/pages/dashboard/user/UserPayments.jsx` (BUG-001 — payment data)
- `kalasetu-backend/controllers/adminDashboardController.js` (BUG-004 — admin data)

### Task 6.3: Final build verification

```bash
cd kalasetu-frontend && npm run build && npm run lint
```

### Task 6.4: Create PR

```bash
git push -u origin fix/full-audit-sweep
gh pr create --title "fix: full platform bug-fix sweep (29 bugs)" --body "## Summary
- 29 bugs fixed across 5 waves
- See docs/development/BUG_REPORT_FULL_AUDIT.md for original audit
- See docs/plans/2026-02-22-bug-fix-sweep-design.md for execution design

## Bugs Fixed
### Critical (5)
- BUG-001: Payments page crash
- BUG-002: 404 routing fix
- BUG-003: Admin checkPermission super_admin bypass
- BUG-004: Admin dashboard stats
- BUG-005: Artisan bookings

### High (7)
- BUG-006: Auth page redirects
- BUG-007: Nearby artisans fallback
- BUG-008: Forgot password link (verified working)
- BUG-009: Login page register link
- BUG-010: Rating sync across endpoints
- BUG-011+012: Artisan dashboard stats
- BUG-013: Admin 403 vs 401 handling

### Medium (9)
- BUG-014: Search form visibility
- BUG-015: Nested main elements
- BUG-016: Search grammar
- BUG-017+018: Price display
- BUG-019: Admin artisan category
- BUG-020: Admin artisan rating
- BUG-021: Refund stat cards
- BUG-022: Booking stats rejected
- BUG-023: Service modal warning

### Low (5)
- BUG-024+027: Footer links and description
- BUG-025: Privacy policy casing
- BUG-026: Preferences page
- BUG-028: Experience label
- BUG-030: Admin login autofill

## Test plan
- [ ] Admin: Login as super_admin, verify settings page accessible
- [ ] Admin: Dashboard loads without error
- [ ] Artisan: Login as Priya, verify bookings tab shows data
- [ ] Artisan: Dashboard stats show non-zero values
- [ ] Artisan: Rating consistent across dashboard, reviews, profile
- [ ] User: Navigate to /payments — no crash
- [ ] Auth: Login → navigate to /login → redirects to dashboard
- [ ] Public: Navigate to /nonexistent — shows 404 page
- [ ] Public: Homepage nearby artisans shows data
- [ ] Search: Single result shows '1 result' not '1 results'
- [ ] Frontend: npm run build passes with zero errors
- [ ] Frontend: npm run lint passes with zero warnings
"
```

### Task 6.5: Update HANDOVER.md

Update `docs/development/HANDOVER.md` with completed work, branch state, and any new gotchas discovered during the sweep.

---

## Summary

| Wave | Bugs | Agents | Strategy |
|------|------|--------|----------|
| 1 | BUG-002, 003, 013 | Sequential | Foundation infrastructure |
| 2 | BUG-004, 005, 010, 011, 012, 020 | 3 parallel | Backend API fixes |
| 3 | BUG-001, 006, 007, 008, 009 | 4 parallel | Frontend critical |
| 4 | BUG-014-023 | 4 parallel | Medium severity |
| 5 | BUG-024-028, 030 | 3 parallel | Low severity + polish |
| Post | — | Sequential | Review, security, PR |

**Total: 29 bugs, 5 waves, ~35 files, 5 commits + 1 PR**
