# Environment Variables Checklist

Complete list of environment variables needed for Kalasetu deployment.

---

## 🎯 BACKEND (Render) - Required Variables

### Core Configuration
- ✅ `NODE_ENV` - Set to `production`
- ✅ `PORT` - Usually auto-set by Render (default: 5000)
- ✅ `MONGO_URI` - MongoDB connection string (MongoDB Atlas)
- ✅ `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- ✅ `JWT_EXPIRES_IN` - Token expiry (default: 7d)
- ✅ `COOKIE_NAME` - Cookie name (default: ks_auth)
- ✅ `CORS_ORIGINS` - Comma-separated frontend URLs (e.g., `https://kalasetu.vercel.app,https://www.kalasetu.com`)
- ✅ `FRONTEND_BASE_URL` - Your frontend URL (e.g., `https://kalasetu.vercel.app`)
- ⚠️ `SERVER_PUBLIC_URL` - Backend public URL (e.g., `https://kalasetu-api.onrender.com`)

### Cloudinary (Image Upload)
- ✅ `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- ✅ `CLOUDINARY_API_KEY` - Cloudinary API key
- ✅ `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Razorpay (Payments)
- ✅ `RAZORPAY_KEY_ID` - Razorpay key ID
- ✅ `RAZORPAY_KEY_SECRET` - Razorpay secret key
- ⚠️ `RAZORPAY_WEBHOOK_SECRET` - Webhook secret (optional)

### Firebase (Authentication)
- ✅ `FIREBASE_SERVICE_ACCOUNT` - JSON string of service account
- ✅ `FIREBASE_PROJECT_ID` - Firebase project ID

### Algolia (Search)
- ✅ `ALGOLIA_APP_ID` - Algolia application ID
- ✅ `ALGOLIA_ADMIN_KEY` - Algolia admin API key
- ✅ `ALGOLIA_SEARCH_KEY` - Algolia search-only API key
- ⚠️ `ALGOLIA_INDEX_NAME` - Index name (default: artisans)

### Resend (Email)
- ✅ `RESEND_API_KEY` - Resend API key
- ✅ `RESEND_FROM_EMAIL` - Sender email (e.g., noreply@kalasetu.com)
- ⚠️ `RESEND_FROM_NAME` - Sender name (default: KalaSetu)

### reCAPTCHA
- ✅ `RECAPTCHA_ENABLED` - Set to `true` or `false`
- ✅ `RECAPTCHA_SITE_KEY` - reCAPTCHA site key
- ✅ `RECAPTCHA_SECRET_KEY` - reCAPTCHA secret key
- ⚠️ `RECAPTCHA_VERSION` - v2 or v3 (default: v3)
- ⚠️ `RECAPTCHA_MIN_SCORE` - Min score for v3 (default: 0.5)

### OneSignal (Push Notifications)
- ✅ `ONESIGNAL_APP_ID` - OneSignal app ID
- ✅ `ONESIGNAL_REST_API_KEY` - OneSignal REST API key

### Stream (Chat)
- ✅ `STREAM_API_KEY` - Stream API key
- ✅ `STREAM_API_SECRET` - Stream API secret
- ✅ `STREAM_APP_ID` - Stream app ID

### PostHog (Analytics)
- ✅ `POSTHOG_API_KEY` - PostHog project API key
- ⚠️ `POSTHOG_HOST` - PostHog host (default: https://app.posthog.com)

### Sentry (Error Tracking)
- ✅ `SENTRY_DSN` - Sentry DSN URL
- ⚠️ `SENTRY_ENVIRONMENT` - Environment name (default: production)
- ⚠️ `SENTRY_TRACES_SAMPLE_RATE` - Sample rate 0.0-1.0 (default: 0.1)

### Google Maps
- ✅ `GOOGLE_MAPS_API_KEY` - Google Maps API key

### Daily.co (Video Calls)
- ✅ `DAILY_API_KEY` - Daily.co API key
- ✅ `DAILY_DOMAIN` - Daily.co domain

### Upstash Redis (Caching)
- ✅ `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- ✅ `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- ⚠️ `REDIS_CACHE_TTL` - Cache TTL in seconds (default: 3600)

### QStash (Background Jobs) - Optional
- ⚠️ `JOBS_ENABLED` - Set to `true` to enable jobs
- ⚠️ `QSTASH_TOKEN` - QStash token
- ⚠️ `QSTASH_CURRENT_SIGNING_KEY` - QStash signing key
- ⚠️ `QSTASH_NEXT_SIGNING_KEY` - QStash next signing key
- ⚠️ `JOBS_WEBHOOK_BASE` - Webhook base URL

### Optional/Security
- ⚠️ `FIELD_ENCRYPTION_KEY` - For field-level encryption (if used)

---

## 🎯 FRONTEND (Vercel) - Required Variables

### API Configuration
- ✅ `VITE_API_URL` - Backend API URL (e.g., `https://kalasetu-api.onrender.com`)

### Firebase (Authentication)
- ✅ `VITE_FIREBASE_API_KEY` - Firebase API key
- ✅ `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- ✅ `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- ✅ `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase sender ID
- ✅ `VITE_FIREBASE_APP_ID` - Firebase app ID

### Cloudinary (Image Upload)
- ✅ `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- ✅ `VITE_CLOUDINARY_UPLOAD_PRESET` - Cloudinary unsigned upload preset

### Razorpay (Payments)
- ✅ `VITE_RAZORPAY_KEY_ID` - Razorpay key ID (public key)

### Algolia (Search)
- ✅ `VITE_ALGOLIA_APP_ID` - Algolia app ID
- ✅ `VITE_ALGOLIA_SEARCH_KEY` - Algolia search-only key
- ⚠️ `VITE_ALGOLIA_INDEX_NAME` - Index name (default: artisans)

### OneSignal (Push Notifications)
- ✅ `VITE_ONESIGNAL_APP_ID` - OneSignal app ID
- ⚠️ `VITE_ONESIGNAL_SAFARI_WEB_ID` - Safari Web ID (optional)

### PostHog (Analytics)
- ✅ `VITE_POSTHOG_KEY` - PostHog project API key
- ⚠️ `VITE_POSTHOG_HOST` - PostHog host URL

### Sentry (Error Tracking)
- ✅ `VITE_SENTRY_DSN` - Sentry DSN URL
- ⚠️ `VITE_SENTRY_ENVIRONMENT` - Environment (default: production)
- ⚠️ `VITE_SENTRY_TRACES_SAMPLE_RATE` - Sample rate (default: 0.1)

### LogRocket (Session Replay)
- ✅ `VITE_LOGROCKET_APP_ID` - LogRocket app ID (format: org/app)

### Google Maps
- ✅ `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

### Stream (Chat)
- ✅ `VITE_STREAM_API_KEY` - Stream API key
- ✅ `VITE_STREAM_APP_ID` - Stream app ID

### Daily.co (Video Calls)
- ✅ `VITE_DAILY_DOMAIN` - Daily.co domain

### Optional
- ⚠️ `VITE_APP_VERSION` - App version (default: 1.0.0)
- ⚠️ `VITE_ENVIRONMENT` - Environment name (default: production)

---

## 📋 Quick Setup Checklist

### Backend (Render)
1. ✅ Copy all backend variables to Render environment variables
2. ✅ Ensure `NODE_ENV=production`
3. ✅ Set `CORS_ORIGINS` to include your Vercel URL
4. ✅ Set `FRONTEND_BASE_URL` to your Vercel URL
5. ✅ Set `SERVER_PUBLIC_URL` to your Render backend URL
6. ✅ Verify MongoDB Atlas connection string is correct
7. ✅ JWT_SECRET should be at least 32 characters
8. ✅ Firebase service account should be valid JSON (minified, no newlines)

### Frontend (Vercel)
1. ✅ Copy all frontend variables to Vercel environment variables
2. ✅ Set `VITE_API_URL` to your Render backend URL
3. ✅ All Firebase config variables from Firebase Console
4. ✅ Use same Cloudinary, Algolia, Stream keys as backend
5. ✅ Razorpay key ID should be the **public** key (starts with `rzp_live_` or `rzp_test_`)
6. ✅ OneSignal, Sentry, PostHog, LogRocket app IDs from their dashboards
7. ✅ Google Maps API key with proper restrictions

---

## 🔍 How to Check for Missing Variables

### Backend (Render)
1. Go to Render dashboard → Your service → Environment
2. Check logs for errors like "Missing required environment variables"
3. Look for validation warnings on startup
4. Check `server.js` startup logs: "✅ All required environment variables are set"

### Frontend (Vercel)
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Check build logs for missing VITE_ variables
3. Console errors in browser (check Network tab for API calls)
4. Look for Sentry/LogRocket init errors in browser console

---

## 🚨 Common Issues

1. **CORS errors**: Check `CORS_ORIGINS` on backend matches frontend URL exactly
2. **Auth not working**: Verify Firebase config matches on both frontend and backend
3. **Images not uploading**: Check Cloudinary cloud name and upload preset
4. **Payments failing**: Ensure Razorpay keys match (test/live mode)
5. **Search not working**: Verify Algolia app ID and keys are correct
6. **Chat not loading**: Check Stream API keys match on frontend and backend
7. **Maps not loading**: Google Maps API key should have Maps JavaScript API enabled

---

## ✅ Legend
- ✅ **Required** - Must be set for the app to work
- ⚠️ **Optional** - Has defaults or optional feature
- 🔒 **Secret** - Keep secure, never commit to repo

---

## 📝 Notes

1. **Never commit .env files** - Use .env.example as template
2. **Use different keys for test/production** - Especially for payments
3. **Rotate secrets regularly** - JWT_SECRET, API keys
4. **Monitor usage** - Check dashboards for API quota/limits
5. **Firebase Service Account** - Must be minified JSON (no newlines) when set as env var
6. **CORS_ORIGINS** - Must be comma-separated, no spaces, exact URLs
7. **Render/Vercel auto-restart** - Changes take effect after redeploy

---

Generated: November 6, 2025
