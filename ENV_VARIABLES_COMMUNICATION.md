# 🔐 Environment Variables Reference

Complete list of environment variables for Stream Chat and Daily.co integration.

---

## Backend Environment Variables

### File: `kalasetu-backend/.env`

```env
# ============================================
# STREAM CHAT CONFIGURATION
# ============================================
# Get these from: https://getstream.io/dashboard

# Stream API Key (public)
STREAM_API_KEY=your_stream_api_key_here

# Stream API Secret (private - NEVER expose to frontend!)
STREAM_API_SECRET=your_stream_api_secret_here

# Stream App ID
STREAM_APP_ID=your_stream_app_id_here

# Enable/disable chat feature
CHAT_ENABLED=true

# Chat provider (currently only 'stream' supported)
CHAT_PROVIDER=stream

# ============================================
# DAILY.CO VIDEO CONFIGURATION
# ============================================
# Get these from: https://dashboard.daily.co

# Daily.co API Key (private)
DAILY_API_KEY=your_daily_api_key_here

# Your Daily.co domain (e.g., kalasetu.daily.co)
DAILY_DOMAIN=yourcompany.daily.co

# Enable/disable video feature
VIDEO_ENABLED=true

# Video provider (currently only 'daily' supported)
VIDEO_PROVIDER=daily
```

---

## Frontend Environment Variables

### File: `kalasetu-frontend/.env`

```env
# ============================================
# STREAM CHAT CONFIGURATION
# ============================================
# Stream API Key (public - safe to expose)
VITE_STREAM_API_KEY=your_stream_api_key_here

# Stream App ID (public)
VITE_STREAM_APP_ID=your_stream_app_id_here

# ============================================
# DAILY.CO VIDEO CONFIGURATION
# ============================================
# Your Daily.co domain (public)
VITE_DAILY_DOMAIN=yourcompany.daily.co
```

---

## How to Get API Credentials

### Stream Chat

1. **Sign Up**
   - Go to: https://getstream.io
   - Click "Start Free Trial" or "Sign Up"
   - Complete registration

2. **Create App**
   - Go to: https://dashboard.getstream.io
   - Click "Create App"
   - Choose a name (e.g., "Kalasetu Chat")
   - Select region (choose closest to your users)

3. **Get Credentials**
   - From dashboard, select your app
   - Go to "App Settings" → "API Credentials"
   - Copy:
     - **API Key** (starts with a letter, e.g., `a1b2c3d4e5f6`)
     - **API Secret** (long string, keep private!)
     - **App ID** (numeric, e.g., `123456`)

4. **Add to Environment Files**
   ```env
   # Backend
   STREAM_API_KEY=a1b2c3d4e5f6
   STREAM_API_SECRET=your_long_secret_here
   STREAM_APP_ID=123456
   
   # Frontend
   VITE_STREAM_API_KEY=a1b2c3d4e5f6
   VITE_STREAM_APP_ID=123456
   ```

### Daily.co

1. **Sign Up**
   - Go to: https://daily.co
   - Click "Sign Up Free"
   - Complete registration

2. **Get API Key**
   - Go to: https://dashboard.daily.co
   - Click on your account (top right)
   - Go to "Developers" → "API Keys"
   - Click "Create API Key"
   - Copy the API key (starts with a letter)

3. **Get Domain**
   - In dashboard, note your domain
   - Format: `yourcompany.daily.co`
   - This is automatically assigned when you sign up
   - Can be customized in settings

4. **Add to Environment Files**
   ```env
   # Backend
   DAILY_API_KEY=your_daily_api_key_here
   DAILY_DOMAIN=kalasetu.daily.co
   
   # Frontend
   VITE_DAILY_DOMAIN=kalasetu.daily.co
   ```

---

## Security Best Practices

### ⚠️ NEVER Expose These to Frontend:
- `STREAM_API_SECRET` - Backend only!
- `DAILY_API_KEY` - Backend only!

### ✅ Safe to Expose to Frontend:
- `STREAM_API_KEY` - Public identifier
- `STREAM_APP_ID` - Public identifier
- `DAILY_DOMAIN` - Public URL

### Version Control
```gitignore
# Add to .gitignore
.env
.env.local
.env.production
.env.development
```

### Production Deployment
- Use environment variable management (e.g., Vercel, Netlify, Heroku)
- Never commit `.env` files
- Rotate keys if exposed
- Use different keys for dev/staging/production

---

## Validation

### Backend Validation
The backend automatically validates required variables on startup.

Check console for:
```
✅ Stream Chat initialized
✅ All required environment variables are set
```

Or warnings:
```
⚠️ Stream Chat is disabled
❌ Missing required environment variables: STREAM_API_KEY, STREAM_API_SECRET
```

### Frontend Validation
The frontend config validates on load.

Check console for:
```javascript
// Check if configured
import { CHAT_CONFIG, VIDEO_CONFIG } from './config/env.config';
console.log('Chat enabled:', CHAT_CONFIG.enabled);
console.log('Video enabled:', VIDEO_CONFIG.enabled);
```

---

## Example .env Files

### Backend (.env) - Development
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/kalasetu

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Existing services (Cloudinary, Firebase, etc.)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
# ... other existing vars ...

# Stream Chat (NEW)
STREAM_API_KEY=a1b2c3d4e5f6
STREAM_API_SECRET=your_stream_secret_here
STREAM_APP_ID=123456
CHAT_ENABLED=true
CHAT_PROVIDER=stream

# Daily.co Video (NEW)
DAILY_API_KEY=your_daily_api_key_here
DAILY_DOMAIN=kalasetu.daily.co
VIDEO_ENABLED=true
VIDEO_PROVIDER=daily
```

### Frontend (.env) - Development
```env
# API
VITE_API_URL=http://localhost:5000

# Existing services
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_UPLOAD_PRESET=kalasetu_preset
# ... other existing vars ...

# Stream Chat (NEW)
VITE_STREAM_API_KEY=a1b2c3d4e5f6
VITE_STREAM_APP_ID=123456

# Daily.co Video (NEW)
VITE_DAILY_DOMAIN=kalasetu.daily.co
```

---

## Testing Credentials

### Using Test Mode (Optional)
Both services offer test/development modes:

**Stream Chat:**
- Use separate app for development
- Name it "Kalasetu Chat - Dev"
- Get separate credentials

**Daily.co:**
- Free tier includes 10,000 minutes/month
- Create test rooms with prefix: `test-`
- Delete after testing

---

## Environment Variable Loading

### Backend (Node.js)
```javascript
// Loaded via dotenv in server.js
import dotenv from 'dotenv';
dotenv.config();

// Access via process.env
const apiKey = process.env.STREAM_API_KEY;
```

### Frontend (Vite)
```javascript
// Auto-loaded by Vite
// Must start with VITE_

// Access via import.meta.env
const apiKey = import.meta.env.VITE_STREAM_API_KEY;
```

---

## Troubleshooting

### "Environment variable not found"
1. Check file name is exactly `.env`
2. Check variable name spelling
3. Restart server after adding variables
4. Check frontend variables start with `VITE_`

### "Invalid API credentials"
1. Verify you copied full key (no spaces)
2. Check you're using correct environment (dev vs prod)
3. Verify API key is active in dashboard
4. Check for expired trial accounts

### "Connection failed"
1. Verify credentials are correct
2. Check network connectivity
3. Verify no firewall blocking
4. Check service status pages:
   - Stream: https://status.getstream.io
   - Daily: https://status.daily.co

---

## Migration from Development to Production

1. **Create Production Accounts**
   - Stream Chat: Create new "Production" app
   - Daily.co: Use same account, different rooms

2. **Get Production Credentials**
   - Use separate API keys for production
   - Enable production-specific features

3. **Update Environment Variables**
   - Set in hosting platform (Vercel, Netlify, etc.)
   - Never commit production credentials

4. **Test Production Setup**
   - Verify chat works with production credentials
   - Test video calls with production domain
   - Monitor usage in dashboards

---

## Monitoring & Limits

### Stream Chat Free Tier
- 25,000 MAU (Monthly Active Users)
- Unlimited channels
- Unlimited messages
- Monitor usage: https://dashboard.getstream.io

### Daily.co Free Tier
- 10 participants max per room
- 10,000 participant minutes/month
- Monitor usage: https://dashboard.daily.co

**Upgrade Triggers:**
- Stream: When approaching 25K MAU
- Daily: When approaching 10K minutes or need >10 participants

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│                  BACKEND (.env)                      │
├─────────────────────────────────────────────────────┤
│ STREAM_API_KEY          = a1b2c3...                 │
│ STREAM_API_SECRET       = secret_key (PRIVATE!)     │
│ STREAM_APP_ID           = 123456                    │
│ CHAT_ENABLED            = true                      │
│ CHAT_PROVIDER           = stream                    │
│                                                     │
│ DAILY_API_KEY           = api_key (PRIVATE!)        │
│ DAILY_DOMAIN            = company.daily.co          │
│ VIDEO_ENABLED           = true                      │
│ VIDEO_PROVIDER          = daily                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                 FRONTEND (.env)                      │
├─────────────────────────────────────────────────────┤
│ VITE_STREAM_API_KEY     = a1b2c3...                 │
│ VITE_STREAM_APP_ID      = 123456                    │
│ VITE_DAILY_DOMAIN       = company.daily.co          │
└─────────────────────────────────────────────────────┘
```

---

## Support Links

- **Stream Chat Dashboard:** https://dashboard.getstream.io
- **Daily.co Dashboard:** https://dashboard.daily.co
- **Stream Chat Docs:** https://getstream.io/chat/docs/
- **Daily.co Docs:** https://docs.daily.co/

---

**Last Updated:** January 2024  
**Version:** 1.0.0
