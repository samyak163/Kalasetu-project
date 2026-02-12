# External Integrations

**Analysis Date:** 2026-02-12

## APIs & External Services

**Payment Processing:**
- Razorpay - Payment gateway for booking/artisan services
  - SDK: `razorpay` v2.9.6
  - Init: `kalasetu-backend/utils/razorpay.js`
  - Config: `RAZORPAY_CONFIG` in `config/env.config.js`
  - Auth: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

**Video Calling:**
- Daily.co - Real-time video call platform
  - SDKs: `@daily-co/daily-js` v0.85.0 (backend), `@daily-co/daily-react` v0.24.0 (frontend)
  - Backend utils: `kalasetu-backend/utils/dailyco.js`
  - Frontend: `src/lib/daily.js` (typical pattern)
  - Config: `VIDEO_CONFIG` with `apiKey` and `domain`
  - Auth: `DAILY_API_KEY`, `DAILY_DOMAIN`

**Real-Time Chat/Messaging:**
- Stream Chat - Messaging platform with presence
  - SDKs: `stream-chat` v9.25.0 (backend), `stream-chat-react` v13.10.2 (frontend UI)
  - Backend init: `kalasetu-backend/utils/streamChat.js`
  - Frontend context: `src/context/ChatContext.jsx` (typical pattern)
  - Config: `CHAT_CONFIG` with apiKey, apiSecret, appId
  - Auth: `STREAM_API_KEY`, `STREAM_API_SECRET`, `STREAM_APP_ID`

**Search & Discovery:**
- Algolia - Full-text search with InstantSearch
  - SDKs: `algoliasearch` v5.42.0, `react-instantsearch` v7.17.0 (frontend)
  - Backend init: `kalasetu-backend/utils/algolia.js`
  - Index name: `artisans` (default, configurable)
  - Config: `SEARCH_CONFIG` with appId, adminKey, searchKey
  - Auth: `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, `ALGOLIA_SEARCH_KEY`
  - Usage: Frontend search in browse/discover artisans

**Image Upload & CDN:**
- Cloudinary - Image storage and transformation
  - SDK: `cloudinary` v2.8.0
  - Used for: Artisan profiles, portfolio images, uploads
  - Config: `CLOUDINARY_CONFIG` in env.config.js
  - Auth: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - Routes: `kalasetu-backend/routes/uploadRoutes.js` provides signed upload signatures

**Maps & Geolocation:**
- Google Maps - Location services and mapping
  - SDKs: `@googlemaps/google-maps-services-js` v3.4.2 (backend), `@vis.gl/react-google-maps` v1.7.0 and `@react-google-maps/api` v2.20.7 (frontend)
  - Backend: Location radius search, geocoding
  - Frontend: Map displays, artisan location
  - Auth: `GOOGLE_MAPS_API_KEY`

## Data Storage

**Databases:**
- MongoDB
  - Connection: `MONGO_URI` (MongoDB Atlas or self-hosted)
  - Client: `mongoose` v8.19.2 (ODM - Object Document Mapper)
  - Config: `kalasetu-backend/config/db.js`
  - Connection pooling: maxPoolSize 10, minPoolSize 2
  - Models: `kalasetu-backend/models/` (typical structure for User, Artisan, Booking, etc.)

**Caching:**
- Upstash Redis (REST-based)
  - Client: `@upstash/redis` v1.35.6
  - Init: `kalasetu-backend/utils/redis.js`
  - Config: `CACHE_CONFIG` in env.config.js
  - Auth: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - TTL: `REDIS_CACHE_TTL` (default 3600 seconds)
  - Provider: `upstash` (REST API, not socket-based)

## Authentication & Identity

**Auth Provider:**
- Firebase - Cloud authentication and authorization
  - SDKs: `firebase-admin` v13.5.0 (backend), `firebase` v12.5.0 (frontend)
  - Backend init: Initialized in `kalasetu-backend/config/env.config.js`
  - Auth method: Firebase Auth tokens, JWT in HTTP-only cookies
  - Two user types with separate flows:
    - Artisans: `/api/auth/*` routes (`kalasetu-backend/routes/authRoutes.js`)
    - Users: `/api/users/*` routes (`kalasetu-backend/routes/userAuthRoutes.js`)
  - Backend middleware: `protect` (artisan auth), `userProtect` (user auth), `protectAny` (either)
  - Frontend bootstrap: `AuthContext.jsx` tries `/api/users/me` first, then `/api/auth/me`
  - Auth tokens stored as HTTP-only cookies: `ks_auth` (user/artisan), `admin_token` (admin)

**JWT Authentication:**
- Library: `jsonwebtoken` v9.0.2
- Cookie name: `ks_auth` (configurable via `COOKIE_NAME`)
- Config: `JWT_CONFIG` with secret, expiresIn (7d default), secure/sameSite flags
- Secret: `JWT_SECRET` (required)

## Monitoring & Observability

**Error Tracking:**
- Sentry - Error and exception monitoring
  - SDKs: `@sentry/node` v10.22.0 (backend), `@sentry/react` v10.22.0 (frontend)
  - Backend init: `kalasetu-backend/utils/sentry.js`
  - Config: `ERROR_TRACKING_CONFIG` (enabled by default)
  - Auth: `SENTRY_DSN`
  - Settings: `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE` (0.1 default)
  - Disabled in development (events logged instead)

**Analytics & Tracking:**
- PostHog - Product analytics
  - SDKs: `posthog-node` v5.11.0 (backend), `posthog-js` v1.284.0 (frontend)
  - Backend init: `kalasetu-backend/utils/posthog.js`
  - Config: `ANALYTICS_CONFIG` (opt-in: `POSTHOG_ENABLED=true`)
  - Auth: `POSTHOG_API_KEY`, `POSTHOG_HOST`

**Session Replay:**
- LogRocket - Session replay and debugging
  - SDKs: `logrocket` v10.1.0, `logrocket-react` v6.0.3 (frontend only)
  - Frontend init: `src/lib/logrocket.js` (typical pattern)
  - Auth: `VITE_LOGROCKET_APP_ID` (frontend only)

## Push Notifications

**Provider:**
- OneSignal - Push notification service
  - SDK: `react-onesignal` v3.4.0 (frontend)
  - Config: `PUSH_CONFIG` with provider set to `onesignal`
  - Auth: `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`
  - Frontend routes: `kalasetu-frontend/routes/notificationRoutes.js` (typical)

## Email Services

**Provider:**
- Resend - Transactional email service (primary)
  - SDKs: `resend` v6.4.0
  - Backend init: `kalasetu-backend/utils/email.js`
  - Config: `EMAIL_CONFIG` with provider `resend`
  - Auth: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`
  - Templates: Uses `react-email` v4.3.2 and `@react-email/components` v0.5.7
  - Fallback: `nodemailer` v7.0.10 (legacy option)

## Background Jobs & Task Queue

**Service:**
- QStash (Upstash) - Serverless task queue
  - SDK: `@upstash/qstash` v2.8.4
  - Backend init: `kalasetu-backend/utils/qstash.js`
  - Config: `JOBS_CONFIG` (disabled by default; enable with `JOBS_ENABLED=true`)
  - Auth: `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`
  - Webhook base: `JOBS_WEBHOOK_BASE` or `SERVER_PUBLIC_URL`
  - Jobs: Cleanup jobs, daily reports scheduled in `kalasetu-backend/utils/jobQueue.js`
  - Routes: `kalasetu-backend/routes/jobRoutes.js` for webhook receivers

## Security & Validation

**Request Validation:**
- Zod - Schema validation for request bodies
  - Library: `zod` v3.25.76
  - Used in: Route handlers for validating artisan data, bookings, payments
  - Pattern: Define schemas, validate with `.parse()` or `.safeParse()`

**Password Hashing:**
- bcryptjs - Secure password hashing
  - Library: `bcryptjs` v2.4.3
  - Routes: Auth controller hashes passwords before storage

**Rate Limiting:**
- express-rate-limit - API rate limiting
  - Library: `express-rate-limit` v7.5.1
  - Config: 15-minute window, 300 requests max per IP
  - Applied globally to `/api` routes

**Security Headers:**
- Helmet - HTTP security headers middleware
  - Library: `helmet` v7.2.0
  - Applied to all requests in `server.js`

**HTTP Parameter Pollution (HPP):**
- hpp - HPP protection
  - Library: `hpp` v0.2.3
  - Applied to all requests in `server.js`

## Webhooks & Callbacks

**Incoming:**
- Razorpay payment webhooks → `kalasetu-backend/routes/paymentRoutes.js`
- QStash job callbacks → `kalasetu-backend/routes/jobRoutes.js`

**Outgoing:**
- QStash scheduled jobs call backend webhooks for cleanup and reporting
- Stream Chat events (presence, messages) streamed via SDK

## Environment Configuration

**Required Env Vars (Backend):**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Required Env Vars (Frontend):**
- `VITE_API_URL` - Backend API URL
- `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_FIREBASE_*` - Firebase config (API key, auth domain, project ID, etc.)
- `VITE_RAZORPAY_KEY_ID`
- `VITE_ALGOLIA_APP_ID`, `VITE_ALGOLIA_SEARCH_KEY`, `VITE_ALGOLIA_INDEX_NAME`
- `VITE_STREAM_API_KEY`, `VITE_STREAM_APP_ID`
- `VITE_ONESIGNAL_APP_ID`
- `VITE_GOOGLE_MAPS_API_KEY`

**Optional Env Vars:**
- `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`
- `POSTHOG_API_KEY`, `POSTHOG_ENABLED=true`
- `LOGROCKET_APP_ID` (frontend)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REDIS_CACHE_TTL`
- `QSTASH_TOKEN`, `JOBS_ENABLED=true`

**Secrets Location:**
- Backend: `.env` file (git-ignored)
- Frontend: `.env` file with `VITE_` prefixes (git-ignored)
- Production: Environment variables set on hosting platform (Render, Vercel)
- Firebase service account: `FIREBASE_SERVICE_ACCOUNT` (JSON in env var)

## CORS Configuration

**Allowed Origins (Backend):**
- Configurable via `CORS_ORIGINS` (comma-separated)
- Supports exact origins: `https://kalasetu.vercel.app`
- Supports wildcard suffixes: `*.vercel.app`
- Development: Allows all `localhost` origins when `NODE_ENV !== production`
- Frontend proxy: Vite dev server proxies `/api` to backend with cookie forwarding

---

*Integration audit: 2026-02-12*
