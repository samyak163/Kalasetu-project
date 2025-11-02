# Environment Configuration Setup Guide

This guide explains how to set up and use environment variables in both frontend and backend of the Kalasetu project.

## 📁 Files Overview

### Frontend (`kalasetu-frontend/`)
- **`src/config/env.config.js`** - Centralized configuration with all service configs
- **`.env.example`** - Template for environment variables
- **`.env`** - Your actual environment variables (not in git)

### Backend (`kalasetu-backend/`)
- **`config/env.config.js`** - Centralized configuration with all service configs
- **`.env.example`** - Template for environment variables
- **`.env`** - Your actual environment variables (not in git)

## 🚀 Quick Setup

### 1. Frontend Setup

```bash
cd kalasetu-frontend

# Copy the example file
cp .env.example .env

# Edit .env with your actual values
# Required variables:
# - VITE_API_URL
# - VITE_FIREBASE_* (all Firebase config)
# - VITE_CLOUDINARY_CLOUD_NAME
# - VITE_CLOUDINARY_UPLOAD_PRESET
# - VITE_RAZORPAY_KEY_ID
```

### 2. Backend Setup

```bash
cd kalasetu-backend

# Copy the example file
cp .env.example .env

# Edit .env with your actual values
# Required variables:
# - MONGO_URI
# - JWT_SECRET
# - CLOUDINARY_* (all three variables)
# - RAZORPAY_KEY_ID
# - RAZORPAY_KEY_SECRET
```

## 📋 Configuration Structure

### Frontend Configuration

The frontend `env.config.js` exports these configurations:

#### Active Services (✅ Required)
```javascript
import { 
  API_CONFIG,         // Backend API URL and settings
  FIREBASE_CONFIG,    // Firebase authentication
  CLOUDINARY_CONFIG,  // Image uploads
  RAZORPAY_CONFIG    // Payment gateway
} from '../config/env.config.js';
```

#### Future Services (🔧 Prepared)
```javascript
import {
  SEARCH_CONFIG,          // Algolia/Meilisearch
  SMS_CONFIG,             // Twilio/MSG91/Kaleyra
  EMAIL_CONFIG,           // Resend/SendGrid/SES
  PUSH_CONFIG,            // OneSignal/FCM
  ANALYTICS_CONFIG,       // Mixpanel/PostHog/Amplitude
  ERROR_TRACKING_CONFIG,  // Sentry
  SESSION_REPLAY_CONFIG,  // LogRocket/FullStory
  MAPS_CONFIG,            // Google Maps/Mapbox
  GOOGLE_MAPS_CONFIG,     // Google Maps specific
  CHAT_CONFIG,            // Stream/SendBird/Socket.io
  VIDEO_CONFIG,           // Agora/Twilio/Daily
  SUPPORT_CONFIG,         // Intercom/Zendesk/Freshdesk
  AB_TESTING_CONFIG      // Optimizely/PostHog/VWO
} from '../config/env.config.js';
```

### Backend Configuration

The backend `env.config.js` exports these configurations:

#### Core Services (✅ Required)
```javascript
import {
  SERVER_CONFIG,      // Node environment, port
  DATABASE_CONFIG,    // MongoDB connection
  JWT_CONFIG,         // JWT tokens and cookies
  CORS_CONFIG,        // CORS settings
  FRONTEND_CONFIG,    // Frontend URL
  CLOUDINARY_CONFIG,  // Image upload service
  RAZORPAY_CONFIG,    // Payment gateway
  FIREBASE_CONFIG     // Firebase admin (optional)
} from './config/env.config.js';
```

#### Future Services (🔧 Prepared)
```javascript
import {
  SEARCH_CONFIG,          // Algolia/Meilisearch
  EMAIL_CONFIG,           // Resend/SendGrid/SES
  SMS_CONFIG,             // Twilio/MSG91/Kaleyra
  PUSH_CONFIG,            // OneSignal/FCM
  CHAT_CONFIG,            // Stream/SendBird/Socket.io
  ANALYTICS_CONFIG,       // Mixpanel/PostHog/Amplitude
  ERROR_TRACKING_CONFIG,  // Sentry
  SESSION_REPLAY_CONFIG,  // LogRocket/FullStory
  MAPS_CONFIG,            // Google Maps/Mapbox
  VIDEO_CONFIG,           // Agora/Twilio/Daily
  SUPPORT_CONFIG,         // Intercom/Zendesk/Freshdesk
  AB_TESTING_CONFIG,      // Optimizely/PostHog/VWO
  CACHE_CONFIG,           // Redis/Upstash
  JOBS_CONFIG             // BullMQ background jobs
} from './config/env.config.js';
```

## 💡 Usage Examples

### Frontend Usage

#### Using API Configuration
```javascript
import { API_CONFIG } from '../config/env.config.js';
import axios from 'axios';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});
```

#### Using Razorpay
```javascript
import { RAZORPAY_CONFIG } from '../config/env.config.js';

const loadRazorpay = () => {
  const options = {
    key: RAZORPAY_CONFIG.keyId,
    amount: amount * 100, // Amount in paise
    currency: RAZORPAY_CONFIG.currency,
    name: RAZORPAY_CONFIG.name,
    description: RAZORPAY_CONFIG.description,
    image: RAZORPAY_CONFIG.image,
    theme: RAZORPAY_CONFIG.theme,
    handler: function (response) {
      console.log('Payment successful:', response);
    },
  };
  
  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

#### Enabling Future Services
```javascript
import { SEARCH_CONFIG } from '../config/env.config.js';

// In your code, check if service is enabled
if (SEARCH_CONFIG.enabled) {
  // Initialize Algolia or Meilisearch
  const searchClient = algoliasearch(
    SEARCH_CONFIG.algolia.appId,
    SEARCH_CONFIG.algolia.searchApiKey
  );
}
```

### Backend Usage

#### Using Database Configuration
```javascript
import { DATABASE_CONFIG } from './config/env.config.js';
import mongoose from 'mongoose';

const connectDB = async () => {
  await mongoose.connect(DATABASE_CONFIG.mongoUri, DATABASE_CONFIG.options);
};
```

#### Using Razorpay
```javascript
import { RAZORPAY_CONFIG } from './config/env.config.js';
import Razorpay from 'razorpay';

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_CONFIG.keyId,
  key_secret: RAZORPAY_CONFIG.keySecret,
});

// Create order
const order = await razorpayInstance.orders.create({
  amount: amount * 100,
  currency: RAZORPAY_CONFIG.currency,
  receipt: `${RAZORPAY_CONFIG.receipt.prefix}${Date.now()}`,
});
```

#### Enabling Future Services
```javascript
import { EMAIL_CONFIG, isServiceEnabled } from './config/env.config.js';

// Check if email service is enabled
if (isServiceEnabled(EMAIL_CONFIG)) {
  // Initialize email service based on provider
  if (EMAIL_CONFIG.provider === 'resend') {
    const resend = new Resend(EMAIL_CONFIG.resend.apiKey);
  }
}
```

## 🔐 Security Best Practices

### ✅ DO:
- Keep `.env` files in `.gitignore`
- Use `.env.example` as template with dummy values
- Use different values for development and production
- Rotate secrets regularly
- Use environment-specific variables in production (Vercel, Render, etc.)

### ❌ DON'T:
- Never commit `.env` files to git
- Never expose backend secrets in frontend
- Never use production credentials in development
- Never hardcode sensitive values in code

## 🎯 Enabling New Services

When you're ready to add a new service:

### 1. Add Environment Variables
Add the required variables to your `.env` file:

```env
# Example: Enabling Algolia Search
VITE_ALGOLIA_APP_ID=your-app-id
VITE_ALGOLIA_SEARCH_API_KEY=your-search-key
VITE_ALGOLIA_INDEX_NAME=artisans
```

### 2. Enable in Configuration
Update the config to enable the service:

```javascript
// In env.config.js
export const SEARCH_CONFIG = {
  enabled: true, // Change from false to true
  provider: 'algolia',
  algolia: {
    appId: import.meta.env.VITE_ALGOLIA_APP_ID,
    searchApiKey: import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY,
    indexName: import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'artisans',
  },
};
```

### 3. Use in Your Code
Import and use the configuration:

```javascript
import { SEARCH_CONFIG } from '../config/env.config.js';
import algoliasearch from 'algoliasearch/lite';

if (SEARCH_CONFIG.enabled && SEARCH_CONFIG.provider === 'algolia') {
  const searchClient = algoliasearch(
    SEARCH_CONFIG.algolia.appId,
    SEARCH_CONFIG.algolia.searchApiKey
  );
}
```

## 🧪 Validation

Both frontend and backend have validation functions:

### Frontend
```javascript
import { validateConfig } from '../config/env.config.js';

// Call during app initialization
validateConfig();
// Output: ✅ All required environment variables are set
// Or: ❌ Missing required environment variables: VITE_API_URL
```

### Backend
```javascript
import { validateConfig } from './config/env.config.js';

// Call during server startup
validateConfig();
// Output: ✅ All required environment variables are set
// Or: ❌ Missing required environment variables: MONGO_URI, JWT_SECRET
// (Will exit process in production)
```

## 📦 Service Provider Options

Each service configuration supports multiple providers:

| Service | Providers |
|---------|-----------|
| **Search** | Algolia, Meilisearch |
| **Email** | Resend, SendGrid, Amazon SES |
| **SMS** | Twilio, MSG91, Kaleyra |
| **Push** | OneSignal, FCM |
| **Analytics** | Mixpanel, PostHog, Amplitude |
| **Error Tracking** | Sentry |
| **Session Replay** | LogRocket, FullStory |
| **Maps** | Google Maps, Mapbox |
| **Chat** | Stream, SendBird, Socket.io |
| **Video** | Agora, Twilio, Daily |
| **Support** | Intercom, Zendesk, Freshdesk |
| **A/B Testing** | Optimizely, PostHog, VWO |
| **Cache** | Redis, Upstash |

## 🆘 Troubleshooting

### Issue: "Cannot find module 'env.config.js'"
**Solution**: Check the import path is correct relative to your file location.

### Issue: Environment variables are undefined
**Solution**: 
1. Ensure `.env` file exists in the root directory
2. Restart your development server after changing `.env`
3. Check variable names match exactly (case-sensitive)
4. Frontend variables must start with `VITE_`

### Issue: CORS errors
**Solution**: Add your frontend URL to `CORS_ORIGINS` in backend `.env`

### Issue: Firebase/Cloudinary not working
**Solution**: Double-check all configuration values are correct in `.env`

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Node.js Best Practices - Environment Variables](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
- [The Twelve-Factor App - Config](https://12factor.net/config)

## 🤝 Need Help?

If you have questions about:
- **Setting up a specific service**: Check the service's official documentation
- **Environment variable issues**: Verify the variable name and value in `.env`
- **Configuration structure**: Review this guide and the `env.config.js` files
