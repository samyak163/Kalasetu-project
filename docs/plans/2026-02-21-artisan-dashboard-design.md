# Phase 9: Artisan Dashboard Rebuild — Design Document

> **Approved:** 2026-02-21
> **Branch:** `feat/ui-overhaul`
> **Approach:** B — Frontend rebuild + targeted backend enhancements
> **Scope:** Full sweep — 6 tab rebuilds, 3 tab polish, container rebuild, 2 shared components, 1 backend enhancement, dead code cleanup

---

## Context

Phases 1-8 established a design system (Button, Card, Input, Badge, BottomSheet, FilterChips, StarRating, ReviewCard, etc.) and rebuilt all public-facing pages. The artisan dashboard (ArtisanAccountPage) still uses pre-design-system code — raw HTML, emoji icons, hardcoded `#A55233`, and no shared components.

### Current State

**11 active tabs** in ArtisanAccountPage:

| Tab | Status | Design System Usage |
|-----|--------|---------------------|
| DashboardOverviewTab | Needs full rebuild | Only LoadingState |
| EarningsTab | Needs full rebuild | Only LoadingState |
| ReviewsTab | Needs full rebuild | Only LoadingState |
| ArtisanProfileTab | Needs full rebuild | None |
| PortfolioTab | Needs full rebuild | None |
| AvailabilityTab | Needs full rebuild | Only LoadingState |
| BookingsTab | Already rebuilt | Full design system |
| ServicesTab | Already rebuilt | Full design system |
| MyClientsTab | Needs polish | Avatar, EmptyState, design tokens |
| AppearanceTab | Needs polish | Hardcoded #A55233 |
| HelpSupportTab | Needs polish | Some design tokens |

**6 orphaned tab files** (never imported): RatingsTab, PreferencesTab, USERsTab, ProfileTab, BookmarksTab, OrderHistoryTab — to be deleted.

### Backend API Availability

All tabs already have backend endpoints. No major new endpoints needed:

| Endpoint | Used By | Status |
|----------|---------|--------|
| `GET /api/artisan/dashboard/stats` | DashboardOverviewTab | Exists, returns stats + recent bookings |
| `GET /api/artisan/dashboard/income-report?period=monthly` | DashboardOverviewTab, EarningsTab | Exists, returns monthly/weekly breakdown |
| `GET /api/artisan/dashboard/verification-status` | DashboardOverviewTab | Exists, returns profile completion checklist |
| `GET /api/payments/artisan/earnings` | EarningsTab | Exists, returns summary + transactions |
| `GET /api/reviews/artisan/:id` | ReviewsTab | Exists, needs tag aggregation enhancement |
| `GET /api/artisan/customers` | MyClientsTab | Exists, returns customer list with spend |
| `GET /api/artisan/availability` | AvailabilityTab | Exists, returns schedule + settings |
| `GET /api/artisan/portfolio/projects` | PortfolioTab | Exists, full CRUD |
| `GET /api/artisan/profile` | ArtisanProfileTab | Exists, returns profile data |

---

## Design

### 1. Container — ArtisanAccountPage

**Mobile (< 768px):**
- Horizontal scrolling tab bar at the top using `TabBar` component
- Icon-only on mobile with active label appearing below selected icon
- Sticky below the header

**Desktop (>= 768px):**
- Sidebar layout (current structure, upgraded styling)
- Design tokens: `rounded-card`, `shadow-card`, `bg-surface`, `text-primary`/`text-secondary`
- Active tab: `bg-brand-50 text-brand-600` with left accent bar
- Artisan avatar + name in sidebar header

**Header:**
- Artisan name + avatar on left, "View my public profile" link on right
- Remove redundant "Account Settings" title

**Navigation:**
- URL hash support: `#dashboard`, `#earnings`, `#reviews`, etc.
- Back button navigates between tabs
- Deep-linking to specific tabs via URL

---

### 2. DashboardOverviewTab — Smart Dashboard

**Layout (top to bottom):**

1. **Welcome Banner** — "Welcome back, Priya!" with time-based greeting. Subtitle shows pending action count from stats API. If no actions: "All caught up!"

2. **Profile Completion Card** (conditional) — Only shown when `isFullyVerified === false`. Horizontal progress bar, next incomplete step as CTA. Dismissible via localStorage. Uses existing `verification-status` endpoint.

3. **Stats Cards Row** — 4 cards using `Card` component:
   - Active Bookings (CalendarDays icon, brand color)
   - Completed (CheckCircle icon, success color)
   - Total Earned (IndianRupee icon, green text)
   - Rating (Star icon + `StarRating` component, not emoji)
   - Weekly growth trend indicator where available

4. **Income Overview** — `IncomeChart` component (shared, new). Last 6 months as CSS bar chart. Monthly/Weekly toggle.

5. **Pending Actions** — Only shown when actions exist. `Alert`-style cards with action buttons linking to other tabs via hash navigation.

6. **Recent Bookings** — 3 items using `BookingCard` (compact mode, no expand). "View All →" link to #bookings.

---

### 3. EarningsTab

1. **Balance Summary** — 3 `Card` components:
   - Available Balance (`bg-success-50`, Wallet icon)
   - Pending Amount (`bg-warning-50`, Clock icon)
   - This Month (`bg-surface-muted`, TrendingUp icon)
   - All use Lucide icons, no emojis

2. **Income Chart** — Reusable `IncomeChart` component, 12-month view. Monthly/Weekly toggle via `FilterChips`.

3. **Transaction History** — Row layout with directional icons (ArrowDownLeft/ArrowUpRight), color-coded amounts. `EmptyState` when no transactions.

4. **Remove "Withdraw Now"** — No withdrawal system exists. Replace with informational text about automatic deposits.

---

### 4. ReviewsTab (Artisan View)

1. **Rating Overview Card** — Large average + `StarRating` component. Rating breakdown bars with design tokens. **Tag Summary** — top tags with counts from new aggregation.

2. **Review List** — `ReviewCard` component (from Phase 7). Artisan reply inline with `Input as="textarea"` + `Button`. Sort/filter via `FilterChips`: "Recent" | "Highest" | "Lowest" | "Needs Reply".

3. **Backend Enhancement** — Review tag aggregation: add `tagSummary` to `GET /api/reviews/artisan/:id` response. Aggregation: `$unwind: '$tags'` → `$group: { _id: '$tags', count: { $sum: 1 } }` → `$sort: { count: -1 }`.

---

### 5. ArtisanProfileTab

1. **Profile Photo** — `Avatar` component (size="xl") + `Button variant="secondary"` for upload. `Spinner` during upload.

2. **Form Fields** — All use `Input` component. Full Name (required), Email (disabled), Phone (disabled), Bio (textarea with character counter). Grid: 2-col desktop, 1-col mobile.

3. **Actions** — `Button variant="primary"` for Save, `Button variant="ghost"` for Cancel.

No backend changes.

---

### 6. PortfolioTab

1. **Create Project** — `BottomSheet` replaces raw fixed modal. Form fields use `Input` component.

2. **Project Cards** — `Card` component for each project. Keep drag-and-drop reorder. Replace `confirm()` with confirmation `BottomSheet`.

3. **Image Upload** — `MultiImageUpload` component replaces `document.createElement('input')` hack.

4. **States** — `Skeleton` for loading, `EmptyState` for no projects.

---

### 7. AvailabilityTab

1. **Calendar View** — Keep layout, swap hardcoded colors to design tokens. `Badge` for booking indicators. `Button variant="ghost"` for navigation.

2. **Schedule Editor** — Day rows use `Card`. Time inputs use `Input`. Buttons use `Button` component.

3. **Settings** — `Input` for buffer time and advance booking. `Button variant="primary"` for save.

---

### 8. Polish Tabs

**MyClientsTab:**
- Swap raw `<button>` to `Button` component
- Swap raw `<input>` to `Input` component for search
- Already uses Avatar, EmptyState correctly

**AppearanceTab:**
- Replace `#A55233` with `brand-500` token
- Styled radio group instead of raw radio buttons
- Keep preview section

**HelpSupportTab:**
- Swap raw `<input>`/`<textarea>` to `Input` component
- Swap raw `<button>` to `Button` component
- Already uses Lucide icons and brand tokens

---

### 9. Shared Components

#### `IncomeChart` (new)
- Location: `components/dashboard/IncomeChart.jsx`
- Pure CSS bar chart (no library dependency)
- Props: `data` (array of `{label, amount}`), `period` ("monthly"|"weekly"), `months` (6 or 12)
- Responsive: fills container width
- Used by DashboardOverviewTab (6 months) and EarningsTab (12 months)

#### `ProfileCompletionCard` (new)
- Location: `components/dashboard/ProfileCompletionCard.jsx`
- Fetches from `/dashboard/verification-status`
- Progress bar + next action CTA
- Dismissible via localStorage key `ks_profile_completion_dismissed`
- Used by DashboardOverviewTab

---

### 10. Dead Code Cleanup

Delete 6 orphaned tab files:
- `components/profile/tabs/RatingsTab.jsx`
- `components/profile/tabs/PreferencesTab.jsx`
- `components/profile/tabs/USERsTab.jsx`
- `components/profile/tabs/ProfileTab.jsx`
- `components/profile/tabs/BookmarksTab.jsx`
- `components/profile/tabs/OrderHistoryTab.jsx`

---

## Design System Components Used

From `components/ui/index.js`:
- Button, Card, Input, Badge, Avatar, Skeleton, Alert, EmptyState, LoadingState, Spinner
- BottomSheet, FilterChips, StatusBadge, StarRating, ReviewCard, ImageCarousel, MultiImageUpload, TabBar

From existing rebuilt components:
- BookingCard (compact mode for dashboard)

New shared:
- IncomeChart, ProfileCompletionCard

---

## Backend Changes

**Single enhancement:** Add `tagSummary` field to `GET /api/reviews/artisan/:artisanId` response.

```javascript
// In reviewController.js — enhance getArtisanReviews
// Add aggregation stage:
const tagSummary = await Review.aggregate([
  { $match: { artisan: artisanObjectId, status: 'active' } },
  { $unwind: '$tags' },
  { $group: { _id: '$tags', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
]);
// Return as part of response: { data: reviews, count, tagSummary }
```

---

## Out of Scope

- New analytics endpoints (per-service revenue, cancellation stats, response time)
- Withdrawal/payout system
- Chat unread integration (requires Stream Chat webhook setup)
- Mobile app views
- Dark mode for new components (follow existing pattern of optional `dark:` classes)

---

## Success Criteria

1. All 11 tabs use design system components — zero raw HTML inputs/buttons
2. No hardcoded `#A55233` anywhere in dashboard tabs
3. No emoji icons (replaced with Lucide icons + StarRating component)
4. DashboardOverviewTab shows contextual profile completion nudge
5. Income chart renders from existing API data
6. ReviewsTab displays tag summary
7. PortfolioTab uses BottomSheet instead of raw modal
8. Mobile tab navigation works smoothly (horizontal scroll)
9. URL hash navigation allows deep-linking to tabs
10. 6 orphaned files deleted
