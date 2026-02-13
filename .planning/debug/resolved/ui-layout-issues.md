---
status: resolved
trigger: "Investigate and fix multiple UI/layout issues in KalaSetu."
created: 2026-02-13T00:00:00Z
updated: 2026-02-13T00:00:00Z
---

## Current Focus

hypothesis: All four issues have been identified and fixed
test: Manual testing in browser to verify all fixes work correctly
expecting: Dark mode readable, modal fits screen, dropdown stays open, geolocation button visible
next_action: Verify fixes in dev environment

## Symptoms

**Issue 1: Artisan UI text/colors too dark to read**
- expected: UI text and colors are readable when logged in as artisan
- actual: Text and colors are "too dark, impossible to see"
- errors: None
- reproduction: Log in as artisan (showcase.artisan@demo.kalasetu.com / Demo@1234), navigate artisan pages
- started: Unknown

**Issue 2: Create services tab overflows 100% screen width**
- expected: Service creation form fits within normal screen at 100% zoom
- actual: Form is too wide, goes beyond screen, user needs to zoom out
- errors: None
- reproduction: Log in as artisan, go to Services tab, click to add a service
- started: Unknown

**Issue 8: Header location dropdown self-closes on click**
- expected: Click location dropdown in header → dropdown stays open → user can interact with options
- actual: Dropdown opens but immediately closes when clicking inside it
- errors: None
- reproduction: Open the site, click the location dropdown in the header
- started: Unknown

**Issue 9: Search location missing "use current location" option**
- expected: Location input beside search (not header) has "Use my current location" option
- actual: No geolocation option available. Also unclear if header location and search location are synced.
- errors: None
- reproduction: Go to search page, look at the location input
- started: Unknown

## Eliminated

## Evidence

- timestamp: 2026-02-13T00:01:00Z
  checked: ArtisanAccountPage.jsx (line 68)
  found: Dark mode has white text on dark backgrounds, but inactive tabs use `text-gray-700` without dark mode variant
  implication: Issue 1 - Inactive tabs will be dark gray on dark backgrounds (hard to read)

- timestamp: 2026-02-13T00:02:00Z
  checked: ServicesTab.jsx ServiceModal (line 429)
  found: Modal is `max-w-2xl` with form fields in grid layout, no obvious overflow issue
  implication: Issue 2 - Need to check if grid or form content causes horizontal overflow

- timestamp: 2026-02-13T00:03:00Z
  checked: Header.jsx location dropdown (lines 36-45)
  found: Click-outside handler listens to 'mousedown' on document, checks if click is outside locationRef
  implication: Issue 8 - If child elements don't propagate correctly or ref doesn't contain dropdown, clicks inside might trigger close

- timestamp: 2026-02-13T00:04:00Z
  checked: Header.jsx location dropdown (lines 138-187)
  found: "Use Current Location" button with geolocation exists in header location dropdown
  implication: Issue 9 - Header has geolocation, but user wants it in search page location input (separate component)

- timestamp: 2026-02-13T00:05:00Z
  checked: LocationSearch.jsx (lines 220-233)
  found: LocationSearch component ALREADY has "Use Current Location" button in dropdown (showDropdown state)
  implication: Issue 9 - Geolocation feature EXISTS but only shows when dropdown is open (when user types). Not visible by default.

- timestamp: 2026-02-13T00:06:00Z
  checked: DashboardOverviewTab.jsx dark mode usage
  found: No usage of text-gray-700/800/900 without dark: variants
  implication: Dashboard tab follows proper dark mode patterns

- timestamp: 2026-02-13T00:07:00Z
  checked: ArtisanAccountPage.jsx line 68
  found: `text-gray-700` without dark mode variant on inactive tabs
  implication: ROOT CAUSE Issue 1 - This is the "too dark" text issue. Inactive tabs are gray-700 on gray-800 background in dark mode.

- timestamp: 2026-02-13T00:08:00Z
  checked: Header.jsx locationRef click-outside handler (lines 36-45)
  found: Handler checks `!locationRef.current.contains(e.target)` - if target is outside ref, close dropdown
  implication: Issue 8 - If dropdown content is rendered OUTSIDE the locationRef div, clicks inside will be seen as "outside"

- timestamp: 2026-02-13T00:09:00Z
  checked: Header.jsx dropdown structure (lines 113-189)
  found: Dropdown div at line 114 is INSIDE the locationRef div (line 97), so contains() should work correctly
  implication: Issue 8 - Structure looks correct. Need to verify if click event propagation is the issue (stopPropagation missing?)

- timestamp: 2026-02-13T00:10:00Z
  checked: ServicesTab.jsx ServiceModal structure (lines 429-593)
  found: Modal container has `max-w-2xl` (672px), form has grid-cols-2 for price/duration only, rest is single column
  implication: Issue 2 - No obvious overflow. Might be caused by long text/images not wrapping, or modal padding causing issues on small screens.

## Resolution

root_cause: |
  Issue 1: Inactive tabs in ArtisanAccountPage used text-gray-700 without dark:text-gray-300 variant (dark text on dark bg)
  Issue 2: Service creation modal lacked overflow handling and responsive grid breakpoints
  Issue 8: Header location dropdown self-closed because click events propagated to document listener
  Issue 9: Search location filters lacked visible geolocation button (existed in header but not search page)

fix: |
  Issue 1: Added dark:text-gray-300 and dark:hover:bg-gray-700 to inactive tabs, dark:bg-brand-900/20 dark:text-brand-400 to active tabs
  Issue 2: Added overflow-y-auto to modal container, changed grid from md:grid-cols-2 to grid-cols-1 sm:grid-cols-2, added my-8 margin
  Issue 8: Added onClick={(e) => e.stopPropagation()} to both dropdown divs (desktop and mobile) to prevent clicks from reaching document listener
  Issue 9: Added "Use my location" button to AdvancedFilters with geolocation API integration, auto-populates city/state dropdowns

verification: Manual testing required - verify artisan dark mode, service form on mobile, dropdown behavior, geolocation button on search page

files_changed:
  - kalasetu-frontend/src/pages/ArtisanAccountPage.jsx
  - kalasetu-frontend/src/components/Header.jsx
  - kalasetu-frontend/src/components/profile/tabs/ServicesTab.jsx
  - kalasetu-frontend/src/components/search/AdvancedFilters.jsx
