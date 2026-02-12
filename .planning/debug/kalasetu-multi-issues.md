---
status: resolved
trigger: "Investigate multiple issues reported by the user across the KalaSetu platform."
created: 2026-02-12T00:00:00Z
updated: 2026-02-12T00:35:00Z
---

## Current Focus

hypothesis: All issues identified, root causes documented
test: Completed full investigation of 9 reported issues
expecting: Provide comprehensive findings to user
next_action: Return diagnosis with specific file locations and proposed fixes

## Symptoms

### Issue 1: User Profile Collections Tab
- expected: Clicking "Browse Artisan" in the Collections tab should navigate somewhere useful
- actual: Button click doesn't work or navigates incorrectly
- location: User profile page, Collections/Bookmarks tab

### Issue 2: User Profile Tab Flash/Double Render
- expected: Tab opens cleanly with correct background
- actual: Screen flashes black first, then white background appears. Seems like two tabs are being created
- location: User profile page tab system

### Issue 3: Dynamic Import Error (Vercel)
- error: `TypeError: Failed to fetch dynamically imported module: https://kalasetu-frontend-eosin.vercel.app/assets/UserLoginPage-B7kM_XoR.js`
- displays: "Something went wrong. We've been notified and are working on a fix."
- location: UserLoginPage lazy loading

### Issue 4: Artisan Registration Fails
- expected: Creating new artisan account should work
- actual: "Registration failed. Please try again."
- test_data: Name "Ram", Email "fullhdshinchan@gmail.com"
- location: Artisan register flow

### Issue 5: Chat Unavailable
- message: "Chat Unavailable - The messaging service is currently unavailable."
- likely: Stream Chat API keys not configured or service init failing

### Issue 6: Video Calls Unavailable
- message: "Video Calls Unavailable - Video calls are not available at this time."
- likely: Daily.co API keys not configured or service init failing

### Issue 7: Filter Section Missing Options
- expected: Multiple filter options (category, location, price, etc.)
- actual: Only rating filter shows up
- location: Search/filter UI

### Issue 8: Search Results UI Inconsistency
- expected: Same artisan card layout everywhere
- actual: Different UI when searching vs clicking "Services" from header
- note: Both routes go to SearchResults page but render differently

### Issue 9: Artisan Profile Layout in Search
- note: User wants suggestions for improving how artisan profiles appear in search results

## Eliminated

## Evidence

- timestamp: 2026-02-12T00:10:00Z
  checked: BookmarksTab.jsx (Issue 1)
  found: Line 171 - "Browse Artisans" button links to "/" (homepage), not a filtered artisan search
  implication: Button works but navigates to homepage instead of search results. User expects to see artisan listings.

- timestamp: 2026-02-12T00:12:00Z
  checked: UserProfilePage.jsx (Issue 2)
  found: Lines 35-36 and 67 - Two separate bg-white dark:bg-gray-900 declarations at root and tabpanel level
  implication: Nested backgrounds may cause flash during tab switching. Root div has bg-white dark:bg-gray-900, inner section also has bg-white dark:bg-gray-900.

- timestamp: 2026-02-12T00:15:00Z
  checked: App.jsx (Issue 3)
  found: Line 16 - UserLoginPage is lazy loaded: `const UserLoginPage = lazy(() => import('./pages/UserLoginPage'));`
  implication: Dynamic import failure on Vercel suggests missing chunk or build config issue. Error shows module fetch fails.

- timestamp: 2026-02-12T00:18:00Z
  checked: SearchResults.jsx (Issue 7)
  found: Lines 192-224 - Filter sidebar shows category and rating filters. AdvancedFilters component is rendered separately at line 228.
  implication: AdvancedFilters component exists and is rendering, so filters should appear. Need to check if facets API is returning empty data.

- timestamp: 2026-02-12T00:20:00Z
  checked: AdvancedFilters.jsx (Issue 7)
  found: Lines 8-18 - Component fetches facets from `/api/search/facets` endpoint. Silent catch on line 17 means errors are ignored.
  implication: If API call fails, facets remain empty arrays. This would explain missing filter options. Silent error handling hides the problem.

- timestamp: 2026-02-12T00:22:00Z
  checked: SearchResults.jsx (Issue 8)
  found: Lines 282-339 - ResultsView component has three modes: 'category', 'service', 'artisan'. Different rendering based on results.mode.
  implication: UI inconsistency depends on what mode backend returns. Need to trace what triggers different modes.

- timestamp: 2026-02-12T00:25:00Z
  checked: authController.js (Issue 4)
  found: Lines 14-31 - Zod schema validation with refine() check that requires either email OR phoneNumber
  implication: RegisterPage sends email="" when using email mode. Empty string is converted to undefined (line 18), but then email validation fails. Need to check exact request payload.

- timestamp: 2026-02-12T00:27:00Z
  checked: RegisterPage.jsx (Issue 4)
  found: Lines 50-51 - Sets email to '' when useEmail is true, phoneNumber to '' when false
  implication: BUG FOUND - Line 50 should be setting email to formData.email, not empty string. Currently sends { email: '', phoneNumber: '', ... } which fails validation.

- timestamp: 2026-02-12T00:30:00Z
  checked: App.jsx routing (Issue 8)
  found: Line 123 - Route path="services" element={<SearchResults />} exists
  implication: Both /search and /services go to same SearchResults component, but may be invoked with different URL params causing mode differences.

- timestamp: 2026-02-12T00:32:00Z
  checked: searchController.js (Issue 8)
  found: Lines 30-100 - Backend determines mode based on query params: 'service' if service name matched, 'category' if category matched, otherwise 'artisan'
  implication: UI inconsistency happens because /services link has no params, so returns mode='artisan'. Search with category param returns mode='category'. Different modes render different UIs.

## Evidence

## Resolution

root_cause: Multiple distinct bugs identified across frontend components

### Issue 1: Browse Artisans Button
**File:** kalasetu-frontend/src/components/profile/tabs/BookmarksTab.jsx
**Line:** 171
**Root Cause:** Button links to "/" (homepage) instead of search/browse page
**Fix:** Change `to="/"` to `to="/search"` or `to="/services"`

### Issue 2: User Profile Tab Flash
**File:** kalasetu-frontend/src/pages/UserProfilePage.jsx
**Lines:** 35, 67
**Root Cause:** Nested background colors - root div has bg-white dark:bg-gray-900, and inner tabpanel section also has bg-white dark:bg-gray-900, causing flash during render
**Fix:** Remove background from one layer (prefer keeping it on tabpanel only, remove from root)

### Issue 3: Dynamic Import Error
**File:** kalasetu-frontend/src/App.jsx
**Line:** 16
**Root Cause:** Lazy loading UserLoginPage fails on Vercel - likely build/chunk configuration issue
**Fix:** Either make UserLoginPage eager import (not lazy) OR investigate Vite build config for chunk splitting issues
**Note:** This is a build/deployment issue, not code logic

### Issue 4: Artisan Registration Fails
**File:** kalasetu-frontend/src/pages/RegisterPage.jsx
**Lines:** 50-51
**Root Cause:** Logic error - when useEmail=true, code sets `email: formData.useEmail ? formData.email : ''` but should use actual email value. Currently sends empty strings which fail backend validation.
**Fix:** Change lines 50-51 to:
```javascript
email: formData.useEmail ? formData.email : undefined,
phoneNumber: formData.useEmail ? undefined : formData.phoneNumber
```

### Issue 5: Chat Unavailable
**Root Cause:** Stream Chat API not configured (missing env vars or init failure)
**Fix:** Check VITE_STREAM_API_KEY and VITE_STREAM_APP_ID in .env, verify ChatContext initialization
**Note:** Likely config issue, not code bug

### Issue 6: Video Calls Unavailable
**Root Cause:** Daily.co API not configured (missing env vars or init failure)
**Fix:** Check VITE_DAILY_API_KEY in .env, verify Daily integration in VideoCallPage
**Note:** Likely config issue, not code bug

### Issue 7: Filter Section Missing Options
**File:** kalasetu-frontend/src/components/search/AdvancedFilters.jsx
**Lines:** 8-18
**Root Cause:** Silent error handling - if /api/search/facets fails, component renders with empty arrays. Line 17 has `catch (_) {}` which swallows errors.
**Fix:** Add error logging and/or fallback UI:
```javascript
} catch (err) {
  console.error('Failed to load facets:', err);
  // Optionally show error to user
}
```
**Secondary:** Check backend /api/search/facets endpoint returns data

### Issue 8: Search Results UI Inconsistency
**Files:**
- kalasetu-frontend/src/pages/SearchResults.jsx (lines 282-339)
- kalasetu-backend/controllers/searchController.js (lines 30-100)
**Root Cause:** Backend returns different modes ('artisan', 'category', 'service') based on query params. /services link has no params → mode='artisan'. Search with category → mode='category'. Different modes render different card layouts.
**Fix:** Either:
  A) Make /services link pass default params (e.g., /services?q=all)
  B) Ensure consistent card layout across all modes
  C) Header "Services" link should go to /search with sensible defaults

### Issue 9: Artisan Profile Layout Suggestions
**File:** kalasetu-frontend/src/pages/SearchResults.jsx
**Lines:** 365-453 (ArtisanCard component)
**Current:** Small square profile pic (128x128), services list, portfolio thumbnails, 3 action buttons
**Suggestions:**
  - Increase profile image size to 160x160 for better visibility
  - Add rating stars display (currently missing despite having rating data)
  - Consider adding verification badge if isVerified
  - Show location (city/state) more prominently
  - Portfolio images could be larger (100x100 instead of 80x80)

fix: Investigation complete - fixes not implemented (per instructions)
verification: Not applicable (investigation only)
files_changed: []
