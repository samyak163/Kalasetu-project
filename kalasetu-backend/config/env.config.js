/**
 * Backend Environment Configuration
 * Centralized configuration for all environment variables
 * The actual values are in .env file
 */

// Ensure environment variables are loaded whenever this module is imported
import dotenv from 'dotenv';
dotenv.config();

// ==================== CORE CONFIGURATION ====================

// Server Configuration
export const SERVER_CONFIG = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Database Configuration
export const DATABASE_CONFIG = {
  mongoUri: process.env.MONGO_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
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
        console.warn('⚠️  Invalid FIREBASE_SERVICE_ACCOUNT JSON in production.');
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
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
    fromName: process.env.RESEND_FROM_NAME || 'KalaSetu',
  },
};

// SMS Service Configuration (Twilio/MSG91/Kaleyra)
// Removed SMS providers (not in use)

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
  enabled: true,
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
  enabled: true,
  provider: 'upstash',
  upstash: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    ttl: Number.parseInt(process.env.REDIS_CACHE_TTL || '3600'),
  },
};

// Background Jobs Configuration (BullMQ)
// Removed BullMQ Jobs (not in use)

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