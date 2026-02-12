# Codebase Structure

**Analysis Date:** 2026-02-12

## Directory Layout

```
kalasetu-project/
├── kalasetu-backend/          # Node.js/Express API server
│   ├── config/                # Configuration files (db.js, env.config.js)
│   ├── controllers/           # Business logic handlers (23+ files)
│   ├── middleware/            # Auth, validation, error handling
│   ├── models/                # Mongoose schemas (13 files)
│   ├── routes/                # Express route definitions (22+ files)
│   ├── utils/                 # Service initialization and helpers
│   ├── jobs/                  # Background job definitions
│   ├── scripts/               # One-off CLI scripts (seed, cleanup, admin creation)
│   ├── docs/                  # API documentation
│   ├── server.js              # Express app entry point
│   ├── package.json           # Dependencies (Node.js 18+, ES modules)
│   └── node_modules/          # Dependencies (git-ignored)
│
├── kalasetu-frontend/         # React 19 + Vite frontend
│   ├── src/
│   │   ├── assets/            # Static images, icons
│   │   ├── components/        # React components by feature
│   │   │   ├── admin/         # Admin dashboard components
│   │   │   ├── common/        # Header, Footer, shared components
│   │   │   ├── profile/       # Profile tabs and cards
│   │   │   │   └── tabs/      # Individual profile tabs
│   │   │   ├── search/        # Search filters and results
│   │   │   ├── Maps/          # Location and map components
│   │   │   ├── Payment/       # Payment UI components
│   │   │   ├── reviews/       # Review components
│   │   │   ├── ui/            # Design system (Button, Card, Input, Modal, etc.)
│   │   │   └── [feature].jsx  # Feature-specific components
│   │   ├── context/           # React Context providers (Auth, Chat, Notification, Theme)
│   │   ├── pages/             # Page-level components (mounted by router)
│   │   │   ├── admin/         # Admin panel pages
│   │   │   ├── dashboard/     # User/artisan dashboards
│   │   │   │   ├── artisan/   # Artisan dashboard pages
│   │   │   │   └── user/      # User dashboard pages
│   │   │   └── [feature].jsx  # Feature pages
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Client libraries and utilities
│   │   │   ├── api/           # API client and helpers
│   │   │   ├── sentry.js      # Error tracking setup
│   │   │   ├── posthog.js     # Analytics setup
│   │   │   ├── logrocket.js   # Session replay setup
│   │   │   ├── onesignal.js   # Push notifications setup
│   │   │   └── [service].js   # Third-party service integrations
│   │   ├── data/              # Static data, constants, enums
│   │   ├── config/            # Frontend configuration
│   │   ├── i18n/              # Internationalization (i18next)
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main App component with routes
│   │   ├── main.jsx           # React entry point (Vite)
│   │   └── index.css          # Global Tailwind styles
│   ├── public/                # Static assets served as-is
│   │   ├── icons/             # Icon files
│   │   └── [manifest/service-worker] # PWA files
│   ├── vite.config.js         # Vite bundler config
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── .eslintrc.js           # ESLint rules
│   ├── package.json           # Dependencies (React 19, Vite, Tailwind)
│   ├── node_modules/          # Dependencies (git-ignored)
│   └── dist/                  # Production build output (git-ignored)
│
├── .planning/                 # GSD planning documents
│   └── codebase/              # Codebase analysis documents (THIS DIRECTORY)
│       ├── ARCHITECTURE.md    # Architecture and layers
│       ├── STRUCTURE.md       # Directory layout and naming
│       ├── STACK.md           # Tech stack and versions
│       ├── INTEGRATIONS.md    # External services
│       ├── CONVENTIONS.md     # Code style and patterns
│       ├── TESTING.md         # Testing approach
│       └── CONCERNS.md        # Technical debt and issues
│
├── .github/
│   └── workflows/             # GitHub Actions CI/CD
│       └── ci.yml             # Test and lint workflow
│
├── docs/                      # Project documentation
├── CLAUDE.md                  # Claude Code project instructions
└── [config files]             # .gitignore, README, etc.
```

## Directory Purposes

**kalasetu-backend/**

Purpose: RESTful API server handling authentication, bookings, payments, messaging, video calls, admin management

Contains: Node.js/Express application with 13 MongoDB models, 23+ controllers, 22+ route files, middleware stack, utility integrations

Key files:
- `server.js` - Express app initialization and middleware setup
- `config/db.js` - MongoDB connection
- `config/env.config.js` - Environment variable schema and defaults
- `middleware/authMiddleware.js` - Authentication middleware (protect, protectAny, protectAdmin)
- `middleware/errorMiddleware.js` - Centralized error handling
- `utils/asyncHandler.js` - Async error wrapper
- `utils/sentry.js`, `posthog.js`, `streamChat.js`, `razorpay.js` - Service initializations

**kalasetu-frontend/src/**

Purpose: React application with pages, components, state management, API client, integrations

Contains: Pages (26+ route-mounted components), components (50+ feature/UI components), context providers, custom hooks, utility libraries

Key files:
- `main.jsx` - Entry point, initializes providers and Sentry/PostHog/LogRocket/OneSignal
- `App.jsx` - React Router v7 route definitions
- `context/AuthContext.jsx` - Unified auth state for artisans and users
- `context/ChatContext.jsx` - Stream Chat integration
- `context/NotificationContext.jsx` - Push notification state
- `lib/axios.js` - HTTP client with auth interceptor
- `components/Layout.jsx` - Header, footer, navigation wrapper

**kalasetu-backend/config/**

Purpose: Centralized configuration

Contains:
- `db.js` - MongoDB connection with Mongoose
- `env.config.js` - Validated environment variables and server config

**kalasetu-backend/controllers/**

Purpose: Business logic isolated from routing

Contains: 23 controller files handling domain logic:
- `authController.js` - Artisan registration, login, logout, profile updates
- `userAuthController.js` - Customer registration, login, logout
- `adminAuthController.js` - Admin login and profile
- `artisanController.js`, `artisanProfileController.js` - Artisan profile CRUD
- `bookingController.js` - Booking creation, status updates
- `paymentController.js` - Razorpay order creation, webhook handling
- `chatController.js` - Stream Chat channel and message management
- `videoController.js` - Daily.co video room setup
- `reviewController.js` - Review creation, listing
- `searchController.js` - Algolia and manual search
- `adminDashboardController.js` - Analytics and admin stats
- `seoController.js` - Sitemap, meta tags
- And 10+ more...

**kalasetu-backend/models/**

Purpose: MongoDB schemas and data validation

Contains: 13 Mongoose models:
- `artisanModel.js` - Artisan profile with services, certifications, working hours
- `userModel.js` - Customer account with bookmarks
- `bookingModel.js` - Service bookings with status workflow
- `paymentModel.js` - Payment records with Razorpay order IDs
- `reviewModel.js` - Reviews linking user to artisan
- `categoryModel.js` - Service categories
- `notificationModel.js` - Notification log
- `adminModel.js` - Admin accounts with permissions
- And 5+ more (availability, portfolio, OTP, service, call history, project)

**kalasetu-backend/routes/**

Purpose: HTTP endpoint definitions with middleware composition

Contains: 22+ route files, each mounting to an API path:
- `/api/auth` → `authRoutes.js` (artisan auth)
- `/api/users` → `userAuthRoutes.js` (customer auth)
- `/api/artisans` → `artisanRoutes.js` (public artisan profiles)
- `/api/artisan` → `artisanProfileRoutes.js` (authenticated artisan management)
- `/api/bookings` → `bookingRoutes.js`
- `/api/payments` → `paymentRoutes.js`
- `/api/chat` → `chatRoutes.js`
- `/api/admin` → `adminRoutes.js`
- And 14+ more...

Pattern: Each route file:
```javascript
const router = express.Router();
router.post('/endpoint', middleware1, middleware2, asyncHandler(controller.method));
export default router;
```

**kalasetu-backend/middleware/**

Purpose: Cross-cutting concerns (auth, validation, errors, analytics)

Contains:
- `authMiddleware.js` - protect, protectAny, protectAdmin, checkPermission
- `userProtectMiddleware.js` - userProtect for customer-only routes
- `errorMiddleware.js` - Centralized error handler with type-specific logic
- `analyticsMiddleware.js` - PostHog event tracking
- `cacheMiddleware.js` - Redis caching (optional)
- `validateRequest.js` - Zod request validation helper

**kalasetu-backend/utils/**

Purpose: Utility functions and service initializations

Contains: 20+ files:
- `asyncHandler.js` - Wraps async route handlers for error catching
- `validateEnv.js` - Environment variable validation on startup
- `generateToken.js` - JWT token creation
- `sentry.js` - Sentry error tracking init and helpers
- `posthog.js` - PostHog analytics init
- `email.js` - Resend email with React Email templates
- `streamChat.js` - Stream Chat SDK init
- `razorpay.js` - Razorpay client init
- `onesignal.js` - OneSignal push notifications init
- `algolia.js` - Algolia search indexing
- `dailyco.js` - Daily.co video call helpers
- `redis.js` - Upstash Redis init (optional)
- `qstash.js` - QStash job queue init
- `recaptcha.js` - reCAPTCHA verification
- `otp.js` - OTP generation/validation
- `jobQueue.js` - Job scheduling
- And 5+ more...

**kalasetu-backend/scripts/**

Purpose: One-off CLI utilities for data management

Contains:
- `seedCoreData.js` - Populate demo categories and accounts
- `createAdmin.js` - Create admin account
- `cleanupProfiles.js` - Remove non-demo artisans (with --dry-run flag)
- `wipeAllAccounts.js` - Full data reset
- `checkArtisans.js` - Verify artisan data
- And 2+ more...

Run via: `npm run seed:core`, `npm run create:admin`, `npm run cleanup`, etc.

**kalasetu-frontend/src/components/ui/**

Purpose: Design system components following Tailwind + brand color scheme

Contains: 10 reusable components:
- `Button.jsx` - Primary, secondary, variants
- `Card.jsx` - Container with shadow and padding
- `Input.jsx` - Text input with label and error state
- `Modal.jsx` - Dialog overlay
- `Badge.jsx` - Tag/status indicator
- `Avatar.jsx` - User profile image
- `Skeleton.jsx` - Loading placeholder
- `Alert.jsx` - Info/warning/error messages
- `EmptyState.jsx` - No data state
- `LoadingState.jsx` - Spinner container
- `Spinner.jsx` - Loading indicator

All use Tailwind CSS with brand color tokens: `brand-50` through `brand-900` (base: `#A55233`)

**kalasetu-frontend/src/components/profile/tabs/**

Purpose: Tabbed profile interface for artisans and users

Contains: Individual tab components mounted in profile pages:
- `ProfileTab.jsx` - Basic info, location, bio
- `ServicesTab.jsx` - Service offerings and pricing
- `PortfolioTab.jsx` - Image gallery
- `ReviewsTab.jsx` - Customer reviews and ratings
- `BookingsTab.jsx` - Booking history and status
- `EarningsTab.jsx` - Revenue and payment history (artisan only)
- `MyClientsTab.jsx` - Customer list (artisan only, replaces orphaned USERsTab)
- `DashboardOverviewTab.jsx` - Stats and summary
- `AppearanceTab.jsx` - Settings and preferences
- `RatingsTab.jsx` - Rating breakdown
- `PreferencesTab.jsx` - Settings
- `HelpSupportTab.jsx` - Support and FAQs
- `OrderHistoryTab.jsx` - Past bookings (user only)
- `BookmarksTab.jsx` - Saved artisans (user only)

**kalasetu-frontend/src/components/admin/**

Purpose: Admin panel UI components

Contains: Panels for admin dashboard - artisan management, user management, payments, bookings, reviews, settings, profile

**kalasetu-frontend/src/pages/**

Purpose: Route-mounted page components

Contains: 26+ page files:
- Auth: `LoginPage.jsx`, `RegisterPage.jsx`, `UserLoginPage.jsx`, `UserRegisterPage.jsx`, `ForgotPassword.jsx`, `VerifyEmail.jsx`, `PhoneOTPPage.jsx`
- Public: `HomePage.jsx`, `SearchResults.jsx`, `ArtisanProfilePage.jsx`, `PaymentsPage.jsx`
- Policy: `PrivacyPolicy.jsx`, `TermsConditions.jsx`, `ShippingPolicy.jsx`, `CancellationRefund.jsx`
- Artisan Dashboard: `ArtisanAccountPage.jsx`, `ArtisanProfileEditor.jsx`, `ArtisanDashboardPage.jsx`
- User: `UserProfilePage.jsx`, `UserDashboard.jsx` (in `dashboard/user/`)
- Messaging: `MessagesPage.jsx`
- Video: `VideoCallPage.jsx`, `dashboard/artisan/CallsHistory.jsx`
- Admin: `admin/AdminLogin.jsx`, `admin/AdminDashboard.jsx`, `admin/AdminArtisans.jsx`, `admin/AdminUsers.jsx`, `admin/AdminReviews.jsx`, `admin/AdminPayments.jsx`, `admin/AdminBookings.jsx`, `admin/AdminSettings.jsx`, `admin/AdminProfile.jsx`
- Auth Selectors: `AuthSelector.jsx`, `RegisterSelector.jsx`

**kalasetu-frontend/src/context/**

Purpose: Global state management via React Context API

Contains: 5 context providers:
- `AuthContext.jsx` - User auth state (artisan, customer, or logged out), login/register/logout functions, bootstrap on app load
- `ChatContext.jsx` - Stream Chat integration, channel list, selected channel, unread count
- `NotificationContext.jsx` - Push notification state and listeners
- `ToastContext.jsx` - Toast notifications (info, success, error)
- `ThemeContext.jsx` - Dark/light mode
- `AdminAuthContext.jsx` - Admin auth via `admin_token` cookie

**kalasetu-frontend/src/lib/**

Purpose: Client-side service initialization and utilities

Contains:
- `axios.js` - HTTP client with request/response interceptors, auth handling
- `sentry.js` - Sentry error tracking setup
- `posthog.js` - PostHog analytics setup
- `logrocket.js` - LogRocket session replay setup
- `onesignal.js` - OneSignal push notifications setup
- `algolia.js` - Algolia InstantSearch client
- `googleMaps.js` - Google Maps API initialization
- `dailyco.js` - Daily.co video call setup
- `firebase.js` - Firebase authentication helpers
- `streamChat.js` - Stream Chat client initialization
- And more...

**kalasetu-frontend/src/hooks/**

Purpose: Custom React hooks for reusable logic

Contains: Hooks for API calls, form handling, auth state, notifications, etc.

## Key File Locations

**Entry Points:**

- Backend: `kalasetu-backend/server.js` - Express app starts here
- Frontend: `kalasetu-frontend/src/main.jsx` - Vite entry, initializes React
- Frontend Routes: `kalasetu-frontend/src/App.jsx` - React Router v7 route definitions

**Configuration:**

- Backend env: `kalasetu-backend/config/env.config.js` - Validated config schema
- Backend db: `kalasetu-backend/config/db.js` - MongoDB connection
- Frontend vite: `kalasetu-frontend/vite.config.js` - Vite bundler setup
- Frontend tailwind: `kalasetu-frontend/tailwind.config.js` - Tailwind CSS config, brand colors defined here
- Frontend eslint: `kalasetu-frontend/.eslintrc.js` - Linting rules

**Core Logic:**

- Artisan auth: `kalasetu-backend/controllers/authController.js`
- Customer auth: `kalasetu-backend/controllers/userAuthController.js`
- Bookings: `kalasetu-backend/controllers/bookingController.js`
- Payments: `kalasetu-backend/controllers/paymentController.js`
- Frontend auth: `kalasetu-frontend/src/context/AuthContext.jsx`
- Frontend api: `kalasetu-frontend/src/lib/axios.js`

**Testing:**

- Backend: No test framework configured (CI checks exist but pass)
- Frontend: ESLint linting via `npm run lint` in CI

**Authentication:**

- Artisan routes: Protected by `protect` middleware
- Customer routes: Protected by `userProtect` middleware
- Admin routes: Protected by `protectAdmin` middleware
- Frontend auth: `RequireAuth` component wraps protected pages, checks `useAuth()` hook

## Naming Conventions

**Files:**

- `.js` / `.jsx` - JavaScript (backend ES modules, frontend React)
- `*Controller.js` - Business logic handlers, export functions like `method: async (req, res) => {}`
- `*Model.js` - Mongoose schemas, export a mongoose.model
- `*Routes.js` - Express Router instances, export a router
- `*Middleware.js` - Express middleware functions
- `*Context.jsx` - React Context providers
- `*Page.jsx` - Route-mounted page components in `pages/`
- `*Tab.jsx` - Profile tab components in `components/profile/tabs/`
- `*Modal.jsx` - Modal/dialog components
- `*.test.js` / `*.spec.js` - Test files (not yet implemented)

**Directories:**

- `controllers/` - Business logic
- `models/` - Database schemas
- `routes/` - HTTP routes
- `middleware/` - Request processing
- `utils/` - Utilities and service init
- `scripts/` - CLI utilities
- `components/[feature]/` - Feature-specific components
- `pages/` - Route pages
- `context/` - React Context providers
- `lib/` - Client libraries and utilities
- `hooks/` - Custom React hooks

**Functions:**

- Async handlers: `camelCase` (e.g., `loginArtisan`, `createBooking`)
- Middleware: `camelCase` (e.g., `protect`, `userProtect`, `errorHandler`)
- React components: `PascalCase` (e.g., `LoginPage`, `ProfileTab`, `Button`)
- Custom hooks: `camelCase` starting with `use` (e.g., `useAuth`, `useBooking`)
- Utility functions: `camelCase` (e.g., `validateEnv`, `generateToken`, `asyncHandler`)

**Variables:**

- Constants: `UPPER_SNAKE_CASE` (e.g., `COOKIE_NAME`, `API_ENDPOINTS`)
- State variables: `camelCase` (e.g., `user`, `isLoading`, `errorMessage`)
- Database collections: `camelCase` singular (e.g., `artisan`, `user`, `booking`, `payment`)
- React props: `camelCase` (e.g., `isLoading`, `onSubmit`, `userId`)

**Mongoose Schemas:**

- Field names: `camelCase` (e.g., `fullName`, `profileImageUrl`, `workingHours`)
- Indexes: Implicit via `index: true` on high-cardinality fields
- Sparse fields: `sparse: true` for nullable unique fields (e.g., email, phone)
- Nested documents: `{ _id: false }` to prevent unwanted sub-IDs
- References: Use `ref` for relationships (e.g., `bookmarks: [{ type: ObjectId, ref: 'Artisan' }]`)

## Where to Add New Code

**New Feature:**

1. **Backend API:**
   - Model: `kalasetu-backend/models/[feature]Model.js` (if new data type)
   - Controller: `kalasetu-backend/controllers/[feature]Controller.js`
   - Routes: `kalasetu-backend/routes/[feature]Routes.js`
   - Mount in: `kalasetu-backend/server.js` (add `app.use('/api/[feature]', [feature]Routes)`)
   - Middleware: `kalasetu-backend/middleware/[feature]Middleware.js` (if custom auth/validation)

2. **Frontend Pages:**
   - Page component: `kalasetu-frontend/src/pages/[Feature]Page.jsx`
   - Route: Add to `kalasetu-frontend/src/App.jsx` Routes
   - If protected: Wrap with `<RequireAuth role="artisan">`

3. **Frontend Components:**
   - Reusable: `kalasetu-frontend/src/components/[feature]/[Component].jsx`
   - Design system: `kalasetu-frontend/src/components/ui/[Component].jsx`
   - Page-specific: Within page component itself

4. **Frontend State:**
   - Global: New Context in `kalasetu-frontend/src/context/[Feature]Context.jsx`, add provider to `main.jsx`
   - Local: Component useState
   - API data: Fetch via `kalasetu-frontend/src/lib/axios.js`

**New Component/Module:**

- Reusable component: `kalasetu-frontend/src/components/[feature]/[Component].jsx`
- Export from parent folder's `index.js` if building a package
- Use component composition: smaller components combine into feature components

**Utilities:**

- Shared helpers: `kalasetu-backend/utils/[helper].js` or `kalasetu-frontend/src/utils/[helper].js`
- Service init: Add to `kalasetu-backend/utils/[service].js` and initialize in `server.js`
- Frontend service: Add to `kalasetu-frontend/src/lib/[service].js` and init in `main.jsx`

**Middleware/Validation:**

- Auth: Add to `kalasetu-backend/middleware/authMiddleware.js` or create `kalasetu-backend/middleware/[custom]Middleware.js`
- Request validation: Use Zod schema in route file or separate file, validate before controller
- Error handling: Extends `kalasetu-backend/middleware/errorMiddleware.js`

## Special Directories

**kalasetu-backend/scripts/**

Purpose: One-off data management scripts
Generated: No (hand-written utilities)
Committed: Yes
Run: Via npm scripts (e.g., `npm run seed:core`, `npm run cleanup`)

**kalasetu-backend/jobs/**

Purpose: Background job definitions for QStash
Generated: No
Committed: Yes
Contains: Job handlers executed by QStash webhooks

**kalasetu-frontend/src/i18n/**

Purpose: Internationalization (i18next) setup
Generated: No
Committed: Yes
Contains: i18n configuration and language files

**kalasetu-frontend/dist/**

Purpose: Production build output
Generated: Yes (via `npm run build`)
Committed: No (git-ignored)
Contains: Minified bundle, optimized assets

**kalasetu-backend/docs/**

Purpose: API documentation and guidelines
Generated: No
Committed: Yes
Contains: Endpoint specs, data models, integration guides

**kalasetu-frontend/public/**

Purpose: Static assets served as-is by Vite
Generated: No
Committed: Yes
Contains: Favicon, manifest.json, icons, service worker

**node_modules/**

Purpose: Installed dependencies
Generated: Yes (via `npm install`)
Committed: No (git-ignored)
Install: `npm install` in both directories

**.env files**

Purpose: Environment variables (secrets, API keys, URLs)
Generated: No (developers must create)
Committed: No (git-ignored, .env.example provided)
Note: Never read or commit .env contents

---

*Structure analysis: 2026-02-12*
