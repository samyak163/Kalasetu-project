# ⚡ Quick Fix Checklist - Environment Variables

## 🎯 Immediate Actions Required

### 📦 Backend (Render Dashboard)

**Go to:** https://dashboard.render.com → Your Service → Environment

#### ✅ ADD These 6 Variables:

```bash
ALGOLIA_SEARCH_KEY = <same-value-as-ALGOLIA_ADMIN_KEY-or-create-search-only-key>
ONESIGNAL_REST_API_KEY = <get-from-onesignal-dashboard>
FIREBASE_PROJECT_ID = <same-as-in-FIREBASE_SERVICE_ACCOUNT-json>
POSTHOG_API_KEY = <get-from-posthog-dashboard>
POSTHOG_HOST = https://app.posthog.com
GOOGLE_MAPS_API_KEY = <get-from-google-cloud-console>
```

#### ❌ REMOVE These 3 Variables:

```bash
ENABLE_BACKGROUND_JOBS (not used in code)
ENABLE_REDIS_CACHE (not used in code)
QSTASH_URL (not used in code)
```

---

### 🎨 Frontend (Vercel Dashboard)

**Go to:** https://vercel.com → Your Project → Settings → Environment Variables

#### ✅ Status: **ALL CORRECT!** 

No changes needed for frontend. All 23 variables match the code perfectly.

---

## 📋 How to Get Missing Values

### 1. ALGOLIA_SEARCH_KEY
**Option A - Use Admin Key (Quick):**
```
Use the same value as ALGOLIA_ADMIN_KEY
```

**Option B - Create Search-Only Key (Recommended):**
1. Go to: https://www.algolia.com/dashboard
2. Navigate to: API Keys
3. Click "All API Keys"
4. Create new key with Search permission only
5. Copy the key

### 2. ONESIGNAL_REST_API_KEY
1. Go to: https://app.onesignal.com
2. Select your app
3. Go to: Settings → Keys & IDs
4. Copy "REST API Key"

### 3. FIREBASE_PROJECT_ID
Look at your existing `FIREBASE_SERVICE_ACCOUNT` JSON value, find:
```json
{
  "project_id": "your-project-id",  ← Copy this value
  ...
}
```

### 4. POSTHOG_API_KEY
1. Go to: https://app.posthog.com
2. Select your project
3. Go to: Project Settings → Project API Key
4. Copy the key (starts with `phc_`)

### 5. POSTHOG_HOST
```
Simply use: https://app.posthog.com
```
(Unless you're self-hosting PostHog)

### 6. GOOGLE_MAPS_API_KEY
1. Go to: https://console.cloud.google.com
2. Navigate to: APIs & Services → Credentials
3. Create API Key or use existing
4. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
5. Copy the API key

---

## ✅ Verification Steps

### After Updating Render:

1. **Trigger Redeploy:**
   - Render automatically redeploys when env vars change
   - Wait for deployment to complete (~2-3 minutes)

2. **Check Logs:**
   ```
   Look for these messages:
   ✅ Server running in production mode
   ✅ All required environment variables are set
   ✅ Resend client initialized
   ✅ Redis client initialized
   ✅ QStash client initialized
   ✅ Razorpay instance initialized
   ```

3. **Test Functionality:**
   - Search feature (Algolia)
   - Push notifications (OneSignal)
   - Nearby artisans (Google Maps)
   - Analytics (PostHog)

### If You See Errors:

**"Missing required environment variables"**
- Double-check all 6 new variables are added
- Verify no typos in variable names
- Ensure values are not empty

**"Invalid API key" errors**
- Verify you copied the correct key type
- Check key has proper permissions
- Regenerate key if needed

---

## 📊 Final Configuration

### Backend (36 variables):
- ✅ 34 Required
- ⚠️ 2 Optional (Sentry, PostHog)

### Frontend (23 variables):
- ✅ 17 Required
- ⚠️ 6 Optional (Sentry, LogRocket, PostHog)

---

## 🚀 Deployment Timeline

1. **Add variables to Render:** 5 minutes
2. **Automatic redeploy:** 2-3 minutes
3. **Verification:** 2 minutes
4. **Total:** ~10 minutes

---

## 📞 Support

If you encounter issues:

1. Check `ENV_AUDIT_REPORT.md` for detailed analysis
2. Verify `.env.example` files match your configuration
3. Check Render logs for specific error messages
4. Verify all services (Algolia, OneSignal, etc.) are active

---

## ✨ Summary

**Changes Needed:**
- Backend: Add 6, Remove 3 (Net: +3 variables)
- Frontend: No changes ✅

**Time Required:** ~10 minutes

**Impact:** Full feature functionality (search, maps, notifications, analytics)

Let's get it done! 🚀
