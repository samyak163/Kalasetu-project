# Phase 11: Remaining Integrations & Global Polish — Design

> **Date:** 2026-02-21
> **Scope:** Comprehensive sweep — full rebuild of all 19 hardcoded-color files, infrastructure fixes, feature wiring
> **Approach:** Layer-by-Layer (infrastructure first, then concentric layers outward)

---

## Scope Summary

| Area | Files | Effort |
|------|-------|--------|
| Infrastructure (404, error boundaries, Suspense) | 3-4 files | Medium |
| Notification components | 2 files | Low-Medium |
| Auth pages | 6 files | Medium (batch) |
| Onboarding + Profile + Modals | 5 files | Medium |
| Dashboard + Data | 3 files | Medium |
| Admin pages | 2 files | Low |
| Remaining (FeaturedArtisans, NearbyArtisans, env.config) | 3 files | Low |
| **Total** | **~24 files** | **High** |

---

## Layer 1: Infrastructure

### 1a. NotFoundPage (NEW)

Create `kalasetu-frontend/src/pages/NotFoundPage.jsx`.

- Centered card on `bg-gray-50` background
- CSS-only illustration using brand colors (abstract shapes — no external images)
- "Page not found" heading + friendly subtext
- Search input linking to `/search?q=...` for "try searching instead"
- Quick-link pills: popular categories (Mehendi, Pottery, Weaving, etc.) as `Button variant="secondary"`
- Primary `Button` → "Go Home"
- Secondary link → "Go Back" (uses `navigate(-1)`)
- Components: `Button`, `Card`, `Input`. Icons: `Search`, `Home`, `ArrowLeft` from Lucide.

**Route integration:** Add `<Route path="*" element={<NotFoundPage />} />` as last child inside Layout route in App.jsx.

### 1b. Error Boundaries

- Add layout-level `ErrorBoundary` wrapping `<Outlet />` inside Layout — route errors don't crash header/nav
- Upgrade `ErrorFallback.jsx`: hide raw error details in production (`import.meta.env.PROD`), show recovery suggestions, Lucide icon
- Keep Sentry integration as-is

### 1c. Suspense Fallback

- Replace `<div>Loading...</div>` with `<LoadingState />` component
- Wrap at Layout level so route transitions show spinner inside layout chrome

---

## Layer 2: Notification Components

### 2a. NotificationPanel (REBUILD)

- Keep slide-in-from-right pattern, upgrade to `Card` styling, `bg-white shadow-card` tokens
- Header: `Badge` for unread count, `Button variant="ghost"` for "Mark all read", Lucide `X` close
- Items: `Card hover` containers, Lucide icons per notification type (Bell, ShoppingBag, MessageCircle, Star), `Avatar` for sender photos
- Empty: `EmptyState` with `Bell` icon
- Unread dot: `Badge variant="error"` (replaces raw span)
- All `#A55233` → `brand-500` tokens

### 2b. NotificationPrompt (REBUILD)

- `Card` wrapper with `shadow-lg`
- Lucide `Bell` in `bg-brand-50 text-brand-500` circle
- `Button variant="primary" size="sm"` for Enable
- `Button variant="ghost" size="sm"` for "Not now"
- Lucide `X` close
- All `bg-blue-*` → `bg-brand-*` tokens
- Keep 5-second delay + localStorage dismiss behavior

---

## Layer 3: Auth Pages (6 files)

### Shared Pattern — Login Pages (LoginPage + UserLoginPage)

- `Card` wrapping form body (replaces `div.bg-white.shadow-xl`)
- `Input` for all form fields (replaces raw `<input>` with `focus:ring-[#A55233]`)
- Password toggle: Lucide `Eye` / `EyeOff` (replaces custom SVGs)
- `Alert variant="error"` for error messages
- `Button variant="primary"` full-width submit
- `Spinner` inside button during loading
- Brand logo: `text-brand-500` (replaces `text-[#A55233]`)
- Link colors: `text-brand-500 hover:text-brand-600`

### Shared Pattern — Register Pages (RegisterPage + UserRegisterPage)

- Same as login pattern plus additional form fields
- Password strength indicator (reuse Phase 10 ProfileTab pattern if applicable)

### Selector Pages (AuthSelector + RegisterSelector)

- `Card hover` for each option (replaces raw div)
- Lucide `User` for customer, `Palette` for artisan (replaces emoji icons)
- `Button` or styled Link for bottom navigation link
- Keep 2-column grid layout

---

## Layer 4: Onboarding + Profile + Modals (5 files)

### 4a. ArtisanOnboarding (REBUILD)

- Delete `const BRAND = '#A55233'` — all usage → design tokens
- `Input` for all form fields
- `Button variant="primary"` / `Button variant="secondary"` for all buttons
- Step indicator circles: `bg-brand-500` active/completed, `bg-gray-300` upcoming
- Category pills → `FilterChips` or `Button variant="secondary"` toggles
- Day selector: `accent-brand-500` checkboxes (Phase 10 pattern)
- Portfolio upload → `MultiImageUpload` or `Avatar` for profile photo
- `Alert variant="error"` / `Alert variant="success"` for feedback
- `Card` for each step container

### 4b. ProfileDropdown (REBUILD)

- `Avatar` component for user photo/initials (replaces `bg-[#A55233]` fallback)
- Lucide `ChevronDown` (replaces raw SVG)
- `focus:ring-brand-500` (replaces `focus:ring-[#A55233]`)
- Menu items: Lucide icons (User, Settings, HelpCircle, LogOut)
- `text-error-600` for Sign Out
- Keep click-outside handler and `open-profile` custom event dispatch

### 4c. HowItWorks (REBUILD)

- Icon circles: `bg-brand-500` (replaces `bg-[#A55233]`)
- Lucide icons: `Search`, `MessageCircle`, `Star` (replaces custom `FindIcon`/`ConnectIcon`/`ReviewIcon`)
- `bg-[#F5F5F5]` → `bg-gray-50`, `text-[#1A1A1A]` → `text-gray-900`

### 4d. HowItWorksModal (REBUILD)

- Step number circles: `bg-brand-500` (replaces `bg-[#A55233]`)
- Lucide `X` close icon
- `Button variant="primary"` full-width for "Got It!"
- Keep modal pattern (content-heavy, not a form)

### 4e. ArtisanInfoModal (REBUILD)

- Lucide `X` close, `Check` icon in `text-success-500` (replaces `✓` text)
- `Button variant="primary"` for "Get Started"
- `Button variant="secondary"` for "Maybe Later"
- Keep navigate-on-click behavior

---

## Layer 5: Dashboard + Data (3 files)

### 5a. UserDashboard (REBUILD)

- Active NavLink: `bg-brand-50 text-brand-600` (replaces `bg-[#A55233]/10 text-[#A55233]`)
- Lucide icons per nav item: `LayoutDashboard`, `CalendarCheck`, `CreditCard`, `Settings`, `HelpCircle`, `User`
- `Card` wrapper for sidebar
- Keep `<Outlet />` pattern

### 5b. UserPayments (REBUILD)

- `StatusBadge` or `Badge` for payment statuses (captured → success, failed → error, pending → warning, refunded → info)
- `Card` for payment items
- `Skeleton` for loading state
- `EmptyState` with `CreditCard` icon
- `Button variant="ghost" size="sm"` for Details/Print Receipt (Lucide `Printer` icon)
- `BottomSheet` for refund confirmation (replaces `window.confirm()`)
- All `text-[#A55233]` → `text-brand-500`

### 5c. MyClientsTab — Wire Action Buttons

- **"View History"** → Navigate to bookings tab with `?clientId={client._id}` filter
- **"Call"** → `window.open(\`tel:${client.phoneNumber || client.phone}\`)` — simple tel: link
- **"Message"** → Navigate to `/messages?userId=${client._id}` to open/create Stream Chat channel

---

## Layer 6: Admin Pages (2 files)

### 6a. AdminDashboard (TOKEN SWAP + COMPONENT UPGRADE)

- `COLORS` array → CSS custom property references or brand token variants
- Loading → `LoadingState` component
- Error → `Alert variant="error"` with retry `Button`
- Stat cards → `Card` wrappers
- Keep Recharts (already imported and working)

### 6b. AdminAnalytics (TOKEN SWAP + COMPONENT UPGRADE)

- `STATUS_COLORS` → semantic tokens: `bg-success-500`, `bg-error-500`, `bg-warning-400`, `bg-brand-500`, `bg-info-500`
- `StatCard` → wrap in `Card` component
- `SkeletonCard` → design system `Skeleton`
- `SectionError` → `EmptyState` component
- Keep `VerticalBars` (pure CSS chart — good pattern)

---

## Layer 7: Remaining Files (3 files)

### 7a. FeaturedArtisans (REBUILD)

- Profile photo fallback → `Avatar` component
- Verified badge → Lucide `BadgeCheck` or `CheckCircle` in `text-success-500`
- Star → keep simple `text-yellow-500` star (fine for card)
- `SkeletonCard` → design system `Skeleton`
- Arrow → Lucide `ArrowRight`
- "View All Artisans" → `Button variant="secondary"` with icon
- Consider using `ArtisanCard` from design system if it fits

### 7b. NearbyArtisans (REBUILD)

- Same artisan card pattern: `Avatar`, `Badge`, design tokens
- Loading → `Skeleton` or `LoadingState`
- Error/empty → `EmptyState` or `Alert`
- Map styling: keep existing

### 7c. env.config.js (TOKEN SWAP)

- Replace `color: '#A55233'` with design token reference or shared constant

---

## Verification Criteria

After all layers complete:

1. **Zero `#A55233`** — `grep -r "#A55233" kalasetu-frontend/src/` returns 0 results
2. **Zero emoji icons** in components (no text emoji as functional UI elements)
3. **Build passes** — `npm run build` succeeds
4. **Lint passes** — `npm run lint` clean or only pre-existing warnings
5. **404 route works** — navigating to unknown path shows NotFoundPage
6. **MyClientsTab buttons functional** — all 3 buttons have click handlers
7. **Error boundaries layered** — ErrorBoundary at both root and layout level

---

## Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| 404 page style | Illustrated + helpful | CSS illustration, search, category links — not a dead end |
| Auth page approach | Full rebuild | Consistent design system usage, not just token swap |
| Admin page approach | Full treatment | Same visual polish level as user-facing pages |
| MyClientsTab Call | tel: link | Phone call — Daily.co requires booking context |
| MyClientsTab Message | Navigate to /messages | Open/create Stream Chat channel with client |
| Refund confirmation | BottomSheet | Consistent with CancellationSheet pattern from Phase 6 |
| HowItWorksModal | Keep as modal | Content-heavy — not suited for BottomSheet |
| Recharts in admin | Keep | Already imported and working, replacing = scope creep |
| VerticalBars in analytics | Keep | Pure CSS chart, no dependency, good pattern |

---

*Designed: 2026-02-21*
*Designed by: Claude Code (brainstorming skill)*
