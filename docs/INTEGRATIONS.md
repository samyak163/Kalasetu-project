# 🔌 External Integrations Guide

Complete guide for integrating third-party services with KalaSetu.

## Table of Contents
- [Communication Tools](#communication-tools)
- [Analytics & Monitoring](#analytics--monitoring)
- [Payment Processing](#payment-processing)
- [Search & Indexing](#search--indexing)
- [Background Jobs](#background-jobs)
- [Email Services](#email-services)

---

## Communication Tools

### Stream Chat (Real-time Messaging)
**Purpose:** Chat between artisans and customers

```env
# Backend
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret
```

**Setup:**
1. Sign up at [GetStream.io](https://getstream.io/)
2. Create a new app
3. Get API credentials from Dashboard
4. Enable chat features needed

### Daily.co (Video Calls)
**Purpose:** Video consultations

```env
# Backend
DAILY_API_KEY=your-daily-api-key
DAILY_DOMAIN=your-subdomain.daily.co
```

**Setup:**
1. Sign up at [Daily.co](https://www.daily.co/)
2. Create rooms via API or dashboard
3. Get API key from settings

### OneSignal (Push Notifications)
**Purpose:** Browser and mobile push notifications

```env
# Backend
ONESIGNAL_APP_ID=your-app-id
ONESIGNAL_REST_API_KEY=your-rest-api-key
```

**Frontend:**
```env
VITE_ONESIGNAL_APP_ID=your-app-id
```

**Setup:**
1. Sign up at [OneSignal](https://onesignal.com/)
2. Create web push app
3. Follow web push setup wizard
4. Get credentials from Settings → Keys & IDs

---

## Analytics & Monitoring

### PostHog (Product Analytics)
**Purpose:** User behavior tracking and analytics

```env
# Backend
POSTHOG_API_KEY=your-project-api-key
POSTHOG_HOST=https://app.posthog.com
```

**Frontend:**
```env
VITE_POSTHOG_API_KEY=your-project-api-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

**Setup:**
1. Sign up at [PostHog](https://posthog.com/)
2. Create project
3. Get API key from Project Settings

### Sentry (Error Tracking)
**Purpose:** Error monitoring and crash reporting

```env
# Backend
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=development

# Frontend
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENVIRONMENT=development
```

**Setup:**
1. Sign up at [Sentry.io](https://sentry.io/)
2. Create new project (Node.js for backend, React for frontend)
3. Get DSN from Project Settings

### LogRocket (Session Replay)
**Purpose:** Frontend session recording and debugging

```env
# Frontend
VITE_LOGROCKET_APP_ID=your-app-id
```

**Setup:**
1. Sign up at [LogRocket](https://logrocket.com/)
2. Create new application
3. Get App ID from setup instructions

---

## Payment Processing

### Razorpay
**Purpose:** Payment collection from customers

```env
# Backend
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

**Setup:**
1. Sign up at [Razorpay](https://razorpay.com/)
2. Complete KYC verification
3. Get API keys from Dashboard → Settings → API Keys
4. Set up webhooks for payment events

**Test Mode:**
- Use test keys for development
- Test card: 4111 1111 1111 1111
- Any future expiry, any CVV

---

## Search & Indexing

### Algolia
**Purpose:** Fast, typo-tolerant artisan search

```env
# Backend
ALGOLIA_APP_ID=your-app-id
ALGOLIA_ADMIN_KEY=your-admin-key
ALGOLIA_ARTISAN_INDEX=artisans
ALGOLIA_SEARCH_ONLY_KEY=your-search-key
```

**Setup:**
1. Sign up at [Algolia](https://www.algolia.com/)
2. Create index named "artisans"
3. Configure searchable attributes:
   - `fullName`
   - `skills`
   - `bio`
   - `location.city`
   - `location.state`

**Index Artisans:**
```bash
cd kalasetu-backend
node scripts/indexArtisans.js
```

---

## Background Jobs

### QStash (Serverless Queue)
**Purpose:** Scheduled tasks and background jobs

```env
# Backend
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key
WEBHOOK_BASE_URL=https://your-domain.com
```

**Setup:**
1. Sign up at [Upstash](https://upstash.com/)
2. Create QStash instance
3. Get credentials from console
4. Configure webhook URL (must be publicly accessible)

### Redis (Caching)
**Purpose:** API response caching

```env
# Backend
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
# OR Upstash Redis:
# REDIS_URL=redis://default:password@endpoint.upstash.io:6379
```

**Setup (Local):**
```bash
# Install Redis
# Windows: https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt install redis-server

# Start Redis
redis-server
```

**Setup (Upstash Cloud):**
1. Create Redis database at [Upstash](https://upstash.com/)
2. Get connection URL
3. Add to `.env`

---

## Email Services

### Resend (Transactional Email)
**Purpose:** Welcome emails, password resets, notifications

```env
# Backend
EMAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=KalaSetu
```

**Setup:**
1. Sign up at [Resend](https://resend.com/)
2. Verify your domain (or use onboarding.resend.dev for testing)
3. Create API key
4. Add to `.env`

### Nodemailer (Alternative)
**Purpose:** Email via SMTP (Gmail, etc.)

```env
# Backend
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate app password: Google Account → Security → App passwords
3. Use app password in `SMTP_PASS`

---

## Google Maps Platform

### Maps JavaScript API
**Purpose:** Location picker, maps display

```env
# Frontend
VITE_GOOGLE_MAPS_API_KEY=your-api-key
```

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict key to your domain (optional, recommended for production)

**Billing:** Free tier includes $200/month credit

---

## Feature Flags & Toggles

Most integrations can be disabled via environment variables:

```env
# Backend Feature Flags
JOBS_ENABLED=true              # Background jobs
CACHE_ENABLED=true             # Redis caching
ANALYTICS_ENABLED=true         # PostHog tracking
ERROR_TRACKING_ENABLED=true    # Sentry
```

This allows gradual rollout and easy debugging.

---

## Testing Credentials

For development, many services offer test/sandbox modes:

- **Razorpay:** Test keys (key_test_xxx)
- **Stream Chat:** Free developer plan
- **Daily.co:** Free tier with limited rooms
- **Resend:** Free tier (100 emails/day)
- **PostHog:** Self-hosted or cloud free tier

---

## Security Best Practices

1. **Never commit API keys** - Use `.env` files (already in `.gitignore`)
2. **Use environment-specific keys** - Different keys for dev/staging/prod
3. **Rotate keys regularly** - Especially for production
4. **Restrict API key permissions** - Only enable needed features
5. **Use webhooks with signature verification** - For payment webhooks
6. **Monitor API usage** - Set up alerts for unusual activity

---

## Cost Optimization

### Free Tier Services
- PostHog Cloud (1M events/month)
- Sentry (5k errors/month)
- Algolia (10k searches/month)
- Resend (100 emails/day)
- Daily.co (100 minutes/month)
- OneSignal (Unlimited basic push)

### Paid Services to Budget For
- Google Maps ($200/month credit, then pay-as-you-go)
- Razorpay (2% transaction fee)
- Stream Chat ($99/month after free tier)
- Cloudinary (Free tier generous, then ~$89/month)

---

**Last Updated:** November 4, 2025
