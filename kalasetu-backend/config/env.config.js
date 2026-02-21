/**
 * @file env.config.js — Centralized Environment Configuration
 *
 * Single source of truth for ALL environment variables in the backend.
 * Every service, integration, and config value is read from process.env here
 * and exported as typed, structured config objects.
 *
 * Why centralized?
 *  - Avoids scattered process.env reads across 50+ files
 *  - Provides defaults for development (most services work without .env)
 *  - validateConfig() catches missing required vars at startup
 *  - Easy to audit what env vars the app depends on
 *
 * Config sections:
 *  CORE           — SERVER_CONFIG, DATABASE_CONFIG, JWT_CONFIG, CORS_CONFIG, FRONTEND_CONFIG
 *  ACTIVE         — CLOUDINARY_CONFIG, RAZORPAY_CONFIG, FIREBASE_CONFIG
 *  INTEGRATIONS   — SEARCH_CONFIG, EMAIL_CONFIG, RECAPTCHA_CONFIG, PUSH_CONFIG,
 *                   CHAT_CONFIG, ANALYTICS_CONFIG, ERROR_TRACKING_CONFIG, MAPS_CONFIG,
 *                   VIDEO_CONFIG, AB_TESTING_CONFIG, CACHE_CONFIG, JOBS_CONFIG
 *
 * @exports {Object} SERVER_CONFIG     — Node environment, port, public URL
 * @exports {Object} DATABASE_CONFIG   — MongoDB URI and Mongoose options
 * @exports {Object} JWT_CONFIG        — JWT secret, expiry, cookie settings
 * @exports {Object} CORS_CONFIG       — Allowed origins and credentials flag
 * @exports {Object} FRONTEND_CONFIG   — Frontend base URL for email links, redirects
 * @exports {Object} CLOUDINARY_CONFIG — Image upload cloud name, API keys
 * @exports {Object} RAZORPAY_CONFIG   — Payment gateway keys and webhook secret
 * @exports {Object} FIREBASE_CONFIG   — Firebase Admin service account
 * @exports {Object} SEARCH_CONFIG     — Algolia app ID, API keys, index name
 * @exports {Object} EMAIL_CONFIG      — Resend API key, from address
 * @exports {Object} RECAPTCHA_CONFIG  — reCAPTCHA keys and score threshold
 * @exports {Object} PUSH_CONFIG       — OneSignal app ID and REST key
 * @exports {Object} CHAT_CONFIG       — Stream Chat API key and secret
 * @exports {Object} ANALYTICS_CONFIG  — PostHog API key and host
 * @exports {Object} ERROR_TRACKING_CONFIG — Sentry DSN and sample rate
 * @exports {Object} MAPS_CONFIG       — Google Maps API key
 * @exports {Object} VIDEO_CONFIG      — Daily.co API key and domain
 * @exports {Object} AB_TESTING_CONFIG — A/B testing provider keys (disabled by default)
 * @exports {Object} CACHE_CONFIG      — Upstash Redis URL, token, TTL
 * @exports {Object} JOBS_CONFIG       — QStash token, signing keys, webhook URL
 * @exports {Function} validateConfig  — Checks required env vars are present
 * @exports {Function} isServiceEnabled — Helper to check if a service config is enabled
 * @exports {Object} config            — Legacy flat object for backward compatibility
 *
 * @requires dotenv — Loads .env file into process.env
 *
 * @see .env.example — Template listing all expected environment variables
 * @see utils/validateEnv.js — Additional startup validation
 */

// Load .env file into process.env before reading any variables
import dotenv from 'dotenv';
dotenv.config();

// ==================== CORE CONFIGURATION ====================

// Server Configuration
export const SERVER_CONFIG = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  // Publicly reachable base URL of the backend (e.g., https://api.example.com)
  // Used by external services (QStash webhooks, etc.)
  publicUrl: process.env.SERVER_PUBLIC_URL,
};

// Database Configuration
export const DATABASE_CONFIG = {
  mongoUri: process.env.MONGO_URI,
  // Mongoose v6+ ignores useNewUrlParser/useUnifiedTopology; leave options empty to avoid warnings
  options: {},
};

// JWT Configuration
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'ks_auth',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

// CORS Configuration
export const CORS_CONFIG = {
  origins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  credentials: true,
};

// Frontend Configuration
export const FRONTEND_CONFIG = {
  baseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
};

// ==================== ACTIVE SERVICES ====================

// Cloudinary Configuration (Image Upload)
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  folder: 'kalasetu',
  transformation: {
    quality: 'auto',
    fetch_format: 'auto',
  },
};

// Razorpay Configuration (Payment Gateway)
export const RAZORPAY_CONFIG = {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  currency: 'INR',
  receipt: {
    prefix: 'rcpt_',
  },
};

// Firebase Configuration (Authentication)
export const FIREBASE_CONFIG = {
  serviceAccount: (() => {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      // Only warn in production where we expect the env variable
      if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️  Invalid FIREBASE_SERVICE_ACCOUNT JSON in production.', e.message);
      } else {
        console.warn('⚠️  Invalid FIREBASE_SERVICE_ACCOUNT JSON format:', e.message);
      }
      return null;
    }
  })(),
  projectId: process.env.FIREBASE_PROJECT_ID,
};

// ==================== FUTURE INTEGRATIONS ====================

// Search Configuration (Algolia/Meilisearch)
export const SEARCH_CONFIG = {
  enabled: true,
  provider: 'algolia',
  algolia: {
    appId: process.env.ALGOLIA_APP_ID,
    adminApiKey: process.env.ALGOLIA_ADMIN_KEY,
    searchApiKey: process.env.ALGOLIA_SEARCH_KEY,
    indexName: process.env.ALGOLIA_INDEX_NAME || 'artisans',
  },
};

// Email Service Configuration (Resend/SendGrid/SES)
export const EMAIL_CONFIG = {
  enabled: true,
  provider: 'resend',
  appUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
    fromName: process.env.RESEND_FROM_NAME || 'KalaSetu',
  },
};

// SMS Service Configuration (Twilio/MSG91/Kaleyra)
// Removed SMS providers (not in use)

// reCAPTCHA Configuration
export const RECAPTCHA_CONFIG = {
  enabled: process.env.RECAPTCHA_ENABLED !== 'false',
  siteKey: process.env.RECAPTCHA_SITE_KEY,
  secretKey: process.env.RECAPTCHA_SECRET_KEY,
  version: process.env.RECAPTCHA_VERSION || 'v3', // v2 or v3
  minScore: parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5'), // For v3, minimum score (0.0-1.0)
};

// Push Notifications Configuration (OneSignal/FCM)
export const PUSH_CONFIG = {
  enabled: true,
  provider: 'onesignal',
  onesignal: {
    appId: process.env.ONESIGNAL_APP_ID,
    restApiKey: process.env.ONESIGNAL_REST_API_KEY,
  },
};

// Chat/Messaging Configuration (Stream/SendBird/Socket.io)
export const CHAT_CONFIG = {
  enabled: true,
  provider: 'stream',
  stream: {
    apiKey: process.env.STREAM_API_KEY,
    apiSecret: process.env.STREAM_API_SECRET,
    appId: process.env.STREAM_APP_ID,
  },
};

// Analytics Configuration (Mixpanel/PostHog/Amplitude)
export const ANALYTICS_CONFIG = {
  // Enable only when explicitly opted in
  enabled: process.env.POSTHOG_ENABLED === 'true',
  provider: 'posthog',
  posthog: {
    apiKey: process.env.POSTHOG_API_KEY,
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  },
};

// Error Tracking Configuration (Sentry)
export const ERROR_TRACKING_CONFIG = {
  enabled: true,
  provider: 'sentry',
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    tracesSampleRate: Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  },
};

// Session Replay Configuration (LogRocket/FullStory)
// Removed Session Replay on backend (frontend only)

// Maps Configuration (Google Maps/Mapbox)
export const MAPS_CONFIG = {
  enabled: true,
  provider: 'google',
  google: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
  },
};

// Video Calls Configuration (Daily.co/Twilio/Agora)
export const VIDEO_CONFIG = {
  enabled: true,
  provider: 'daily',
  daily: {
    apiKey: process.env.DAILY_API_KEY,
    domain: process.env.DAILY_DOMAIN,
  },
};



// A/B Testing Configuration (Optimizely/PostHog/VWO)
export const AB_TESTING_CONFIG = {
  enabled: false,
  provider: process.env.AB_TESTING_PROVIDER || 'posthog', // 'optimizely' | 'posthog' | 'vwo'
  optimizely: {
    sdkKey: process.env.OPTIMIZELY_SDK_KEY,
  },
  posthog: {
    apiKey: process.env.POSTHOG_API_KEY,
  },
  vwo: {
    accountId: process.env.VWO_ACCOUNT_ID,
    sdkKey: process.env.VWO_SDK_KEY,
  },
};

// Redis/Caching Configuration (Upstash/Redis Cloud)
export const CACHE_CONFIG = {
  // Only enable caching when Redis credentials are actually configured
  enabled: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  provider: 'upstash',
  upstash: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    ttl: Number.parseInt(process.env.REDIS_CACHE_TTL || '3600'),
  },
};

// Background Jobs Configuration (QStash)
export const JOBS_CONFIG = {
  // Enable background jobs only when explicitly enabled or when running in production with a token present
  enabled: (() => {
    if (typeof process.env.JOBS_ENABLED !== 'undefined') {
      return process.env.JOBS_ENABLED === 'true';
    }
    // Disabled by default to avoid quota issues - set JOBS_ENABLED=true to enable
    return false;
  })(),
  provider: 'qstash',
  // Public webhook base used by QStash to call your backend's job webhook
  // Prefer JOBS_WEBHOOK_BASE, else fallback to SERVER_PUBLIC_URL
  webhookBaseUrl: process.env.JOBS_WEBHOOK_BASE || process.env.SERVER_PUBLIC_URL,
  qstash: {
    token: process.env.QSTASH_TOKEN,
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
  },
};

// ==================== VALIDATION & EXPORT ====================

// Validation function
export function validateConfig() {
  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    if (SERVER_CONFIG.isProduction) {
      process.exit(1);
    }
  } else {
    console.log('✅ All required environment variables are set');
  }

  // Warn about payment credentials in production (payments will fail silently without them)
  if (SERVER_CONFIG.isProduction) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('⚠️  RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set — payments will not work');
    }
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.warn('⚠️  RAZORPAY_WEBHOOK_SECRET not set — webhook verification disabled');
    }
  }

  // Log environment
  console.log(`🚀 Server running in ${SERVER_CONFIG.nodeEnv} mode`);
}

// Helper function to check if a service is enabled and configured
export const isServiceEnabled = (config) => {
  return config.enabled === true;
};

// Export legacy 'config' object for backward compatibility
export const config = {
  // Core
  nodeEnv: SERVER_CONFIG.nodeEnv,
  port: SERVER_CONFIG.port,
  mongoUri: DATABASE_CONFIG.mongoUri,
  jwtSecret: JWT_CONFIG.secret,
  jwtExpiresIn: JWT_CONFIG.expiresIn,
  cookieName: JWT_CONFIG.cookieName,
  corsOrigins: CORS_CONFIG.origins,
  frontendBaseUrl: FRONTEND_CONFIG.baseUrl,
  
  // Services
  cloudinary: CLOUDINARY_CONFIG,
  razorpay: RAZORPAY_CONFIG,
  firebase: FIREBASE_CONFIG,
  algolia: SEARCH_CONFIG.algolia,
  stream: CHAT_CONFIG.stream,
  resend: EMAIL_CONFIG.resend,
  oneSignal: PUSH_CONFIG.onesignal,
  googleMaps: MAPS_CONFIG.google,
};

// Export all configs as named exports
export default {
  server: SERVER_CONFIG,
  database: DATABASE_CONFIG,
  jwt: JWT_CONFIG,
  cors: CORS_CONFIG,
  frontend: FRONTEND_CONFIG,
  cloudinary: CLOUDINARY_CONFIG,
  razorpay: RAZORPAY_CONFIG,
  firebase: FIREBASE_CONFIG,
  search: SEARCH_CONFIG,
  email: EMAIL_CONFIG,
  push: PUSH_CONFIG,
  chat: CHAT_CONFIG,
  analytics: ANALYTICS_CONFIG,
  errorTracking: ERROR_TRACKING_CONFIG,
  maps: MAPS_CONFIG,
  video: VIDEO_CONFIG,
  cache: CACHE_CONFIG,
};