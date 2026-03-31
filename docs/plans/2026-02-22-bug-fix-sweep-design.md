# Full Platform Bug-Fix Sweep — Design

> **Date:** 2026-02-22
> **Scope:** 29 bugs from BUG_REPORT_FULL_AUDIT.md (BUG-029 excluded — expected dev behavior)
> **Approach:** Wave-based execution with parallel agents per wave
> **Branch:** `fix/full-audit-sweep` → squash-merge PR to `main`

---

## Bug Inventory (29 bugs)

| ID | Severity | Area | Summary |
|----|----------|------|---------|
| BUG-001 | CRITICAL | User | Payments page crash (`payments.map is not a function`) |
| BUG-002 | CRITICAL | Public | No 404 page — `/:publicId` route swallows invalid URLs |
| BUG-003 | CRITICAL | Admin | `checkPermission` has no `super_admin` bypass |
| BUG-004 | CRITICAL | Admin | Admin dashboard stats endpoint error |
| BUG-005 | CRITICAL | Artisan | Artisan bookings tab "Failed to load bookings" |
| BUG-006 | HIGH | Auth | Auth pages accessible while logged in |
| BUG-007 | HIGH | Public | "Top Artisans Near You" always empty |
| BUG-008 | HIGH | Auth | Forgot Password "Back to Login" links to wrong page |
| BUG-009 | HIGH | Auth | Artisan Login "Create account" links to wrong route |
| BUG-010 | HIGH | Artisan | Rating mismatch across 3 different values |
| BUG-011 | HIGH | Artisan | Dashboard empty stat cards (active bookings, completed, earned) |
| BUG-012 | HIGH | Artisan | Dashboard shows "No bookings yet" despite 6 existing |
| BUG-013 | HIGH | Admin | Admin session expires on Settings navigation (403 vs 401) |
| BUG-014 | MEDIUM | Public | Duplicate search forms in navbar at certain widths |
| BUG-015 | MEDIUM | Public | Nested `<main>` elements (accessibility violation) |
| BUG-016 | MEDIUM | Public | "1 results" grammar bug |
| BUG-017 | MEDIUM | Public | Currency symbol missing from artisan profile services |
| BUG-018 | MEDIUM | Public | "Contact" instead of price on some service cards |
| BUG-019 | MEDIUM | Admin | Admin artisans category shows "N/A" |
| BUG-020 | MEDIUM | Admin | Admin artisans star rating shows 0 |
| BUG-021 | MEDIUM | Admin | Refunds stat card layout inconsistency |
| BUG-022 | MEDIUM | Admin | Bookings stats missing "rejected" status |
| BUG-023 | MEDIUM | Artisan | Service modal no unsaved changes warning |
| BUG-024 | LOW | Public | Footer shows auth links when logged in |
| BUG-025 | LOW | Legal | Privacy Policy "USER" in all caps |
| BUG-026 | LOW | User | Preferences page is a placeholder |
| BUG-027 | LOW | Public | Footer description truncated |
| BUG-028 | LOW | Public | "2-5" without context on artisan profile |
| BUG-030 | LOW | Admin | Admin login autofills wrong credentials |

---

## Dependency Map

```
BUG-003 ──blocks──> BUG-013 (checkPermission must have super_admin bypass before 403 vs 401 fix matters)
BUG-005 ──same-root──> BUG-011, BUG-012 (artisan bookings/stats API — single fix)
BUG-010 ──same-root──> BUG-020 (rating sync — single fix)
```

All other bugs are independent and can be parallelized freely.

---

## Wave Architecture

### Wave 1: Foundation (Sequential — 3 bugs)

Fixes shared infrastructure that downstream bugs depend on.

| Bug | Fix Summary | Files |
|-----|-------------|-------|
| BUG-003 | Add `if (req?.user?.role === 'super_admin') return next();` at top of `checkPermission` | `kalasetu-backend/middleware/authMiddleware.js:138-146` |
| BUG-013 | Only redirect to `/admin/login` on 401, show permission denied message on 403 | `kalasetu-frontend/src/context/AdminAuthContext.jsx`, `kalasetu-frontend/src/components/admin/AdminLayout.jsx` |
| BUG-002 | In `ArtisanProfilePage`, when artisan fetch returns 404, render `<NotFoundPage />` instead of "Artisan not found" | `kalasetu-frontend/src/pages/ArtisanProfilePage.jsx:~200` |

**Verification:** Admin settings accessible. Invalid URLs show 404 page.

---

### Wave 2: Backend API Fixes (3 parallel agents — 5 bugs)

| Agent | Bugs | Fix Summary | Files |
|-------|------|-------------|-------|
| A | BUG-004 | Debug admin dashboard — likely `Payment.aggregate` matching `status: 'completed'` but actual status is `captured`. Fix status filter. | `kalasetu-backend/controllers/adminDashboardController.js:62-163` |
| B | BUG-005, BUG-011, BUG-012 | Artisan bookings + stats — investigate why `/api/bookings/artisan` and `/api/artisan/dashboard/stats` return empty. Likely query filter mismatch on artisan ID. | `kalasetu-backend/controllers/bookingController.js`, `kalasetu-backend/controllers/artisanDashboardController.js` |
| C | BUG-010, BUG-020 | Rating sync — add post-save hook on Review model to recalculate Artisan `averageRating`/`totalReviews`. Fix seed data. | `kalasetu-backend/models/reviewModel.js`, `kalasetu-backend/models/artisanModel.js`, seed script |

**Verification:** Artisan dashboard shows correct booking counts, earnings, and rating. Admin dashboard loads without error.

---

### Wave 3: Frontend Critical (4 parallel agents — 7 bugs)

| Agent | Bugs | Fix Summary | Files |
|-------|------|-------------|-------|
| D | BUG-001 | Validate payments API response is array before `.map()`. Ensure `payments` state always `[]`. | `kalasetu-frontend/src/pages/dashboard/user/UserPayments.jsx` |
| E | BUG-006 | Create `RedirectIfAuthenticated` component. Wrap all auth routes in `App.jsx`. | `kalasetu-frontend/src/components/RedirectIfAuth.jsx` (new), `kalasetu-frontend/src/App.jsx:82-96` |
| F | BUG-007 | NearbyArtisans fallback — ensure `/api/artisans` returns artisans without location params. Debug the fallback chain. | `kalasetu-frontend/src/components/Maps/NearbyArtisans.jsx` |
| G | BUG-008, BUG-009 | Fix LoginPage register link to `/artisan/register`. Fix ForgotPassword back-to-login context detection. | `kalasetu-frontend/src/pages/LoginPage.jsx:110`, `kalasetu-frontend/src/pages/ForgotPassword.jsx` |

**Verification:** No crash on `/payments`. Auth pages redirect to dashboard when logged in. Homepage shows nearby artisans.

---

### Wave 4: Medium Severity (4 parallel agents — 9 bugs)

| Agent | Bugs | Fix Summary | Files |
|-------|------|-------------|-------|
| H | BUG-014, BUG-015 | Fix responsive breakpoint classes for search forms. Remove nested `<main>` tag. | `kalasetu-frontend/src/components/Header.jsx`, layout components |
| I | BUG-016, BUG-017, BUG-018 | Pluralization fix ("1 result"), add currency symbol, fix "Contact" vs price conditional. | Search results component, artisan profile services section |
| J | BUG-019, BUG-022 | Fix admin artisan category display (populate or field mapping). Add "rejected" to booking stats. | `kalasetu-frontend/src/pages/admin/AdminArtisans.jsx`, `kalasetu-frontend/src/pages/admin/AdminBookings.jsx`, backend stats |
| K | BUG-021, BUG-023 | Refund stat card consistency. Add beforeClose unsaved-changes check to service form. | `kalasetu-frontend/src/pages/admin/AdminRefunds.jsx`, `kalasetu-frontend/src/components/profile/ServiceFormSheet.jsx` |

**Verification:** Admin pages data correct. Search grammar fixed. No duplicate UI. Service modal warns on close.

---

### Wave 5: Low Severity + Polish (3 parallel agents — 5 bugs)

| Agent | Bugs | Fix Summary | Files |
|-------|------|-------------|-------|
| L | BUG-024, BUG-027 | Footer: conditional auth links via `useAuth()`. Fix truncated description. | `kalasetu-frontend/src/components/Footer.jsx` |
| M | BUG-025, BUG-028 | Privacy policy "USER" → "User". Add label to "2-5" on artisan profile. | `kalasetu-frontend/src/pages/PrivacyPolicy.jsx`, artisan profile component |
| N | BUG-026, BUG-030 | Preferences: show "coming soon" or hide nav link. Admin login: `autocomplete="off"`. | `kalasetu-frontend/src/pages/dashboard/user/Preferences.jsx`, `kalasetu-frontend/src/pages/admin/AdminLogin.jsx` |

**Verification:** Footer updates based on auth. All text labeled. Final build clean.

---

## Verification Protocol

### Per-Wave Gates

1. `npm run build` — zero errors
2. `npm run lint` — zero new warnings
3. `/review-code` on all modified files
4. Git commit with wave description

### Post-Sweep Gates

1. Full `/review-code` across all changed files
2. `/review-security` on auth middleware + payment changes (BUG-003, BUG-001, BUG-004)
3. `npm run build` — final clean build
4. Create squash-merge PR to `main`
5. Update `HANDOVER.md` with completed work

---

## Execution Parameters

| Parameter | Value |
|-----------|-------|
| Total agents (max concurrent) | 4 |
| Total waves | 5 |
| Total bugs | 29 |
| Branch | `fix/full-audit-sweep` |
| Merge strategy | Squash PR to `main` |
| Commit strategy | 1 commit per wave |
| Estimated file changes | ~35 files |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Wave 2 agents touching same model files | Agent C (reviews) touches `reviewModel.js`; Agent B (bookings) touches `bookingController.js` — no overlap |
| Auth route changes in Wave 3 breaking existing flows | `RedirectIfAuthenticated` is additive (wraps existing routes), doesn't modify them |
| Rating sync hook (Wave 2) affecting seed data | Hook only fires on Review save — seed creates artisans before reviews, so seed order is safe |
| Build failures between waves | Each wave commits only after build passes — rollback is one `git reset` |

---

*Designed: 2026-02-22*
*Approved by: User*
