# Architecture

**Analysis Date:** 2026-02-12

## Pattern Overview

**Overall:** Dual-User Marketplace with Separate Auth Flows + Monolithic Backend + Context-Based Frontend State

**Key Characteristics:**
- Two distinct user types (Artisan and User/Customer) with parallel authentication systems
- Express.js monolithic backend serving multiple feature domains via route-based organization
- React frontend with Context API for state management (AuthContext, ChatContext, NotificationContext)
- REST API with JWT stored in HTTP-only cookies for both user types
- Integrated third-party services for chat, video, payments, and analytics

## Layers

**Authentication Layer:**
- Purpose: Separate auth flows for artisans and customers, with admin authentication
- Location:
  - Backend: `kalasetu-backend/middleware/authMiddleware.js`, `kalasetu-backend/middleware/userProtectMiddleware.js`
  - Backend: `kalasetu-backend/routes/authRoutes.js` (artisan auth), `kalasetu-backend/routes/userAuthRoutes.js` (customer auth)
  - Backend: `kalasetu-backend/routes/adminRoutes.js` (admin endpoints)
  - Frontend: `kalasetu-frontend/src/context/AuthContext.jsx`
- Contains:
  - `protect` middleware - validates artisan JWT tokens
  - `userProtect` middleware - validates customer JWT tokens
  - `protectAny` middleware - authenticates either type and sets `req.accountType`
  - `protectAdmin` middleware - validates admin token
- Depends on:
  - `jsonwebtoken` for JWT verification
  - Artisan and User models for database lookups
  - Cookie parser for HTTP-only JWT extraction
- Used by: All protected routes requiring user context

**Controller Layer:**
- Purpose: Business logic for request handling, organized by domain
- Location: `kalasetu-backend/controllers/`
- Contains: 23+ controllers (authController, artisanController, userAuthController, paymentController, bookingController, chatController, videoController, reviewController, etc.)
- Pattern: Each controller exports async functions that receive `(req, res)`, use `asyncHandler` wrapper for error handling
- Depends on: Models, external service utilities (Razorpay, Stream Chat, Daily.co, Cloudinary)
- Used by: Routes to execute business logic

**Route Layer:**
- Purpose: HTTP endpoint definitions and middleware composition
- Location: `kalasetu-backend/routes/`
- Contains: 22+ route files (artisanRoutes, authRoutes, userAuthRoutes, paymentRoutes, bookingRoutes, chatRoutes, etc.)
- Pattern: Express Router instances with middleware chains (protection, validation, controller)
- Depends on: Middleware and controllers
- Used by: Main `server.js` for mounting at API endpoints

**Data Layer:**
- Purpose: MongoDB schema definitions and data persistence
- Location: `kalasetu-backend/models/`
- Contains: 13 Mongoose models (artisanModel, userModel, bookingModel, paymentModel, reviewModel, etc.)
- Pattern:
  - Schemas with validation, indexes, and embedded documents
  - Mongoose pre-save hooks for password hashing (bcrypt)
  - GeoJSON location fields for geo-spatial queries
  - Related fields use references (ObjectId) or embedding based on access patterns
- Depends on: Mongoose ODM, bcryptjs for password hashing
- Used by: Controllers for CRUD operations

**Middleware Layer:**
- Purpose: Cross-cutting concerns like auth, validation, error handling, analytics
- Location: `kalasetu-backend/middleware/`
- Contains:
  - `authMiddleware.js` - protect, protectAdmin, protectAny, checkPermission
  - `userProtectMiddleware.js` - userProtect
  - `errorMiddleware.js` - centralized error handling with Zod, Mongoose, JWT support
  - `analyticsMiddleware.js` - tracks API requests via PostHog
  - `cacheMiddleware.js` - Redis caching (optional)
  - `validateRequest.js` - request validation
- Depends on: JWT, Mongoose, Zod, analytics services
- Used by: Routes as middleware chains

**Integration Layer:**
- Purpose: Third-party service initialization and utilities
- Location: `kalasetu-backend/utils/`
- Contains:
  - `sentry.js` - error tracking initialization
  - `posthog.js` - analytics event tracking
  - `streamChat.js` - Stream Chat server-side setup
  - `dailyco.js` - Daily.co video call SDK
  - `razorpay.js` - Razorpay payment initialization
  - `email.js` - Resend email service with React Email templates
  - `onesignal.js` - Push notifications
  - `algolia.js` - Search indexing
  - `redis.js` - Redis caching (optional)
  - `qstash.js` - QStash job queue
  - `firebase.js` - Firebase authentication helpers
- Depends on: External SDKs and APIs
- Used by: Controllers and server initialization

**Frontend Components Layer:**
- Purpose: UI components organized by feature and reusability
- Location: `kalasetu-frontend/src/components/`
- Contains:
  - `ui/` - Reusable design system components (Button, Card, Input, Modal, Badge, Avatar, etc.)
  - `admin/` - Admin dashboard panels and layout
  - `common/` - Common components (Header, Footer, ProfileDropdown, etc.)
  - `profile/tabs/` - Tabbed profile interfaces for artisans/users
  - `search/` - Search-related components (AdvancedFilters, etc.)
  - `Maps/` - Location/geo components (LocationPicker, ArtisanMap, NearbyArtisans)
  - `Payment/` - Payment UI (PaymentButton, PaymentHistory)
  - `reviews/` - Review components (ReviewList)
  - Feature components (ChatInterface, VideoCall, ContactForm, ImageUpload, etc.)
- Depends on: Lucide icons, React Router, Tailwind CSS, external libraries (google-maps, daily-react, stream-chat-react)
- Used by: Pages and other components

**Frontend Pages Layer:**
- Purpose: Route-mounted page components
- Location: `kalasetu-frontend/src/pages/`
- Contains:
  - Auth pages: LoginPage, RegisterPage, UserLoginPage, UserRegisterPage, ForgotPassword, VerifyEmail, PhoneOTPPage
  - Public pages: HomePage, SearchResults, ArtisanProfilePage, PaymentsPage, TermsConditions, PrivacyPolicy, etc.
  - Dashboard pages: ArtisanAccountPage, ArtisanProfileEditor, ArtisanDashboardPage, UserProfilePage
  - Communication pages: MessagesPage, VideoCallPage
  - Admin pages: AdminDashboard, AdminArtisans, AdminUsers, AdminReviews, AdminPayments, AdminBookings, AdminSettings, AdminProfile, AdminLogin
- Depends on: Components, Context hooks, React Router, API client
- Used by: React Router in App.jsx

**Frontend State Management:**
- Purpose: Global state and context for auth, messaging, notifications
- Location: `kalasetu-frontend/src/context/`
- Contains:
  - `AuthContext.jsx` - Unified auth state for both user types, bootstraps with `/api/users/me` then `/api/auth/me`
  - `ChatContext.jsx` - Stream Chat integration and channel management
  - `NotificationContext.jsx` - Push notification state
  - `ToastContext.jsx` - Toast/alert notifications
  - `ThemeContext.jsx` - Theme/dark mode state
  - `AdminAuthContext.jsx` - Admin-specific auth via `admin_token` cookie
- Depends on: API client, external service SDKs
- Used by: Components via custom hooks (useAuth, etc.)

## Data Flow

**Artisan Registration & Login Flow:**

1. User submits registration form on `/artisan/register` (RegisterPage)
2. Form submission calls `artisanRegister()` from AuthContext
3. POST `/api/auth/register` hits `authController.registerArtisan`
4. Controller validates input with Zod, hashes password, creates Artisan document
5. JWT token generated, set in HTTP-only cookie `ks_auth`
6. Response includes artisan data, AuthContext updates state to `{ user: artisanData, userType: 'artisan' }`
7. User redirected to dashboard (`/artisan/dashboard`)

**Customer Login Flow:**

1. User submits login form on `/user/login` (UserLoginPage)
2. Form calls `userLogin()` from AuthContext
3. POST `/api/users/login` hits `userAuthController.loginUser`
4. Controller validates email/phone + password, fetches User document
5. JWT token generated, set in HTTP-only cookie `ks_auth`
6. Response includes user data, AuthContext updates state to `{ user: userData, userType: 'user' }`
7. User redirected to dashboard (`/user/dashboard`)

**Bootstrap/Initial Auth Check:**

1. App mounts, AuthContextProvider initializes
2. `bootstrapAuth()` effect runs on mount
3. Tries GET `/api/users/me` (user endpoint)
4. If success: sets auth to `{ user: userData, userType: 'user' }`
5. If fails: tries GET `/api/auth/me` (artisan endpoint)
6. If success: sets auth to `{ user: artisanData, userType: 'artisan' }`
7. If both fail: auth stays null, user is logged out
8. `setLoading(false)` after all checks

**Protected Route Access:**

1. User navigates to protected route (e.g., `/artisan/dashboard`)
2. Route wrapped in `<RequireAuth role="artisan">` component
3. RequireAuth checks `useAuth()` hook - if loading, shows spinner
4. If no user or wrong role, redirects to `/login` or `/user/login`
5. If authenticated and correct role, renders protected component

**Booking Creation Flow (Artisan ↔ User Interaction):**

1. User (customer) browses artisan profile and clicks "Book"
2. Booking form submission POST `/api/bookings` (userProtect middleware)
3. `bookingController.createBooking` validates and creates Booking document with status "pending"
4. Artisan receives notification (OneSignal push, real-time via Stream Chat)
5. Artisan reviews booking in dashboard and accepts/rejects via PUT `/api/bookings/:id`
6. Payment flow triggered if accepted (Razorpay integration)
7. Upon completion, review/rating flow available to user

**Chat Message Flow:**

1. User initiates or opens existing chat channel
2. Frontend loads conversation via Stream Chat context initialization
3. New messages sent via Stream Chat React UI
4. Stream Chat backend syncs with KalaSetu via webhook (configured in QStash)
5. Optional: Backend logs conversation metadata in `callHistoryModel` for reference
6. Real-time updates via Stream Chat WebSocket to all participants

**Payment Processing Flow (Razorpay):**

1. User initiates payment on booking confirmation
2. Frontend fetches Razorpay order details via `paymentController.createOrder`
3. Razorpay.js initializes client-side with public key
4. User completes payment in Razorpay modal
5. Payment webhook hits `/api/payments/webhook` (verified via signature)
6. `paymentController.handleWebhook` updates Payment document and Booking status
7. Artisan notified of successful payment

**State Management:**

- **Frontend State:** All auth state in AuthContext (auth object, loading flag), component-local state for forms/UI
- **Server State:** Session-less except for JWT in HTTP-only cookie; all user state in database
- **Cache Layer:** Optional Redis (via Upstash) for frequently accessed data (artisan profiles, categories)

## Key Abstractions

**Middleware Composition:**

- Purpose: Reusable auth/validation logic
- Examples:
  - `protect` - validates artisan JWT
  - `userProtect` - validates customer JWT
  - `protectAny` - validates either, sets `req.accountType`
  - `protectAdmin` - validates admin token
  - `checkPermission(resource, action)` - role-based access control
- Pattern: Higher-order functions returning `(req, res, next) => void`

**AsyncHandler Wrapper:**

- Purpose: Eliminates try-catch boilerplate in async route handlers
- Location: `kalasetu-backend/utils/asyncHandler.js`
- Usage: `router.post('/endpoint', asyncHandler(controller.method))`
- Pattern: Wraps async function, catches rejections and passes to error middleware

**Error Handling:**

- Purpose: Centralized error response formatting
- Location: `kalasetu-backend/middleware/errorMiddleware.js`
- Handles: Zod validation errors, Mongoose validation/cast errors, JWT errors, duplicate key errors, generic errors
- Pattern: Checks error type/name and returns appropriate HTTP status + JSON response

**Zod Request Validation:**

- Purpose: Input validation at route level before controller execution
- Examples: `authRoutes` validate `registerSchema`, `loginSchema` with Zod
- Pattern: Define schema, validate `req.body` in route middleware, pass to controller
- Benefits: Type-safe validation, clear error messages, single source of truth

**Service Initialization:**

- Purpose: External service setup (Sentry, PostHog, Stream Chat, Redis, QStash, Razorpay, Email)
- Pattern: Each service has init function called in `server.js` before routes are mounted
- Benefits: Deferred initialization, graceful error handling, optional services

**API Client (Frontend):**

- Purpose: Centralized HTTP client with auth handling
- Location: `kalasetu-frontend/src/lib/axios.js`
- Features: Interceptors for auth, error handling, request/response transformation
- Used by: All pages/components via `api.get()`, `api.post()`, etc.

**Context Hooks (Frontend):**

- Purpose: Simplified access to context state
- Examples: `useAuth()`, `useChat()`, `useNotification()`
- Pattern: Custom hooks that extract context and throw error if used outside provider
- Benefits: Type safety, early error detection, component decoupling

## Entry Points

**Backend Server Entry:**

- Location: `kalasetu-backend/server.js`
- Triggers: Node process startup via `npm run dev` (nodemon) or `npm start`
- Responsibilities:
  - Load environment variables via dotenv
  - Validate required env vars via `validateEnv()`
  - Connect to MongoDB via `connectDB()`
  - Initialize Sentry, PostHog, Stream Chat, Redis, QStash, Razorpay, Email services
  - Set up middleware (Helmet, HPP, CORS, rate limiting, cookie parser, JSON parsing)
  - Mount 22+ route groups under `/api`
  - Start HTTP server on PORT (default 5000)
  - Handle graceful shutdown (SIGTERM, SIGINT)

**Frontend App Entry:**

- Location: `kalasetu-frontend/src/main.jsx`
- Triggers: Vite dev server startup via `npm run dev`
- Responsibilities:
  - Initialize Sentry error tracking
  - Initialize LogRocket session replay
  - Initialize PostHog analytics
  - Initialize OneSignal push notifications
  - Create React root and render App component wrapped in providers:
    - BrowserRouter (React Router v7)
    - ThemeProvider
    - ToastProvider
    - AuthContextProvider (app-wide auth state)
    - ChatProvider (Stream Chat context)
    - NotificationProvider (push notifications)
    - HelmetProvider (SEO meta tags)
    - Sentry.ErrorBoundary (error tracking)

**Frontend App Router:**

- Location: `kalasetu-frontend/src/App.jsx`
- Responsibilities:
  - Define all routes via React Router v7 Routes/Route
  - Mount Layout wrapper for header/footer/nav
  - Define public routes (/, search, profile pages, policy pages)
  - Define protected routes via RequireAuth component (artisan/user/admin)
  - Lazy-load pages for code splitting
  - Suspense fallback for loading state
  - Admin routes via AdminLayout

## Error Handling

**Strategy:** Centralized error middleware with type-specific handling + try-catch in async handlers

**Patterns:**

- **Backend Route Handler:** Wrap async controller in `asyncHandler()` which catches rejections
- **Backend Controller:** Set `res.statusCode` then throw error; let middleware handle response
- **Error Middleware:** Check error type (Zod, Mongoose, JWT, etc.) and return formatted JSON with status code
- **Frontend API Call:** Wrapped in try-catch, error caught in component or context
- **Frontend Component:** Error Boundary wraps app, Sentry captures unhandled errors
- **Async/Await:** Backend controllers use async/await with implicit error propagation to middleware

**Examples:**

```javascript
// Backend: Controller throws error for middleware
export const loginArtisan = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const artisan = await Artisan.findOne({ email });
  if (!artisan) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  // ... rest of logic
});

// Middleware catches and formats
export const errorHandler = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  // ... other error types
};

// Frontend: Context catches and clears state
const userLogin = async (inputs) => {
  try {
    const res = await api.post("/api/users/login", inputs);
    setAuth({ user: res.data, userType: 'user' });
  } catch (error) {
    setAuth(initialAuthState);
    throw error; // Re-throw for component to handle
  }
};
```

## Cross-Cutting Concerns

**Logging:**

- Backend: Morgan HTTP request logger (dev mode only), console.log for application events
- Frontend: Sentry, LogRocket, PostHog for user sessions and errors
- Backend services initialize own logging (Sentry, PostHog)

**Validation:**

- Backend: Zod schemas in routes before controller execution
- Frontend: HTML5 form validation + client-side checks in components
- Database: Mongoose schema validation on save

**Authentication:**

- Backend: JWT in HTTP-only cookie, verified in middleware before route execution
- Frontend: Token fetched from cookie (auto-sent by browser), AuthContext maintains user state
- Admin: Separate `admin_token` cookie with different validation flow

**Authorization:**

- Backend: `checkPermission(resource, action)` middleware checks `req.user.permissions` object
- Frontend: RequireAuth component checks `auth.userType` and route's `role` prop
- Admin: protectAdmin middleware checks `decoded.role === 'admin'`

**Analytics & Monitoring:**

- Error Tracking: Sentry (backend + frontend)
- Session Replay: LogRocket (frontend)
- Event Analytics: PostHog (backend + frontend)
- Request Tracking: Morgan (backend HTTP logs) + analyticsMiddleware (PostHog events)
- Push Notifications: OneSignal event tracking

---

*Architecture analysis: 2026-02-12*
