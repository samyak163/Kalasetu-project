# KalaSetu UI/UX Overhaul Design

> Date: 2026-02-18
> Status: All Sections Approved
> Approach: Design System First — build foundation, then rebuild every screen
> Inspiration: Urban Company (Align design system, service packages, partner dashboard), Zomato (Sushi design system, Reviews 2.0, tag-based reviews, color-coded ratings), Swiggy (slide-to-confirm, bottom sheet checkout, shimmer skeletons, 3-state search)

## Context

KalaSetu is a full-stack artisan marketplace (React + Node.js/Express + MongoDB). The app has solid backend infrastructure but the frontend is fragmented — different pages look like different apps, critical flows are incomplete, and there's no design system enforcement.

An offering redesign plan already exists (`docs/plans/2026-02-18-artisan-offering-redesign-design.md`) covering data models, offering types (products/services/custom orders), category browse, artisan profile tabs, and wizard forms. This design covers EVERYTHING ELSE — the visual foundation, screen layouts, flow fixes, and integration repairs.

### Research Sources
- Urban Company: 20+ sources covering Align design system, partner app, booking flow, OTP verification, checkout optimization
- Zomato: Sushi design system, Reviews 2.0 tag system, dual ratings, Z-Tag Corpus, distance-based ratings
- Swiggy: Server-driven UI, WiRa widget ranking, slide-to-confirm pattern, payment error recovery, shimmer skeletons

### Key Architectural Insight
UC is service-first (users find services, get auto-matched to providers). KalaSetu is artisan-first (users find artisans, see their unique work). This is correct for a craft marketplace where the maker IS the differentiator.

---

## Section 1: Design System — Upgrade & Enforce (APPROVED)

### Problem
11 well-built UI components exist in `kalasetu-frontend/src/components/ui/` but only 2 are imported anywhere. Every page rebuilds buttons, inputs, and loading states from scratch with raw Tailwind classes. This is the root cause of visual inconsistency.

### Existing Components (Keep & Upgrade)

| Component | Current State | Upgrade |
|-----------|--------------|---------|
| Button | Solid (4 variants, 3 sizes, loading) | Add `outline` variant, icon-only mode |
| Card | Basic | Add `interactive` variant (hover lift), `compact` option |
| Modal | Solid (accessibility, portal) | Add `BottomSheet` mode for mobile |
| Input | Good | Add `textarea`, `select`, `search` variants |
| Badge | Good | Add `rating` variant (color-coded green/yellow/red like Zomato) |
| Skeleton | Good (has shimmer) | Just needs adoption |
| Alert | Solid | Fine as-is |
| EmptyState | Good | Add illustration slot, themed variants per section |
| LoadingState | Basic | Replace with Skeleton usage (skeleton > spinner for perceived speed) |
| Spinner | Basic | Keep for inline use, prefer Skeleton for page-level |
| Avatar | Good | Fine as-is |

### New Components to Build

| Component | Inspired By | Purpose |
|-----------|-------------|---------|
| BottomSheet | Swiggy/UC | Slide-up panel for mobile interactions (filters, service details, checkout) |
| FilterChips | Zomato/Swiggy | Horizontal scrollable filter pills with active state |
| StickyBottomCTA | UC/Swiggy | Persistent bottom bar ("Book Now — Rs.1,299") visible on scroll |
| TabBar | Zomato/UC | Sticky horizontal tabs with underline indicator |
| StatusBadge | Swiggy | Booking status indicator with color-coded states |
| RatingBadge | Zomato | Color-coded rating (green 4+, yellow 3-4, red <3) with star and count |
| ArtisanCard | All three | Standardized artisan listing card for search, homepage, category browse |
| ServiceCard | UC | Service package card with price, duration, included items, Book button |
| ReviewCard | Zomato | Review with user info, rating, tags, photos, artisan response |
| ImageCarousel | Zomato/UC | Swipeable image gallery for portfolios, product details |
| Toast | Swiggy | Non-blocking success/error notifications |

### Tailwind Config Upgrades

- Spacing tokens (8px grid): `0.5: 4px, 1: 8px, 1.5: 12px, 2: 16px, 3: 24px, 4: 32px, 5: 40px, 6: 48px`
- Semantic color aliases: `surface`, `surface-hover`, `text-primary`, `text-secondary`, `text-muted`, `border-default`
- Z-index scale: `z-sticky: 40`, `z-modal: 50`, `z-toast: 60`
- Container max-width for consistent page widths

### Enforcement Strategy

- Barrel export from `components/ui/index.js`
- Every page rebuild replaces raw Tailwind with component imports
- Components become the ONLY way to render buttons, cards, inputs, modals

---

## Section 2: Homepage Redesign (APPROVED)

### Layout (Top to Bottom)

1. **Location Bar (sticky)** — Shows current city/area, tap to change. Drives "Near You" content.
2. **Search Bar** — Prominent, rotating placeholder ("Search for pottery...", "Find a tailor near you..."). Tap opens full-screen search overlay.
3. **Hero Banner Carousel** — Auto-rotating full-width banners (3:1 ratio): seasonal crafts, featured artisans, promotions. Replaces current static hero.
4. **Category Chips (horizontal scroll)** — Zomato-style icon + label chips. Replaces current grid (saves vertical space). Tap navigates to `/category/:slug`.
5. **Trending Products (carousel)** — NEW from offering redesign. Horizontal scroll of ProductCards. Fetched from `/api/offerings/products?limit=8`.
6. **Popular Services (carousel)** — NEW from offering redesign. Horizontal scroll of ServiceCards (UC-style packages). Fetched from `/api/offerings/packages?limit=8`.
7. **Top Artisans Near You** — Existing, using standardized ArtisanCard component.
8. **Featured Artisans** — Existing, redesigned with ArtisanCard.
9. **How KalaSetu Works** — Existing 3-step explainer, polished. Moves to bottom (returning users don't need it).
10. **Footer**

### Key Decisions

- Location bar can be simple city dropdown initially (not GPS auto-detect)
- Every section shows shimmer skeletons while loading
- All cards use standardized components (ArtisanCard, ProductCard, ServiceCard)
- Carousels use snap-scroll for clean swipe behavior
- Mobile: location + search compact into single row, cards stack single-column

### What's Removed

- Static hero section with large background image -> replaced with dynamic banner carousel
- Large categories grid -> replaced with compact horizontal chips

---

## Section 3: Search & Discovery (APPROVED)

### 3-State Search Model (Swiggy Pattern)

**State 1: Pre-Search (tap search bar -> full-screen overlay)**
- Recent searches as chip tags (stored in localStorage)
- Trending searches by region (hardcoded initially, later from PostHog analytics)
- Browse by Category quick-tap grid

**State 2: Typing (autocomplete)**
- Results after 2-3 characters
- Blended results with type icons: Artisan, Product, Service, Category
- 5-8 suggestions max
- Algolia-powered (existing integration)

**State 3: Results Page (tabbed + filtered)**
- Tabs: [All] [Artisans] [Services] [Products]
- Default "All" shows mixed results with section headers
- Tab with most results gets count badge

### Filter Chips (Zomato/Swiggy Pattern)

Horizontal scrollable chips below tabs:
- **Sort** -> BottomSheet: Relevance, Rating, Price Low->High, Price High->Low, Distance
- **Rating 4+** -> Toggle chip
- **Price Range** -> BottomSheet with range slider
- **Near Me** -> Toggle, filters by city/region
- **Available Now** -> Toggle, shows artisans accepting bookings
- **Verified** -> Toggle, only verified artisans

Active chips: filled brand-color background. Inactive: outlined.

### Backend Changes

- Upgrade `GET /api/search/suggestions` to return `type` field
- NEW: `GET /api/search/trending` — top searched terms by region
- Recent searches: frontend-only, localStorage

---

## Section 4: Artisan Profile Page (APPROVED)

### Layout

1. **Portfolio Hero Carousel** — Full-width, 16:9 images of artisan's best work. Swipeable with pagination dots. Images first (Zomato visual-first principle).

2. **Compact Header** — Avatar + name + craft + location + verified badge. Quick stats row: Rating (RatingBadge), Experience (years), Total Bookings. Tagline (1 line). Chat & Call buttons in top-right.

3. **Sticky TabBar** — [Services] [Products] [Custom] [Reviews] [About]. Single tab row, content swaps below (NOT tabs within tabs). Tabs shown/hidden based on artisan's actual offerings. Sticks to top when scrolled past.

4. **Tab Content** — One tab's content visible at a time. Services tab: UC-style ServiceCards with included/excluded checklist, price, duration, sample images, "Book Now" button, "Most Booked" badge. Products tab: product grid from offering redesign. Custom tab: custom order info from offering redesign. Reviews tab: Zomato Reviews 2.0 with tag summary + ReviewCards. About tab: bio, full portfolio gallery (categorized), working hours, certifications.

5. **StickyBottomCTA** — Always visible: "Book Now - From Rs.1,500". Updates when user selects a specific service.

### Reviews 2.0 (Zomato Pattern)

- Tag summary at top: most common tags as chips with counts
- KalaSetu tags: "Excellent Craftsmanship", "On Time", "True to Photos", "Great Communication", "Exceeded Expectations", "Patient & Helpful", "Clean Workshop"
- Negative: "Delayed", "Different from Photos", "Poor Packaging"
- Individual reviews: user name, rating, date, tags, optional text, optional photos
- Artisan responses visible below each review
- "Helpful" vote button

### Trust Signals

| Signal | Location |
|--------|----------|
| Verified Artisan badge | Next to name in header |
| RatingBadge (color-coded) | Stats row |
| "120 bookings completed" | Stats row |
| "Responds within 2 hours" | Stats row |
| "8 years experience" | Stats row |
| "Most Booked" on top service | ServiceCard badge |
| Review tags summary | Reviews tab top |
| Portfolio gallery | Hero + About tab |

---

## Section 5: Booking + Payment Flow (APPROVED)

### Flow: BottomSheet Checkout (Swiggy/UC Pattern)

No page navigation during booking — everything in bottom sheets. User stays on artisan profile.

**Step 1: Service Summary BottomSheet**
- Service name, artisan name, price, duration
- Included items checklist
- Date selection: horizontal scrollable day chips
- Time selection: available slot chips (greyed out = booked, respects workingHours + minimumBookingNotice)
- Special requests text field
- "Continue" CTA with price

**Step 2: Payment BottomSheet**
- Order summary (service + date + time)
- Price breakdown: service fee + platform fee (transparent even if Rs.0)
- Payment method selection: UPI, Card, Netbanking
- Slide-to-Confirm (Swiggy pattern): 70% threshold, chevron -> checkmark
- On slide complete -> opens Razorpay checkout

**Step 3: Confirmation (full-screen)**
- Checkmark animation celebration
- All booking details: service, artisan, date/time, location, booking ID
- Quick actions: Message Artisan, View Booking Details, Back to Home
- Notification sent to artisan simultaneously

### Critical Backend Fixes

- **Payment-Booking Atomicity**: Razorpay order created first -> user pays -> on verify success -> booking created in same request/transaction. No more orphaned bookings.
- **Enforce minimumBookingNotice**: Grey out time slots too close to now
- **Implement autoAcceptBookings**: If artisan has flag enabled, booking goes straight to confirmed
- **New endpoint**: `GET /api/artisans/:id/availability?date=YYYY-MM-DD` returns available time slots
- **Payment error recovery**: On Razorpay failure, show empathetic error in BottomSheet with retry + alternative method (Swiggy pattern)

---

## Section 6: Booking Status & Tracking (APPROVED)

### Booking Lifecycle (5 States)

```
pending → confirmed → completed
   ↓         ↓
rejected  cancelled
```

### User View: My Bookings Page

- **Status tabs**: [Upcoming] [Completed] [Cancelled] — filter bookings by state
- **Upcoming** = pending + confirmed (sorted by date, nearest first)
- Each booking card shows: artisan avatar + name, service name, date/time, StatusBadge, quick actions

### Booking Detail Card (Expandable)

| Field | Display |
|-------|---------|
| StatusBadge | Color-coded: pending=yellow, confirmed=blue, completed=green, cancelled=red, rejected=gray |
| Service | Name + price + duration |
| Date/Time | Formatted with day name |
| Artisan | Avatar + name, tap to view profile |
| Booking ID | Short reference code |
| Actions | Context-dependent (see below) |

### Context-Dependent Actions

| Status | User Actions | Artisan Actions |
|--------|-------------|-----------------|
| Pending | Cancel, Message Artisan | Accept, Reject, Message Customer |
| Confirmed | Cancel (with policy), Message, Call | Complete, Cancel, Message, Call |
| Completed | Leave Review, Rebook | — |
| Cancelled | Rebook | — |
| Rejected | Browse Other Artisans | — |

### Cancellation Flow

- **Before confirmation**: Free cancel, instant
- **After confirmation**: Show cancellation policy (if any), confirm with reason dropdown
- **Refund**: Automatic trigger to Razorpay refund endpoint on cancellation of paid booking
- **BottomSheet**: Cancellation happens in a BottomSheet, not a separate page

### Real-Time Updates

- Status changes trigger in-app notification (via NotificationContext)
- Push notification via OneSignal (if enabled)
- Booking list auto-refreshes when status changes

---

## Section 7: Reviews Flow (APPROVED)

### When to Show Review Prompt

- After booking status changes to `completed`
- In-app notification: "How was your experience with [Artisan Name]?"
- Also accessible from completed booking card ("Leave Review" button)

### Review Submission (BottomSheet)

**Step 1: Rating**
- 5-star rating selector (large, tappable stars)
- Rating label updates: 1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent

**Step 2: Tags (Zomato Pattern)**
- Tap-to-select tag chips based on rating:
- Positive (4-5 stars): "Excellent Craftsmanship", "On Time", "True to Photos", "Great Communication", "Exceeded Expectations", "Patient & Helpful", "Clean Workshop"
- Negative (1-2 stars): "Delayed", "Different from Photos", "Poor Packaging", "Unresponsive", "Overpriced"
- Neutral (3 stars): Show all tags
- Select 1-5 tags (required for submission)

**Step 3: Optional Details**
- Text review (optional, min 20 chars if entered)
- Photo upload (optional, max 3 photos via Cloudinary)
- "Submit Review" CTA

### Review Display (On Artisan Profile)

- Uses ReviewCard component from design system
- Tag summary chips at top of Reviews tab (most common tags with counts)
- Individual reviews: avatar, name, RatingBadge, date, tags, text, photos
- Artisan can respond (single response per review, shown below)
- "Helpful" vote button per review

### Backend

- Reviews require `completed` booking (existing validation — keep it)
- Store selected tags in review document as string array
- Aggregate tag counts for artisan profile summary
- `GET /api/reviews/artisan/:id/tags` — returns tag counts for summary display

---

## Section 8: Chat Integration (APPROVED)

### Current State

Stream Chat is integrated with ChatContext, ChannelList, and ChatInterface components. The MessagesPage exists. The integration works but has UX gaps.

### Fixes

1. **Chat Access Points** — Add "Message" button on:
   - Artisan profile page (header area)
   - Booking confirmation screen
   - Booking detail card (for active bookings)
   - Each button creates/opens a Stream channel with the artisan

2. **Chat Page Rebuild** — Using design system components:
   - Left panel: ChannelList with artisan avatars, last message preview, unread count badge
   - Right panel: ChatInterface with message input, send button, photo attachment
   - Mobile: Full-screen channel list, tap opens full-screen chat
   - Empty state: "No conversations yet" with EmptyState component

3. **Chat Notifications**
   - Unread message count in navbar (red badge on chat icon)
   - New message triggers in-app notification banner
   - Deep link from notification to specific chat channel

4. **Booking Context in Chat**
   - When chat is opened from a booking, show booking reference at top of chat
   - "Booking #KS-1234 — Pottery Workshop — Feb 20"
   - Helps both parties know which booking they're discussing

### What NOT to Build

- No automated chatbot or canned responses (keep it human)
- No file sharing beyond photos (unnecessary complexity)
- No group chats (always 1:1 between customer and artisan)

---

## Section 9: Artisan Dashboard (APPROVED)

### Current State

ArtisanAccountPage has 11 sidebar tabs: Dashboard, Profile, Services, Portfolio, Bookings, Availability, Earnings, Reviews, My Clients, Appearance, Help & Support. The structure is solid but uses raw Tailwind everywhere.

### Redesign Approach

Keep the sidebar tab structure (it works well for desktop), rebuild each tab's content with design system components.

### Tab Upgrades

| Tab | Current | Redesign |
|-----|---------|----------|
| Dashboard | Basic stats + booking list | UC-style overview: today's bookings (highlighted), stats cards (earnings, rating, response rate), quick actions |
| Profile | Form fields | Organized sections with preview of public profile, edit inline |
| Services | List | ServiceCards from design system, drag-to-reorder, "Most Booked" auto-badge |
| Portfolio | Image grid | ImageCarousel view, category grouping, drag-to-reorder |
| Bookings | Table-style list | StatusBadge on each, filter chips (Pending/Confirmed/Completed), accept/reject actions inline |
| Availability | Calendar + hours | Weekly hour slots, blocked dates calendar, minimumBookingNotice setting |
| Earnings | Basic table | Summary cards (this month, total, pending), payment history with StatusBadge |
| Reviews | List | ReviewCards, tag summary at top, response button per review |
| My Clients | Customer list | Customer cards with booking count, last booking date, total spent |
| Appearance | Theme toggle | Keep simple — dark/light toggle |
| Help & Support | Support form | FAQ accordion + support ticket form using design system Input/Button |

### Mobile Responsive

- Sidebar collapses to horizontal scrollable tab strip (already partially implemented)
- Content area takes full width
- Bottom navigation bar for key tabs (Dashboard, Bookings, Messages, Profile)

### Key Additions

- **Notification bell** in dashboard header — shows new booking requests, messages, reviews
- **Quick stats refresh** — dashboard stats auto-update, show shimmer skeletons while loading
- **Booking accept/reject** — inline on booking cards, confirm via BottomSheet with notes field

---

## Section 10: User Dashboard (APPROVED)

### Current State

UserDashboard has a sidebar with pages: Dashboard Home, Bookings, Payments, Preferences, Support. UserDashboardHome shows stats cards + upcoming bookings + recent payments.

### Redesign

| Page | Current | Redesign |
|------|---------|----------|
| Dashboard Home | Stats + lists | Welcome greeting, upcoming bookings (highlighted, with countdown), stats cards (total bookings, total spent, reviews given), recent activity feed |
| Bookings | Booking list | Full booking management with status tabs (Upcoming/Completed/Cancelled), StatusBadge, expandable detail cards, action buttons per status |
| Payments | Payment history | Payment cards with StatusBadge, amount, date, booking reference, receipt download link |
| Preferences | Settings form | Notification settings, location preference, account settings with design system components |
| Support | Support form | FAQ accordion (common questions), then support ticket form if FAQ doesn't help |

### Key Additions

- **Review prompts** — Banner at top of dashboard when completed bookings have no review
- **Rebook shortcut** — "Book Again" on completed booking cards
- **Favorite artisans** — Simple heart toggle on artisan profiles, favorites list in dashboard (localStorage initially, later backend)

### Mobile Layout

- Sidebar becomes bottom tab bar: Home, Bookings, Messages, Profile
- Dashboard Home is the landing tab
- Notifications accessible from header bell icon

---

## Section 11: Remaining Integrations (APPROVED)

### Notifications (OneSignal + In-App)

**Current State**: OneSignal SDK initialized, NotificationPrompt component exists, useNotifications hook available. Push notifications partially set up.

**Fixes**:
- Ensure OneSignal player ID is saved to user/artisan document on opt-in
- In-app notification dropdown in navbar (bell icon with unread count)
- Notification types: new booking, booking status change, new message, new review, payment received
- Each notification has: icon, title, message, timestamp, read/unread state, deep link
- `GET /api/notifications` endpoint already exists — use it
- Mark as read on click, mark all as read button

### Video Calling (Daily.co)

**Current State**: Daily.co integration exists (VideoCallPage, callController, callHistoryController). CallsHistory page exists in artisan dashboard.

**Fixes**:
- "Video Call" button on artisan profile (visible only for confirmed bookings)
- Call initiation creates Daily.co room and sends notification to other party
- In-call UI: video feed, mute/unmute, camera on/off, end call, minimize to PiP
- Call history visible in both artisan and user dashboards
- Missed call notification

### Email (Resend)

**Current State**: Resend is configured for transactional emails.

**What to Send**:
- Booking confirmation (to both parties)
- Booking status change (accept/reject/cancel/complete)
- Review received (to artisan)
- Welcome email on registration
- Password reset

### Error States & Empty States (Global)

Every page and every data-dependent component must handle:
1. **Loading** — Skeleton shimmer (not spinner)
2. **Empty** — EmptyState component with contextual illustration and action button
3. **Error** — Alert component with retry button
4. **Offline** — Simple "You're offline" banner at top (check navigator.onLine)

### 404 Page

- Friendly illustration
- "Page not found" message
- "Go Home" and "Search" buttons
- Not a raw browser error

---

## Implementation Order

1. Design system foundation (colors, typography, components)
2. Homepage redesign
3. Search & discovery
4. Artisan profile page
5. Booking + payment flow (fix Razorpay)
6. Booking status & tracking
7. Reviews flow
8. Chat integration fix
9. Artisan dashboard
10. User dashboard
11. Remaining integrations (notifications, calling, maps)
