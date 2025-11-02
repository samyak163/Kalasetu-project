# 🛠️ Complete List of Tools & Services - KalaSetu Project

## 📊 Overview
Your KalaSetu project uses **16+ integrated services** across Frontend and Backend, providing a complete ecosystem for user management, content delivery, analytics, payments, background jobs, maps, email notifications, and communication.

---

## ✅ ACTIVE SERVICES (Currently Enabled & Required)

### 1. **Firebase** 🔥
- **Purpose:** User Authentication & Authorization
- **Type:** Backend + Frontend
- **Status:** ✅ ACTIVE
- **Features:**
  - User sign-up/login
  - Email verification
  - Password reset
  - Phone OTP
- **Configuration File:** `kalasetu-backend/config/env.config.js`, `kalasetu-frontend/src/config/env.config.js`
- **Environment Variables:**
  ```
  Backend: FIREBASE_SERVICE_ACCOUNT, FIREBASE_PROJECT_ID
  Frontend: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
  ```
- **Dashboard:** https://console.firebase.google.com

---

### 2. **Cloudinary** ☁️
- **Purpose:** Image Upload & Optimization
- **Type:** Backend + Frontend
- **Status:** ✅ ACTIVE
- **Features:**
  - Profile picture upload
  - Image optimization (auto quality, format conversion)
  - CDN delivery
  - Folder organization (kalasetu/profile-pictures)
- **Configuration File:** `kalasetu-backend/config/env.config.js`, `kalasetu-frontend/src/config/env.config.js`
- **Environment Variables:**
  ```
  Backend: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  Frontend: VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET
  ```
- **Dashboard:** https://cloudinary.com/console

---

### 3. **Razorpay** 💳
- **Purpose:** Payment Gateway
- **Type:** Backend + Frontend
- **Status:** ✅ ACTIVE
- **Features:**
  - Process payments in INR
  - Order receipts (prefix: rcpt_)
  - Payment webhooks
  - Refund management
- **Configuration File:** `kalasetu-backend/config/env.config.js`, `kalasetu-frontend/src/config/env.config.js`
- **Environment Variables:**
  ```
  Backend: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
  Frontend: VITE_RAZORPAY_KEY_ID
  ```
- **Dashboard:** https://dashboard.razorpay.com

---

### 4. **Algolia** 🔍
- **Purpose:** Full-Text Search & Filtering
- **Type:** Backend + Frontend
- **Status:** ✅ ACTIVE
- **Features:**
  - Search artisans by name, craft, location
  - Faceted search (craft, location, skills)
  - Instant results with highlighting
  - Bulk indexing of artisans
  - Search analytics
- **Configuration File:** `kalasetu-backend/utils/algolia.js`, `kalasetu-frontend/src/lib/algolia.js`
- **Environment Variables:**
  ```
  Backend: ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY, ALGOLIA_SEARCH_KEY, ALGOLIA_INDEX_NAME
  Frontend: VITE_ALGOLIA_APP_ID, VITE_ALGOLIA_SEARCH_KEY, VITE_ALGOLIA_INDEX_NAME
  ```
- **Dashboard:** https://www.algolia.com/dashboard
- **Routes:**
  ```
  GET /api/search/artisans?query=pottery&page=0
  GET /api/search/facets
  ```

---

### 5. **Stream Chat** 💬
- **Purpose:** Real-Time Messaging
- **Type:** Backend + Frontend
- **Status:** ✅ ACTIVE
- **Features:**
  - Direct messaging between users
  - Channel management
  - Message history
  - Real-time notifications
  - Threading & reactions
- **Configuration File:** `kalasetu-backend/utils/streamChat.js`, `kalasetu-frontend/src/lib/streamChat.js`
- **Environment Variables:**
  ```
  Backend: STREAM_API_KEY, STREAM_API_SECRET, STREAM_APP_ID
  Frontend: VITE_STREAM_API_KEY, VITE_STREAM_APP_ID
  ```
- **Dashboard:** https://getstream.io/dashboard
- **Routes:**
  ```
  GET /api/chat/token
  POST /api/chat/channels/dm (create direct message)
  GET /api/chat/channels (list user channels)
  POST /api/chat/channels/:type/:id/members (add members)
  DELETE /api/chat/channels/:type/:id/members (remove members)
  ```
- **Frontend Page:** `/messages`

---

### 6. **Daily.co** 📹
- **Purpose:** Video Conferencing
- **Type:** Backend + Frontend
- **Status:** ✅ ACTIVE
- **Features:**
  - Video calls between artisans and customers
  - Screen sharing
  - Chat during calls
  - Room management
  - Meeting tokens
  - Recording support
- **Configuration File:** `kalasetu-backend/utils/dailyco.js`, `kalasetu-frontend/src/lib/dailyco.js`
- **Environment Variables:**
  ```
  Backend: DAILY_API_KEY, DAILY_DOMAIN
  Frontend: VITE_DAILY_DOMAIN
  ```
- **Dashboard:** https://dashboard.daily.co
- **Routes:**
  ```
  POST /api/video/rooms (create room)
  GET /api/video/rooms (list rooms)
  GET /api/video/rooms/:roomName (get details)
  DELETE /api/video/rooms/:roomName (delete room)
  POST /api/video/tokens (create meeting token)
  ```
- **Frontend Page:** `/video-call?room=room-name`

---

### 7. **OneSignal** 🔔
- **Purpose:** Push Notifications
- **Type:** Backend + Frontend
- **Status:** ✅ ACTIVE
- **Features:**
  - Web push notifications
  - Notification to specific users
  - Broadcast notifications
  - Segment-based targeting
  - User tagging
  - Notification history
  - Click tracking
- **Configuration File:** `kalasetu-backend/utils/onesignal.js`, `kalasetu-frontend/src/lib/onesignal.js`
- **Environment Variables:**
  ```
  Backend: ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY
  Frontend: VITE_ONESIGNAL_APP_ID
  ```
- **Dashboard:** https://onesignal.com/dashboard
- **Routes:**
  ```
  POST /api/notifications/send-to-user (send to one user)
  POST /api/notifications/send-to-users (send to multiple)
  POST /api/notifications/broadcast (send to all)
  GET /api/notifications/history
  DELETE /api/notifications/:notificationId
  ```
- **Components:** `NotificationPrompt.jsx`, `useNotifications.js`

---

### 8. **PostHog** 📊
- **Purpose:** Product Analytics & Feature Flags
- **Type:** Backend + Frontend
- **Status:** ✅ ACTIVE
- **Features:**
  - Event tracking
  - User identification
  - Session recording
  - Feature flags
  - A/B testing
  - Funnel analysis
  - Heatmaps
- **Configuration File:** `kalasetu-backend/utils/posthog.js`, `kalasetu-frontend/src/lib/posthog.js`
- **Environment Variables:**
  ```
  Backend: POSTHOG_API_KEY, POSTHOG_HOST
  Frontend: VITE_POSTHOG_KEY, VITE_POSTHOG_HOST
  ```
- **Dashboard:** https://app.posthog.com
- **Middleware:** `analyticsMiddleware.js`
- **Hooks:** `usePostHogTracking.js`

---

### 9. **LogRocket** 🎥
- **Purpose:** Session Replay & Error Tracking
- **Type:** Frontend
- **Status:** ✅ ACTIVE
- **Features:**
  - Record user sessions
  - Capture console logs, network activity
  - Error reproduction
  - Privacy-preserving replay
  - User identification
  - Custom event tracking
- **Configuration File:** `kalasetu-frontend/src/lib/logrocket.js`
- **Environment Variables:**
  ```
  Frontend: VITE_LOGROCKET_APP_ID
  ```
- **Dashboard:** https://app.logrocket.com
- **Hooks:** `useLogRocketTracking.js`
- **Integration:** Connected with Sentry for error tracking

---

### 10. **Sentry** 🐛
- **Purpose:** Error Tracking & Monitoring
- **Type:** Backend + Frontend
- **Status:** ✅ ACTIVE
- **Features:**
  - Capture exceptions
  - Performance monitoring
  - Release tracking
  - Environment-specific tracking
  - Error aggregation
  - Source maps
- **Configuration File:** `kalasetu-backend/utils/sentry.js`, `kalasetu-frontend/src/lib/sentry.js`
- **Environment Variables:**
  ```
  Backend: SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_TRACES_SAMPLE_RATE
  Frontend: VITE_SENTRY_DSN, VITE_SENTRY_ENVIRONMENT, VITE_SENTRY_TRACES_SAMPLE_RATE
  ```
- **Dashboard:** https://sentry.io/organizations/
- **Version:** v10+ (with httpIntegration, expressIntegration)
- **Components:** `ErrorFallback.jsx`

---

### 11. **Google Maps** 🗺️
- **Purpose:** Location Services & Geospatial Queries
- **Type:** Frontend + Backend
- **Status:** ✅ ACTIVE
- **Features:**
  - Artisan location display
  - Nearby artisans search (geospatial)
  - Distance calculation
  - Geocoding & reverse geocoding
  - Interactive maps with markers
  - Location picker
  - Current location detection
- **Configuration File:** `kalasetu-frontend/src/lib/googleMaps.js`, `kalasetu-backend/config/env.config.js`
- **Environment Variables:**
  ```
  Backend: GOOGLE_MAPS_API_KEY
  Frontend: VITE_GOOGLE_MAPS_API_KEY
  ```
- **Components:**
  - `ArtisanMap.jsx` - Display artisans on map
  - `LocationPicker.jsx` - Interactive location selector
  - Payment history
- **Configuration File:** `kalasetu-backend/utils/razorpay.js`, `kalasetu-frontend/src/lib/razorpay.js`
- **Environment Variables:**
  ```
  Backend: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
  Frontend: VITE_RAZORPAY_KEY_ID
  ```
- **Components:**
  - `PaymentButton.jsx` - Initiate payments
  - `PaymentHistory.jsx` - View payment history
  - `PaymentsPage.jsx` - Payment management
- **Backend:**
  - Endpoints: `/api/payments/create-order`, `/api/payments/verify`, `/api/payments/webhook`
  - Model: `paymentModel.js` with order/payment tracking
- **Dashboard:** https://dashboard.razorpay.com

---

## 🔄 CONFIGURED SERVICES (Ready But Not Yet Fully Utilized)
- **Purpose:** Caching & Performance Optimization
- **Type:** Backend
- **Status:** ✅ ACTIVE
- **Features:**
  - Response caching
  - Cache invalidation
  - TTL management
  - Pattern-based deletion
  - Serverless-friendly
- **Configuration File:** `kalasetu-backend/utils/redis.js`
- **Environment Variables:**
  ```
  Backend: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
  ```
- **Middleware:** `cacheMiddleware.js`
- **Cache Keys:**
  - `cache:artisans:list` (5 min TTL)
  - `cache:artisans:public:*` (5 min TTL)
  - `cache:artisans:nearby:*` (1 min TTL)
- **Dashboard:** https://console.upstash.com

---

### 13. **Upstash QStash** ⏰
- **Purpose:** Background Job Processing
- **Type:** Backend
- **Status:** ✅ ACTIVE
- **Features:**
  - Delayed job execution
  - Scheduled jobs (cron)
  - Webhook-based processing
  - Automatic retries
  - Signature verification
  - Batch publishing
- **Configuration File:** `kalasetu-backend/utils/qstash.js`, `kalasetu-backend/utils/jobQueue.js`
- **Environment Variables:**
  ```
  Backend: QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY
  ```
- **Job Types:**
  - Welcome emails
  - Artisan indexing
  - Reminder notifications
  - Expired calls cleanup
  - Daily reports
  - Bulk notifications
- **Endpoints:**
  - `POST /api/jobs/webhook` - Job webhook handler
- **Scheduled Jobs:**
  - Daily cleanup: 2 AM
  - Daily reports: 8 AM
- **Dashboard:** https://console.upstash.com

---

### 14. **Razorpay** 💳
- **Purpose:** Payment Gateway
- **Type:** Backend + Frontend
- **Status:** ✅ ACTIVE
- **Features:**
  - Order creation
  - Payment processing
  - Signature verification
  - Refund processing
  - Webhook handling
  - Payment history
- **Configuration File:** `kalasetu-backend/utils/razorpay.js`, `kalasetu-frontend/src/lib/razorpay.js`
- **Environment Variables:**
  ```
  Backend: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
  Frontend: VITE_RAZORPAY_KEY_ID
  ```
- **Components:**
  - `PaymentButton.jsx` - Initiate payments
  - `PaymentHistory.jsx` - View payment history
  - `PaymentsPage.jsx` - Payment management
- **Backend:**
  - Endpoints: `/api/payments/create-order`, `/api/payments/verify`, `/api/payments/webhook`
  - Model: `paymentModel.js` with order/payment tracking
- **Dashboard:** https://dashboard.razorpay.com

---

### 15. **Google Maps** 🗺️
- **Purpose:** Location Services & Mapping
- **Type:** Frontend
- **Status:** ✅ ACTIVE (Configured)
- **Features:**
  - Artisan location display
  - Distance calculation
  - Location-based search
  - Map embeds
- **Environment Variables:**
  ```
  Frontend: VITE_GOOGLE_MAPS_API_KEY
  ```
- **Dashboard:** https://console.cloud.google.com/maps-api

---

### 12. **MongoDB** 🗄️
- **Purpose:** Database
- **Type:** Backend
- **Status:** ✅ ACTIVE
- **Features:**
  - User data storage
  - Artisan profiles
  - Reviews & ratings
  - Order history
- **Configuration File:** `kalasetu-backend/config/env.config.js`
- **Environment Variables:**
  ```
  MONGO_URI=mongodb://...
  ```

---

### 13. **Email Service (Resend)** ✉️
- **Purpose:** Transactional Emails
- **Type:** Backend
- **Status:** ✅ ACTIVE
- **Features:**
  - Welcome emails on registration
  - Password reset emails
  - Email verification
  - Order confirmations
  - Custom notifications
  - Contact form submissions
  - Batch email sending
  - Professional HTML email templates
- **Configuration File:** `kalasetu-backend/utils/email.js`, `kalasetu-backend/config/env.config.js`
- **Environment Variables:**
  ```
  Backend: RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_FROM_NAME
  ```
- **Dashboard:** https://resend.com/overview
- **Routes:**
  ```
  POST /api/contact - Submit contact form
  ```
- **Utility Functions:**
  ```javascript
  sendWelcomeEmail(to, name)
  sendPasswordResetEmail(to, name, resetToken)
  sendVerificationEmail(to, name, verificationToken)
  sendOrderConfirmationEmail(to, name, orderDetails)
  sendNotificationEmail(to, name, notification)
  sendBatchEmails(emails)
  sendContactFormEmail(data)
  ```

---

## 🔧 CONFIGURED BUT DISABLED (Ready for Future Use)

### 14. **SMS Service (Twilio/MSG91)** 📱
- **Purpose:** SMS Notifications
- **Status:** 🔧 CONFIGURED (Disabled)
- **Options:** Twilio, MSG91, Kaleyra
- **Use Cases:** OTP, order updates, alerts

---

### 15. **Upstash Redis** ⚡
- **Purpose:** Caching & Sessions
- **Status:** 🔧 CONFIGURED (Disabled)
- **Features:** Real-time caching, session management, rate limiting

---

## 📋 CORE INFRASTRUCTURE

### Backend Stack
- **Node.js** v22
- **Express.js** - REST API framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Dotenv** - Environment variables
- **Cors** - Cross-origin requests
- **Mongoose** - MongoDB ODM

### Frontend Stack
- **React** 19.2.0 - UI framework
- **Vite** 7.1.12 - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Firebase** - Auth SDK

---

## 🌐 DEPLOYMENT PLATFORMS

### Backend Deployment
- **Platform:** Render
- **Status:** Ready for deployment
- **Environment:** Production/Staging
- **Auto-deploy:** Yes (from GitHub)

### Frontend Deployment
- **Platform:** Vercel
- **Status:** Ready for deployment
- **Environment:** Production/Staging
- **Auto-deploy:** Yes (from GitHub)

---

## 🔑 Environment Variables Summary

### Frontend (.env)
```
VITE_API_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_RAZORPAY_KEY_ID=
VITE_ALGOLIA_APP_ID=
VITE_ALGOLIA_SEARCH_KEY=
VITE_ALGOLIA_INDEX_NAME=
VITE_STREAM_API_KEY=
VITE_STREAM_APP_ID=
VITE_DAILY_DOMAIN=
VITE_ONESIGNAL_APP_ID=
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=
VITE_SENTRY_TRACES_SAMPLE_RATE=
VITE_LOGROCKET_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
```

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGO_URI=
JWT_SECRET=
CORS_ORIGINS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
FIREBASE_SERVICE_ACCOUNT=
FIREBASE_PROJECT_ID=
ALGOLIA_APP_ID=
ALGOLIA_ADMIN_KEY=
ALGOLIA_SEARCH_KEY=
STREAM_API_KEY=
STREAM_API_SECRET=
STREAM_APP_ID=
DAILY_API_KEY=
DAILY_DOMAIN=
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=
POSTHOG_API_KEY=
POSTHOG_HOST=
SENTRY_DSN=
SENTRY_ENVIRONMENT=
SENTRY_TRACES_SAMPLE_RATE=
```

---

## 📊 SERVICE CATEGORY BREAKDOWN

### 🔐 Authentication & Security (1 Service)
1. Firebase

### 💾 Data & Storage (2 Services)
1. MongoDB (Database)
2. Cloudinary (Image Storage)

### 💰 Payments & Commerce (1 Service)
1. Razorpay

### 🔎 Search & Discovery (1 Service)
1. Algolia

### 💬 Communication (2 Services)
1. Stream Chat (Messaging)
2. Daily.co (Video)

### 📱 Notifications (1 Service)
1. OneSignal (Push Notifications)

### 📊 Analytics & Monitoring (3 Services)
1. PostHog (Analytics)
2. LogRocket (Session Replay)
3. Sentry (Error Tracking)

### 🗺️ Location Services (1 Service)
1. Google Maps

### 🔧 Infrastructure & Deployment (2 Services)
1. GitHub (Version Control)
2. Render + Vercel (Hosting)

---

## ✨ Key Features by Service

| Feature | Service | Status |
|---------|---------|--------|
| Authentication | Firebase | ✅ |
| Image Upload | Cloudinary | ✅ |
| Payments | Razorpay | ✅ |
| Search | Algolia | ✅ |
| Messaging | Stream Chat | ✅ |
| Video Calls | Daily.co | ✅ |
| Push Notifications | OneSignal | ✅ |
| Analytics | PostHog | ✅ |
| Session Replay | LogRocket | ✅ |
| Error Tracking | Sentry | ✅ |
| Location Services | Google Maps | ✅ |
| Database | MongoDB | ✅ |

---

## 🚀 Next Steps

1. **Verify API Credentials**
   - Ensure all `.env` files have correct API keys
   - Test each service in development

2. **Configure Deployment**
   - Add environment variables to Render (backend)
   - Add environment variables to Vercel (frontend)

3. **Test Each Service**
   - Test authentication flow
   - Test payment processing
   - Test messaging and video calls
   - Test notifications
   - Monitor analytics

4. **Monitor & Scale**
   - Set up monitoring dashboards
   - Configure alerts
   - Track metrics and performance

---

## 📚 Documentation Files

- `ENV_SETUP_GUIDE.md` - Environment configuration
- `INTEGRATION_SETUP.md` - Service integration steps
- `COMMUNICATION_TOOLS_IMPLEMENTATION.md` - Stream Chat & Daily.co
- `ANALYTICS_TOOLS_IMPLEMENTATION.md` - PostHog, LogRocket, OneSignal
- `DEPLOYMENT_CHECKLIST_COMMUNICATION.md` - Deployment guide
- `QUICK_REFERENCE_COMMUNICATION.md` - Quick reference guide
- `QUICK_REFERENCE_ANALYTICS.md` - Analytics quick reference

---

**Last Updated:** November 2, 2025  
**Total Services:** 12 Active + 3 Configured (Ready to Enable)  
**Lines of Code:** ~30,000+ lines integrated across all services
