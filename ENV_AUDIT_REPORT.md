# 🔍 Environment Variables Audit Report

**Date:** November 2, 2025  
**Project:** KalaSetu

---

## 📊 Summary

### Backend Issues Found:
- ✅ **5 MISSING variables** in your list (used in code)
- ❌ **3 UNUSED variables** in your list (not used in code)
- ⚠️ **1 OPTIONAL variable** with default value

### Frontend Issues Found:
- ✅ All variables match correctly
- ⚠️ **1 OPTIONAL variable** with default value

---

## 🔴 BACKEND - Variables You Need to Add

These are used in the code but **MISSING from your Render environment:**

```bash
# Add these to Render:
ALGOLIA_SEARCH_KEY=your-search-only-key
ONESIGNAL_REST_API_KEY=your-rest-api-key
FIREBASE_PROJECT_ID=your-project-id
POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
POSTHOG_HOST=https://app.posthog.com
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

**Where they're used:**
- `ALGOLIA_SEARCH_KEY` → `config/env.config.js` line 113
- `ONESIGNAL_REST_API_KEY` → `config/env.config.js` line 141
- `FIREBASE_PROJECT_ID` → `config/env.config.js` line 99
- `POSTHOG_API_KEY` → `config/env.config.js` line 157
- `POSTHOG_HOST` → `config/env.config.js` line 158
- `GOOGLE_MAPS_API_KEY` → `config/env.config.js` line 182

---

## 🟡 BACKEND - Variables You Should Remove

These are in your list but **NOT USED** in the code:

```bash
# Remove these from Render (not used):
ENABLE_BACKGROUND_JOBS=true
ENABLE_REDIS_CACHE=true
QSTASH_URL=https://qstash.upstash.io
```

**Why:** The code doesn't reference these variables. Jobs and cache are always enabled if the respective tokens/URLs are provided.

---

## ✅ BACKEND - Complete Correct List

Here's what should be on **Render** (36 variables total):

```bash
# Core (6)
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret
COOKIE_NAME=ks_auth
CORS_ORIGINS=https://kalasetu.vercel.app
FRONTEND_BASE_URL=https://kalasetu.vercel.app

# Cloudinary (3)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Firebase (2)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_PROJECT_ID=

# Razorpay (3)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Algolia (4)
ALGOLIA_APP_ID=
ALGOLIA_ADMIN_KEY=
ALGOLIA_SEARCH_KEY=
ALGOLIA_INDEX_NAME=artisans

# Stream Chat (3)
STREAM_API_KEY=
STREAM_API_SECRET=
STREAM_APP_ID=

# OneSignal (2)
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=

# Resend Email (3)
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=KalaSetu

# Upstash Redis (3)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_CACHE_TTL=3600

# QStash (3)
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Google Maps (1)
GOOGLE_MAPS_API_KEY=

# Daily.co Video (2)
DAILY_API_KEY=
DAILY_DOMAIN=

# Sentry (3) - Optional
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# PostHog (2) - Optional
POSTHOG_API_KEY=
POSTHOG_HOST=https://app.posthog.com
```

**Total: 36 variables** (34 required + 2 optional)

---

## ✅ FRONTEND - Complete Correct List

Here's what should be on **Vercel** (23 variables total):

```bash
# API (1)
VITE_API_URL=https://kalasetu-api.onrender.com

# Cloudinary (2)
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

# Firebase (6)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Razorpay (1)
VITE_RAZORPAY_KEY_ID=

# Algolia (3)
VITE_ALGOLIA_APP_ID=
VITE_ALGOLIA_SEARCH_KEY=
VITE_ALGOLIA_INDEX_NAME=artisans

# Stream Chat (2)
VITE_STREAM_API_KEY=
VITE_STREAM_APP_ID=

# OneSignal (1)
VITE_ONESIGNAL_APP_ID=

# Google Maps (1)
VITE_GOOGLE_MAPS_API_KEY=

# Sentry (3) - Optional
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1

# LogRocket (1) - Optional
VITE_LOGROCKET_APP_ID=

# PostHog (2) - Optional
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://app.posthog.com
```

**Total: 23 variables** (17 required + 6 optional)

---

## 🔧 Action Items

### Immediate (Required)

**On Render (Backend):**
1. ✅ Add `ALGOLIA_SEARCH_KEY`
2. ✅ Add `ONESIGNAL_REST_API_KEY`
3. ✅ Add `FIREBASE_PROJECT_ID`
4. ✅ Add `POSTHOG_API_KEY`
5. ✅ Add `POSTHOG_HOST=https://app.posthog.com`
6. ✅ Add `GOOGLE_MAPS_API_KEY`
7. ❌ Remove `ENABLE_BACKGROUND_JOBS`
8. ❌ Remove `ENABLE_REDIS_CACHE`
9. ❌ Remove `QSTASH_URL`

**On Vercel (Frontend):**
- ✅ All correct! No changes needed.

### Optional (Recommended)

**On Render (Backend):**
- Add `JWT_EXPIRES_IN=7d` (currently uses default, but good to be explicit)

---

## 📝 Notes

### Backend Variable Naming:
All backend variables match the code exactly. No renaming needed.

### Frontend Variable Naming:
All frontend variables match the code exactly. No renaming needed.

### Default Values in Code:

**Backend:**
- `PORT` defaults to `5000`
- `NODE_ENV` defaults to `development`
- `JWT_EXPIRES_IN` defaults to `7d`
- `COOKIE_NAME` defaults to `ks_auth`
- `CORS_ORIGINS` defaults to `http://localhost:5173,http://localhost:3000`
- `FRONTEND_BASE_URL` defaults to `http://localhost:5173`
- `ALGOLIA_INDEX_NAME` defaults to `artisans`
- `RESEND_FROM_NAME` defaults to `KalaSetu`
- `POSTHOG_HOST` defaults to `https://app.posthog.com`
- `SENTRY_ENVIRONMENT` defaults to `NODE_ENV` value
- `SENTRY_TRACES_SAMPLE_RATE` defaults to `0.1`
- `REDIS_CACHE_TTL` defaults to `3600`

**Frontend:**
- `VITE_API_URL` defaults to `https://kalasetu-api-k2d8.onrender.com`
- `VITE_ALGOLIA_INDEX_NAME` defaults to `artisans`
- `VITE_POSTHOG_HOST` defaults to `https://app.posthog.com` (can be omitted)
- `VITE_SENTRY_ENVIRONMENT` defaults to `development`
- `VITE_SENTRY_TRACES_SAMPLE_RATE` defaults to `0.1`

---

## ✅ Verification Checklist

After making changes, verify:

### Backend (Render):
```bash
# Check logs after deployment
✅ Server running in production mode
✅ All required environment variables are set
✅ Resend client initialized
✅ Redis client initialized
✅ QStash client initialized
✅ Razorpay instance initialized
```

### Frontend (Vercel):
```bash
# Check browser console
✅ All required environment variables are set
✅ Firebase initialized
✅ Cloudinary configured
✅ Algolia search working
```

---

## 📚 Reference Files

- Backend config: `kalasetu-backend/config/env.config.js`
- Frontend config: `kalasetu-frontend/src/config/env.config.js`
- Updated `.env.example` files: Created with this audit

---

## 🎯 Quick Fix Script

### Render Dashboard:
Go to: https://dashboard.render.com → Your Service → Environment

**Add these 6 variables:**
```
ALGOLIA_SEARCH_KEY = <your-search-key>
ONESIGNAL_REST_API_KEY = <your-rest-api-key>
FIREBASE_PROJECT_ID = <your-project-id>
POSTHOG_API_KEY = <your-posthog-key>
POSTHOG_HOST = https://app.posthog.com
GOOGLE_MAPS_API_KEY = <your-maps-key>
```

**Remove these 3 variables:**
```
ENABLE_BACKGROUND_JOBS (delete)
ENABLE_REDIS_CACHE (delete)
QSTASH_URL (delete)
```

### Vercel Dashboard:
Go to: https://vercel.com → Your Project → Settings → Environment Variables

**No changes needed!** ✅

---

**Report Complete** ✨
