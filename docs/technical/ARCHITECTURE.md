# KalaSetu System Architecture

## 1. System Overview

KalaSetu is a full-stack artisan marketplace built on a React single-page application frontend served via Vite, communicating with a Node.js/Express REST API backend backed by MongoDB. The platform supports the complete marketplace lifecycle -- artisan discovery via Algolia search, real-time messaging through Stream Chat, video consultations via Daily.co, service bookings, Razorpay payment processing, reviews, and push notifications -- deployed on Render (backend) and Vercel (frontend).

---

## 2. Architecture Diagram

```
+---------------------------------------------------------------------+
|                           BROWSER (Client)                          |
|  React 18 + Vite | React Router v7 | Tailwind CSS | PWA            |
|  Algolia InstantSearch | Stream Chat SDK | Daily.co SDK             |
+-----------------------------------+---------------------------------+
                                    |
                              HTTPS (REST)
                                    |
+-----------------------------------v---------------------------------+
|                     EXPRESS API SERVER (Port 5000)                   |
|                                                                     |
|  Middleware Pipeline:                                               |
|  Helmet -> HPP -> Sentry -> JSON Parser -> Cookie Parser           |
|  -> Rate Limiter (300 req/15min) -> Analytics -> CORS              |
|                                                                     |
|  +---------------------+  +---------------------+  +--------------+|
|  |   Auth Middleware    |  |   Route Handlers    |  |   Error      ||
|  |   - protect         |  |   28 route files    |  |   Handling   ||
|  |   - userProtect     |  |   25 controllers    |  |   - notFound ||
|  |   - protectAny      |  |   Zod validation    |  |   - handler  ||
|  |   - protectAdmin    |  |   asyncHandler      |  |   - Sentry   ||
|  +---------------------+  +---------------------+  +--------------+|
+----------+---------------------------+------------------+-----------+
           |                           |                  |
           v                           v                  v
+----------------+   +------------------------------+   +-----------+
|   MongoDB      |   |     External Services        |   | Upstash   |
|   Atlas        |   |                              |   | Redis     |
|   15 models    |   |  Cloudinary   Algolia        |   | (Cache)   |
|                |   |  Stream Chat  Daily.co       |   +-----------+
+----------------+   |  Razorpay     OneSignal      |
                     |  Resend       Firebase Admin  |
                     |  QStash       Google Maps     |
                     |  PostHog      Sentry          |
                     |  LogRocket                    |
                     +------------------------------+
```

---

## 3. Backend Architecture

### Entry Point

`server.js` initializes all services, mounts middleware in order, registers routes, and starts the HTTP server. On startup it:

1. Loads environment variables and validates them (`validateEnv.js`)
2. Connects to MongoDB (`config/db.js`)
3. Initializes external service clients (Sentry, PostHog, Stream Chat, Redis, QStash, Razorpay, Resend)
4. Schedules recurring background jobs if enabled
5. Applies the middleware pipeline
6. Mounts 28 route groups under `/api/*`
7. Registers error handlers (Sentry, notFound, errorHandler)

### Folder Structure

```
kalasetu-backend/
├── server.js                  # Entry point, middleware chain, route mounting
├── config/
│   ├── db.js                  # MongoDB connection via Mongoose
│   ├── cloudinary.js          # Cloudinary SDK configuration
│   ├── firebaseAdmin.js       # Firebase Admin SDK initialization
│   ├── multer.js              # File upload configuration
│   └── env.config.js          # Centralized env config objects
├── controllers/               # 25 controllers by domain
├── routes/                    # 28 route files
├── models/                    # 15 Mongoose models
├── middleware/
│   ├── authMiddleware.js      # protect, protectAny, protectAdmin, checkPermission
│   ├── userProtectMiddleware.js  # userProtect (customer-only routes)
│   ├── errorMiddleware.js     # notFound + errorHandler
│   ├── cacheMiddleware.js     # Redis-backed response caching
│   ├── validateRequest.js     # Zod schema validation
│   └── analyticsMiddleware.js # PostHog event tracking
├── utils/                     # 21 utility modules (service integrations, helpers)
├── scripts/                   # Seed, cleanup, verification scripts
├── jobs/
│   └── jobHandlers.js         # QStash webhook job processors
└── docs/                      # Database documentation
```

### Middleware Pipeline (Order Matters)

```
Request
  |
  v
Helmet (security headers)
  |
  v
HPP (HTTP parameter pollution protection)
  |
  v
Morgan (request logging, dev only)
  |
  v
Sentry request + tracing handlers
  |
  v
express.json() (body parsing)
  |
  v
cookieParser() (JWT cookie extraction)
  |
  v
Rate Limiter (300 requests / 15 minutes per IP)
  |
  v
Analytics middleware (PostHog event tracking)
  |
  v
CORS (origin whitelist with wildcard suffix support)
  |
  v
Route-level auth middleware (protect / userProtect / protectAny / protectAdmin)
  |
  v
Route handler (controller logic)
  |
  v
Sentry error handler -> notFound handler -> errorHandler
```

### API Route Groups

| Group | Mount Path | Auth | Description |
|-------|-----------|------|-------------|
| **Auth** | `/api/auth` | Public | Artisan registration, login, logout |
| | `/api/users` | Public | Customer registration, login, logout |
| | `/api/admin` | `protectAdmin` | Admin auth and dashboard |
| | `/api/auth-helpers` | Public | reCAPTCHA, OTP helpers |
| | `/api/otp` | Public | OTP send and verify |
| **Artisan** | `/api/artisans` | Public | Public profiles and search |
| | `/api/artisan` | `protect` | Profile management |
| | `/api/artisan/dashboard` | `protect` | Dashboard statistics |
| | `/api/artisan/customers` | `protect` | Customer list |
| | `/api/artisan/availability` | `protect` | Availability management |
| | `/api/artisan/portfolio` | `protect` | Portfolio management |
| **Marketplace** | `/api/bookings` | `protectAny` | Booking CRUD |
| | `/api/payments` | `protectAny` | Razorpay orders and verification |
| | `/api/refunds` | `protectAny` | Refund requests |
| | `/api/reviews` | `protectAny` | Review CRUD |
| | `/api/categories` | Public | Service categories |
| | `/api/services` | `protect` | Artisan service management |
| **Communication** | `/api/chat` | `protectAny` | Stream Chat tokens and channels |
| | `/api/video` | `protectAny` | Daily.co rooms |
| | `/api/calls` | `protectAny` | Call initiation and history |
| | `/api/notifications` | `protectAny` | Push notifications |
| **Utilities** | `/api/search` | Public | Server-side search |
| | `/api/uploads` | `protect` | Cloudinary signed uploads |
| | `/api/seo` | Public | SEO metadata and sitemap |
| | `/api/contact` | Public | Contact form |
| | `/api/support` | `protectAny` | Support tickets |
| | `/api/jobs` | QStash signature | Background job webhooks |

---

## 4. Frontend Architecture

### Technology Stack

- **Framework**: React 18 (JSX, no TypeScript)
- **Build Tool**: Vite with PWA plugin
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **State Management**: React Context (primary) + Jotai (lightweight state)
- **Search**: Algolia InstantSearch React
- **Chat**: Stream Chat React SDK
- **Video**: Daily.co React SDK
- **Dev Server**: Port 5173

### State Management

| Context | Purpose |
|---------|---------|
| `AuthContext` | User/artisan authentication state and methods |
| `ChatContext` | Stream Chat client and unread counts |
| `NotificationContext` | Push notification state and permissions |

`AuthContext` maintains a unified state `{ user, userType }` where `userType` is `'artisan'`, `'user'`, or `null`. On bootstrap, it tries `/api/users/me` first, then falls back to `/api/auth/me`.

---

## 5. Authentication Flow

### Dual Auth System

```
+------------------+          +-------------------+
|   ARTISAN AUTH   |          |   CUSTOMER AUTH   |
|   /api/auth/*    |          |   /api/users/*    |
+--------+---------+          +---------+---------+
         |                              |
         v                              v
+--------+---------+          +---------+---------+
| Artisan Model    |          | User Model        |
| (artisanModel.js)|          | (userModel.js)    |
+--------+---------+          +---------+---------+
         |                              |
         +----------+    +-------------+
                    |    |
                    v    v
          +---------+----+---------+
          |  JWT Token Generation  |
          |  generateToken.js      |
          +----------+-------------+
                     |
                     v
          +----------+-------------+
          |  HTTP-Only Cookie      |
          |  Name: ks_auth         |
          |  Expires: 7 days       |
          |  Secure, SameSite      |
          +------------------------+
```

### Auth Middleware Selection

```
Request with ks_auth cookie
         |
         +--- Route needs artisan only? ---> protect
         |    (Looks up Artisan model)
         |
         +--- Route needs customer only? --> userProtect
         |    (Looks up User model)
         |
         +--- Route needs either type? ----> protectAny
         |    (Tries User first, then Artisan; sets req.accountType)
         |
         +--- Route needs admin? ----------> protectAdmin
              (Reads admin_token cookie; checks role + isActive)
```

---

## 6. Booking Data Flow

```
CUSTOMER                         BACKEND                              ARTISAN
   |                                |                                    |
   |  1. Browse artisan profile     |                                    |
   |  GET /api/artisans/:id ------->|                                    |
   |  <--- artisan + services ------|                                    |
   |                                |                                    |
   |  2. Check availability         |                                    |
   |  GET /api/artisan/             |                                    |
   |    availability/:id ---------> |                                    |
   |  <--- available slots ---------|                                    |
   |                                |                                    |
   |  3. Create booking             |                                    |
   |  POST /api/bookings ---------->|                                    |
   |    { artisanId, serviceId,     | --- Save Booking (pending)         |
   |      date, time, notes }       |                                    |
   |  <--- booking created ---------|--- Push notification ------------->|
   |                                |--- Email notification ------------>|
   |                                |                                    |
   |  4. Create payment order       |                                    |
   |  POST /api/payments/order ---->|                                    |
   |    { bookingId, amount }       |--- Razorpay: Create Order          |
   |  <--- razorpay order id ------|                                    |
   |                                |                                    |
   |  5. Complete payment           |                                    |
   |  (Razorpay checkout in browser)|                                    |
   |                                |                                    |
   |  6. Verify payment             |                                    |
   |  POST /api/payments/verify --->|                                    |
   |    { order_id, payment_id,     |--- Verify signature                |
   |      signature }               |--- Save Payment record             |
   |  <--- payment confirmed ------|--- Update Booking (confirmed)      |
   |                                |--- Notifications to both parties   |
   |                                |                                    |
   |                                |  7. Artisan completes service      |
   |                                |  (status: completed)               |
   |                                |                                    |
   |  8. Leave review               |                                    |
   |  POST /api/reviews ----------->|                                    |
   |    { bookingId, rating, text } |--- Save Review                     |
   |  <--- review created ---------|--- Update artisan rating            |
   |                                |--- Reindex in Algolia              |
```

---

## 7. External Services

| Service | Purpose | Integration Point | Required |
|---------|---------|-------------------|----------|
| MongoDB Atlas | Primary database | `config/db.js` | Yes |
| Cloudinary | Image storage and CDN | `config/cloudinary.js` | Yes |
| Algolia | Full-text search indexing | `utils/algolia.js` | Yes |
| Stream Chat | Real-time messaging | `utils/streamChat.js` | Yes |
| Daily.co | Video call rooms | `utils/dailyco.js` | Yes |
| Razorpay | Payment processing (INR) | `utils/razorpay.js` | Yes |
| OneSignal | Push notifications | `utils/onesignal.js` | Yes |
| Resend | Transactional email | `utils/email.js` | Yes |
| Firebase Admin | Social authentication | `config/firebaseAdmin.js` | Optional |
| QStash (Upstash) | Background job scheduling | `utils/qstash.js` | Yes |
| Upstash Redis | Response caching | `utils/redis.js` | Optional |
| Google Maps | Geolocation services | Environment variable | Yes |
| reCAPTCHA | Bot protection | `utils/recaptcha.js` | Yes |
| Sentry | Error tracking | `utils/sentry.js` | Optional |
| PostHog | Product analytics | `utils/posthog.js` | Optional |
| LogRocket | Session replay | Frontend SDK only | Optional |

---

## 8. Deployment

### Hosting

- **Backend**: Render (Web Service)
- **Frontend**: Vercel (Static)

### Render Configuration

- **Runtime**: Node.js (>=18 <23)
- **Build Command**: `npm install`
- **Start Command**: `npm start` (`node server.js`)
- **Port**: 5000 (Render maps to HTTPS)
- **Proxy Trust**: `trust proxy` set to `1` for correct client IP behind load balancer

### CORS

Configured via `CORS_ORIGINS` env var. Supports:
- Exact origins (e.g., `https://kalasetu-frontend-eosin.vercel.app`)
- Wildcard suffixes (e.g., `*.vercel.app` matches any Vercel preview)
- Localhost origins automatically allowed in non-production

### Graceful Shutdown

Handles `SIGTERM` and `SIGINT` to flush PostHog analytics before process exit.

---

*Last updated: 2026-02-16*
