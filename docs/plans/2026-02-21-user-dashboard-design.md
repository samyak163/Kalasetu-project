# Phase 10: User Dashboard Rebuild — Design Document

> **Approved:** 2026-02-21
> **Branch:** `feat/ui-overhaul`
> **Approach:** A — Full Sweep (all 7 files)
> **Scope:** 2 container rebuilds + 5 tab rebuilds, no new shared components, no backend changes

---

## Context

Phases 1-9 established a full design system and rebuilt all public-facing pages plus the artisan dashboard. The user/customer dashboard (UserProfilePage, ProfileModal, and 5 tabs) still uses pre-design-system code — emoji icons, hardcoded `#A55233`, raw HTML inputs, and no URL hash navigation.

### Current State

**7 files in scope:**

| File | Lines | Design System Usage | Key Issues |
|------|-------|---------------------|------------|
| UserProfilePage.jsx | 79 | Lucide icons, `brand-500` tokens | No hash nav, raw tab buttons |
| ProfileModal.jsx | 157 | None | Emoji icons, hardcoded `#A55233`/`#F3E9E5`/`#2A1810` |
| ProfileTab.jsx | 479 | None | All hardcoded colors, raw inputs/buttons |
| RatingsTab.jsx | 159 | None | Text stars (★/☆), hardcoded colors |
| BookmarksTab.jsx | 183 | Partial (`brand-500`) | Raw inputs/selects, custom SVG icons |
| OrderHistoryTab.jsx | 443 | Partial (`brand-500`, Lucide `X`) | Raw modal for refunds, raw inputs |
| PreferencesTab.jsx | 250 | None | Hardcoded `#A55233`, raw checkboxes |

### Backend API Availability

All endpoints exist. No new endpoints needed:

| Endpoint | Used By | Status |
|----------|---------|--------|
| `GET /api/users/me` | ProfileTab | Exists |
| `PUT /api/users/profile` | ProfileTab, PreferencesTab | Exists |
| `POST /api/users/change-password` | ProfileTab | Exists |
| `GET /api/users/bookmarks` | BookmarksTab | Exists |
| `POST/DELETE /api/users/bookmarks/:artisanId` | BookmarksTab | Exists |
| `GET /api/users/ratings` | RatingsTab | Exists |
| `GET /api/bookings/me` | OrderHistoryTab | Exists |
| `GET /api/refunds` | OrderHistoryTab | Exists |
| `POST /api/refunds` | OrderHistoryTab | Exists |
| `GET /api/payments` | OrderHistoryTab | Exists |
| `POST /api/users/support/contact` | HelpSupportTab | Exists |
| `POST /api/users/support/report` | HelpSupportTab | Exists |

---

## Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Dual rendering | Keep both UserProfilePage and ProfileModal | Lowest risk, matches existing architecture, both import same tab components |
| Navigation | URL hash navigation on UserProfilePage | Consistent with artisan dashboard, enables deep-linking and back button |
| Refund modal | Migrate to BottomSheet | Consistent with Phase 9 PortfolioTab pattern, better mobile UX |
| Notification toggles | Styled checkboxes with existing components | No new Toggle component needed, follows YAGNI principle |
| Approach | Full sweep (all 7 files) | Consistent with Phase 9, complete coverage, scope is smaller than Phase 9 |

---

## Design

### 1. Container — UserProfilePage

**Mobile (< 768px):**
- Sticky horizontal icon tab bar (icons only, active label below selected)
- Same pattern as ArtisanAccountPage mobile tabs

**Desktop (>= 768px):**
- Sidebar layout with `rounded-card`, `shadow-card`, `bg-surface`
- Active tab: `bg-brand-50 text-brand-600` with left accent bar
- Sticky sidebar nav

**Header:**
- `Avatar` component + user name on left
- "View Bookings" shortcut on right (desktop only)

**Navigation:**
- URL hash support: `#profile`, `#ratings`, `#saved`, `#orders`, `#notifications`, `#appearance`, `#help`
- `getHashTab()` + `hashchange` listener + `navigateTab()` callback
- Default tab: `profile`

---

### 2. Container — ProfileModal

- Swap emoji icons (👤, ⭐, etc.) → Lucide icons (matching UserProfilePage tab definitions)
- Swap hardcoded colors → design tokens (`brand-50`, `brand-500`, `brand-600`)
- Keep custom event system (`open-profile`) — works, other components dispatch it
- Keep body scroll lock behavior
- Desktop sidebar + mobile horizontal tabs match UserProfilePage pattern

---

### 3. ProfileTab (Profile Editing)

**Avatar section:**
- `Avatar size="xl"` for display + `Button variant="secondary"` for upload trigger
- `Spinner` overlay during upload

**Form fields:**
- All use `Input` component
- Grid: 2-col desktop, 1-col mobile
- Email, phone, account date remain disabled (read-only)

**Password section:**
- `Input type="password"` for all 3 fields
- Strength bar using design tokens (red/yellow/green semantic colors)
- Requirement checklist stays

**Actions:**
- `Button variant="primary"` for Save Changes
- `Button variant="primary"` for Update Password

**No logic changes.** All handlers, validation, Cloudinary upload stay identical.

---

### 4. RatingsTab

**Overall rating card:**
- `Card` with gradient background (design tokens)
- Large rating number + `StarRating` component (replaces text stars ★/☆)
- Review count text

**Rating breakdown:**
- `Card` for each category row
- `Badge` for rating values
- Progress bars using `bg-brand-500` tokens

**Recent reviews:**
- `Card` for each review
- `StarRating` inline
- Design tokens for all text/background colors

**Empty state:**
- `EmptyState` component with encouragement message

**Info section:**
- `Alert` component for "Understanding Your Rating"

---

### 5. BookmarksTab (Saved Artisans)

**Search/filter:**
- `Input` for search field
- Styled selects for sort and filter

**Artisan cards:**
- `Card` component for each bookmarked artisan
- `Avatar` for artisan photo
- `Badge` for rating display
- `Button variant="primary"` for View Profile
- `Button variant="secondary"` for Contact
- Lucide `Heart` icon for remove bookmark (replaces raw SVG)

**Empty state:**
- `EmptyState` with CTA `Button` to `/search`

**Loading:**
- `Skeleton` card grid

---

### 6. OrderHistoryTab

**Stats row:**
- 3 `Card` components with Lucide icons (ShoppingBag, IndianRupee, Calculator)

**Filters:**
- `Input` for search
- Styled select for status filter

**Order cards:**
- `Card` for each order
- `Avatar` for artisan photo
- `StatusBadge` for order status
- `Badge` for refund status
- Expandable details section (inline, design tokens)

**Action buttons:**
- `Button variant="primary"` for Rate & Review
- `Button variant="secondary"` for Request Refund
- `Button variant="ghost"` for View Details, Rebook

**Refund request:**
- `BottomSheet` replaces fixed modal
- `Input` for notes textarea
- Styled select for reason dropdown
- `Button` for cancel/submit
- Order summary card inside sheet

---

### 7. PreferencesTab

**Notification sections:**
- `Card` for each category (Email, SMS, Push)
- Styled checkboxes with `accent-brand-500`
- Capitalize labels from camelCase keys

**Language/Currency:**
- Styled selects within grid layout

**Privacy:**
- `Card` for privacy section
- Styled select for visibility
- Styled checkbox for phone number toggle

**Save:**
- `Button variant="primary"`

---

## Design System Components Used

From `components/ui/index.js`:
- **Heavy:** Button, Card, Input, Avatar, Badge, EmptyState, Skeleton
- **Moderate:** StarRating, StatusBadge, Alert, BottomSheet, LoadingState
- **Light:** FilterChips, Spinner

**No new shared components needed.** All primitives exist from Phases 1-9.

---

## Backend Changes

**None.** All endpoints exist and return the correct data.

---

## Out of Scope

- New analytics/stats endpoints for user dashboard
- User-side dashboard overview tab (artisan has one, user does not need one)
- Dark mode additions (follow existing `dark:` class pattern)
- New shared components

---

## Success Criteria

1. All 7 files use design system components — zero raw HTML inputs/buttons
2. No hardcoded `#A55233` anywhere in user dashboard files
3. No emoji icons in ProfileModal (replaced with Lucide)
4. URL hash navigation on UserProfilePage (`#profile`, `#ratings`, etc.)
5. Refund modal migrated to BottomSheet
6. `StarRating` component used in RatingsTab (no text stars)
7. Mobile tab navigation matches artisan dashboard pattern
8. ProfileModal uses design tokens throughout
9. All existing functionality preserved (no logic changes)
