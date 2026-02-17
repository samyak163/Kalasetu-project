# KalaSetu V2 Changes Log

> All changes made during V2 development, organized chronologically.
> **Period covered:** 2026-02-10 to present

---

## 2026-02-10 — Major Foundation Update (`f98388d`)

Massive commit covering backend improvements, frontend UI components, admin enhancements, and project documentation. **152 files changed, 20,503 insertions.**

### Backend Changes

**Controllers Modified:**
- `adminAuthController.js` — Admin login/profile improvements
- `adminDashboardController.js` — Enhanced admin dashboard with more stats, filtering, management (+127 lines)
- `artisanController.js` — Improved artisan search and geospatial queries
- `artisanProfileController.js` — Profile management refinements
- `artisanServiceController.js` — Minor fixes
- `authController.js` — Artisan auth flow improvements (+69 lines)
- `bookingController.js` — Booking lifecycle improvements with better validation (+104 lines)
- `chatController.js` — Stream Chat integration fixes
- `paymentController.js` — Razorpay payment flow improvements (+124 lines)
- `reviewController.js` — Review system enhancements
- `searchController.js` — Search improvements (+53 lines)
- `seoController.js` — SEO metadata generation refinements
- `userAuthController.js` — Customer auth flow improvements (+65 lines)
- `videoController.js` — Daily.co video call improvements

**New Controllers:**
- `artisanCustomerController.js` — Artisan's customer list with per-customer booking stats (aggregation-based)
- `artisanDashboardController.js` — Artisan dashboard stats (earnings, bookings, weekly growth)

**New Routes:**
- `artisanCustomerRoutes.js` — `/api/artisan/customers`
- `artisanDashboardRoutes.js` — `/api/artisan/dashboard/stats`

**Routes Modified:**
- `authRoutes.js` — Additional auth endpoints
- `bookingRoutes.js` — Booking response/completion routes
- `chatRoutes.js` — Chat channel management
- `paymentRoutes.js` — Payment verification, webhook, earnings
- `reviewRoutes.js` — Review creation, helpful toggle
- `uploadRoutes.js` — Upload route improvements
- `userAuthRoutes.js` — User auth refinements

**Models Modified:**
- `artisanModel.js` — Additional fields
- `artisanServiceModel.js` — Minor fix
- `bookingModel.js` — New fields for booking lifecycle
- `categoryModel.js` — Minor fix
- `paymentModel.js` — New fields for webhook idempotency
- `reviewModel.js` — Minor addition
- `userModel.js` — Profile improvements

**Middleware:**
- `authMiddleware.js` — Added `protectAdmin` support
- `errorMiddleware.js` — Centralized error handling rewrite (+57 lines)
- `userProtectMiddleware.js` — Enhanced user auth middleware (+43 lines)

**Utils:**
- `email.js` — Email template improvements
- `response.js` — NEW: Standardized API response utility
- `streamChat.js` — Stream Chat helper improvements

**Server:**
- `server.js` — Route mounting, middleware ordering changes

**Scripts (new):**
- `checkArtisanStatus.js` — Verify artisan data integrity
- `createTestArtisan.js` — Create test artisan accounts
- `createTestUser.js` — Create test user accounts
- `generateDatabaseDoc.js` — Auto-generate database documentation
- `resetTestAdmin.js` — Reset admin account for testing

**Database Docs (new):**
- `docs/DATABASE_SCHEMA.md` — Full schema documentation
- `docs/DATABASE_REPORT.md` — Database analysis report
- `docs/DATABASE_ER_DIAGRAM.txt` — ER diagram

### Frontend Changes

**New UI Component Library** (`src/components/ui/`):
- `Alert.jsx` — Alert/notification boxes
- `Avatar.jsx` — User avatar display
- `Badge.jsx` — Status badges
- `Button.jsx` — Button variants (primary, secondary, ghost, danger)
- `Card.jsx` — Card container
- `EmptyState.jsx` — Empty state placeholder
- `Input.jsx` — Form inputs with labels and errors
- `LoadingState.jsx` — Loading spinners
- `Modal.jsx` — Standardized modal with animations
- `Skeleton.jsx` — Skeleton loaders
- `Spinner.jsx` — Loading spinner
- `index.js` — Barrel export

**Pages Modified:**
- `ArtisanAccountPage.jsx` — Dashboard tabs redesign (+79 lines)
- `ArtisanDashboardPage.jsx` — Updated dashboard
- `ForgotPassword.jsx` — Flow improvements
- `HomePage.jsx` — Minor updates
- `MessagesPage.jsx` — Chat page improvements
- `ShippingPolicy.jsx` — Content update
- `UserProfilePage.jsx` — User dashboard tabs redesign (+78 lines)
- `VerifyEmail.jsx` — Email verification flow rewrite (+111 lines)
- `VideoCallPage.jsx` — Video call improvements (+65 lines)

**Profile Tabs Modified:**
- `BookingsTab.jsx` — Major rewrite (+282 lines) — accept/reject/complete flows
- `BookmarksTab.jsx` — UI improvements
- `DashboardOverviewTab.jsx` — Stats and charts (+110 lines)
- `EarningsTab.jsx` — Revenue tracking UI (+91 lines)
- `OrderHistoryTab.jsx` — Order history improvements (+132 lines)
- `ProfileTab.jsx` — Minor fixes
- `ReviewsTab.jsx` — Review management (+115 lines)

**New Profile Tabs:**
- `MyClientsTab.jsx` — Artisan's customer list with booking stats

**Admin Pages Modified:**
- All admin pages (`AdminArtisans`, `AdminBookings`, `AdminDashboard`, `AdminLogin`, `AdminPayments`, `AdminProfile`, `AdminReviews`, `AdminSettings`, `AdminUsers`) — Various improvements

**Other Frontend:**
- `Header.jsx` — Navigation improvements
- `Footer.jsx` — Footer redesign (+59 lines)
- `AuthContext.jsx` — Auth state management improvements
- `ChatContext.jsx` — Stream Chat context improvements (+40 lines)
- `NotificationContext.jsx` — Notification polling fixes
- `tailwind.config.js` — Design tokens added (+80 lines)
- `vite.config.js` — Build configuration updates

### Project Documentation (new files)
- `BUGS.md` — Known bugs tracker
- `CLAUDE.md` — Claude Code project instructions
- `CODEBASE_GUIDE.md` — Codebase overview
- `RECOMMENDATIONS.md` — Comprehensive improvement recommendations
- `ROADMAP.md` — Development roadmap
- `antigravity/` — 21 step-by-step fix/create guides for identified issues

---

## 2026-02-12 — V2 Milestone Initialization

### `ca75b97` — docs: map existing codebase
- Created `.planning/codebase/` analysis documents
- Mapped all controllers, routes, models, middleware

### `ea563d8` — docs: initialize KalaSetu v2 milestone planning artifacts
- Created `.planning/` structure for V2 milestone tracking
- Set up ROADMAP.md, phase planning documents

---

## 2026-02-13 — Phase 01: Critical Bug Fixes

### `9c13b10` — docs(phase-01): research critical bug fixes domain
- Researched existing bugs, prioritized by severity

### `8234210` — docs(01-critical-bug-fixes): create phase plan
- Planned fixes for 4 critical bugs

### `dd4f734` — fix: wrap booking creation in MongoDB transaction (BUG-01)
- **Problem:** Race condition in booking creation — two customers could book the same time slot simultaneously
- **Fix:** Wrapped booking creation in a MongoDB transaction with `session.startTransaction()`. If concurrent booking detected, transaction aborts and returns error
- **Files:** `bookingController.js`

### `498b04b` — feat: add shared multer config with file validation
- **What:** Created reusable multer middleware for file uploads
- **Why:** No file type or size validation existed — users could upload anything
- **Files:** New shared multer config module

### `a403834` — fix: resolve NotificationContext infinite refresh loop
- **Problem:** NotificationContext was re-fetching notifications on every render, causing infinite API calls
- **Fix:** Added proper dependency array and polling interval
- **Files:** `NotificationContext.jsx`

### `f1e90f0` — fix: tighten auth rate limiting (BUG-04)
- **Problem:** Auth rate limiter was too loose — allowed 100 attempts per 15 minutes
- **Fix:** Tightened to stricter limits on login, registration, and OTP endpoints
- **Files:** Auth route configuration

### `2d6743e` — feat: add file validation to artisan profile routes
- **What:** Applied the shared multer validation to artisan profile photo and document upload routes
- **Files:** `artisanProfileController.js`, routes

### `0e20d48` — fix: replace empty catch blocks with Sentry error reporting
- **Problem:** Multiple `try-catch` blocks had empty catch — errors were silently swallowed
- **Fix:** All empty catches now report to Sentry with context
- **Files:** Multiple controllers and utils

### `6f43b30` — docs(phase-01): complete phase execution and verification
- Phase 01 completed and verified

---

## 2026-02-13 — Phase 02: Refund & Support System

### `845a7ff` — docs(02): research refund and support ticket domain
- Researched refund workflows and support ticket systems

### `50361a7` — docs: create phase plan with 4 plans in 2 waves
- Wave 1: Refund backend + Support ticket system + Admin refund UI
- Wave 2: User refund UI + Help support tab redesign

### `45b0994` — feat: add RefundRequest model and user-facing refund endpoints
- **New Model:** `RefundRequest` — status workflow (pending → approved → processing → processed/failed), evidence uploads, admin response
- **New Endpoints:** `POST /api/refunds` (create request), `GET /api/refunds` (list own requests), `GET /api/refunds/:id` (details)
- **Validation:** Cumulative refund amount cannot exceed original payment, only `captured` payments eligible

### `073f916` — feat: add admin refund management and webhook handlers
- **Admin endpoints:** `GET /api/admin/refunds` (list all), `POST /api/admin/refunds/:id/approve` (triggers Razorpay refund), `POST /api/admin/refunds/:id/reject`
- **Webhook handling:** Razorpay refund webhook updates refund status automatically
- **Notifications:** Email + push + in-app notifications on approval/rejection

### `a1cbb4c` — feat: implement support ticket system with user endpoints
- **New Model:** `SupportTicket` — auto-generated ticket numbers (TKT-xxx), categories (booking/payment/refund/technical/account/other), priorities (low/medium/high/urgent), status workflow (open → in_progress → resolved → closed), message threads
- **User endpoints:** `POST /api/support/tickets` (create), `GET /api/support/tickets` (list own), `GET /api/support/tickets/:id` (details), `POST /api/support/tickets/:id/messages` (add message)

### `c3952be` — feat: add AdminRefunds page component
- New admin page for refund request management with filtering by status, date range, search

### `20c2a5c` — feat: mount AdminRefunds route in admin panel
- Connected AdminRefunds page to admin routing

### `8f89b40` — feat: implement admin support ticket management and email notifications
- **Admin endpoints:** `GET /api/admin/support/tickets` (all tickets with filters), `POST /api/admin/support/tickets/:id/respond`, `PATCH /api/admin/support/tickets/:id/status`
- **Email notifications:** Users receive email when admin responds to their ticket
- **Stats:** Ticket counts by status, category, priority

### `01220ce` — feat: add admin support ticket management page
- Frontend admin UI for support ticket management — list, filter, respond, update status, internal notes

### `fb1926d` — feat: add refund request UI in OrderHistoryTab
- **What:** Customers can now request refunds directly from their order history
- **Where:** `OrderHistoryTab.jsx` — added "Request Refund" button on eligible bookings
- **Flow:** Click → modal with reason + evidence upload → submit → see refund status in order details

### `8683e55` — feat: redesign help support tab with category quick-pick and ticket tracking
- **What:** Complete redesign of the help/support tab for both artisans and users
- **Changes:**
  - Category quick-pick buttons (instead of dropdown)
  - Priority selection
  - Ticket tracking with status badges
  - Message thread view
  - Better empty states

### `a955ada` — docs(phase-02): complete phase execution and verification
- Phase 02 completed and verified

---

## 2026-02-13 — UI/Layout Fixes

### `5c21c9e` — fix: resolve UI/layout issues in artisan pages and search
- Fix dark mode contrast on artisan account page tabs (added `dark:text-gray-300`)
- Fix service modal overflow on tablets (added `overflow-y-auto`, responsive grid)
- Fix header location dropdown self-closing (added `stopPropagation`)
- Add geolocation "Use my location" button to search advanced filters
- **Files:** `Header.jsx`, `ServicesTab.jsx`, `AdvancedFilters.jsx`, `ArtisanAccountPage.jsx`

### `4fb616e` — fix: use React Router navigation for artisan profile link
- **Problem:** Artisan profile link in header used `globalThis.location.href` which caused full page reload and auth state race conditions
- **Fix:** Replaced with `useNavigate()` from React Router
- **Files:** `Header.jsx`

### `c1de327` — refactor: improve search results styling and debug status
- Added StarRating component for artisan ratings in search results
- Improved SearchResults responsive design with hover effects and transitions
- Optimized card layout and spacing
- Updated searchController for better results
- **Files:** `SearchResults.jsx` (+130 lines rewrite), `searchController.js`, `BookmarksTab.jsx`, `UserProfilePage.jsx`

### `6d83487` — fix: handle LogRocket React version incompatibility
- **Problem:** LogRocket React wrapper (6.0.3) incompatible with React 19 — threw errors on init
- **Fix:** Wrapped `setupLogRocketReact` in try-catch. Core LogRocket continues working if React wrapper fails
- **Files:** `logrocket.js`

---

## Summary: What V2 Has Shipped So Far

### Phase 01 — Critical Bug Fixes
| Change | Type | Impact |
|--------|------|--------|
| MongoDB transaction for booking creation | Bug fix | Prevents double-booking race condition |
| File upload validation (multer) | Security | Prevents malicious file uploads |
| NotificationContext infinite loop fix | Bug fix | Stops excessive API calls |
| Auth rate limiting tightened | Security | Prevents brute force attacks |
| Empty catch blocks → Sentry reporting | Bug fix | No more silent error swallowing |

### Phase 02 — Refund & Support System
| Change | Type | Impact |
|--------|------|--------|
| RefundRequest model + user endpoints | Feature | Customers can request refunds |
| Admin refund management + Razorpay integration | Feature | Admins approve/reject, auto-process via Razorpay |
| SupportTicket model + user endpoints | Feature | Users create and track support tickets |
| Admin support ticket management | Feature | Admins respond, update status, internal notes |
| Refund request UI in OrderHistoryTab | Feature | User-facing refund request flow |
| Help/Support tab redesign | Feature | Category quick-pick, ticket tracking |

### UI/UX Fixes
| Change | Type | Impact |
|--------|------|--------|
| Dark mode tab contrast | UI fix | Readable text in dark mode |
| Service modal overflow | UI fix | No more content cut-off on tablets |
| Location dropdown self-closing | UI fix | Dropdown stays open when interacted with |
| Geolocation in search filters | Enhancement | "Use my location" button in search |
| React Router for profile navigation | Bug fix | No full page reload on navigation |
| Search results styling overhaul | Enhancement | Better card design, star ratings, hover effects |
| LogRocket React 19 compatibility | Compatibility | No more console errors |

### Foundation (Feb 10 mega-commit)
| Change | Type | Impact |
|--------|------|--------|
| UI Component Library (11 components) | Architecture | Reusable Button, Card, Modal, etc. |
| Artisan Dashboard + Customer List | Feature | Earnings, stats, client management |
| Tailwind design tokens | Architecture | Consistent colors, fonts, spacing |
| 21 antigravity fix guides | Documentation | Step-by-step improvement guides |
| Database documentation | Documentation | Schema docs, ER diagram |
| Booking lifecycle improvements | Enhancement | Accept/reject/complete flows |
| Payment flow improvements | Enhancement | Razorpay webhook idempotency |
| Auth flow improvements | Enhancement | Better error handling, lockout |

---

*Updated: 2026-02-16*
