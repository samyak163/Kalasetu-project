/**
 * Environment Configuration
 * Centralized configuration for all environment variables
 */

// API Configuration
export const API_CONFIG = {
  // Use local proxy in dev by default, production backend URL in production
  BASE_URL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://kalasetu-api-k2d8.onrender.com'),
  TIMEOUT: 10000,
  WITH_CREDENTIALS: true,
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  defaultFolder: 'kalasetu/profile-pictures',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
};

// Razorpay Configuration (Payment Gateway)
export const RAZORPAY_CONFIG = {
  enabled: true,
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
  currency: 'INR',
  name: 'Kalasetu',
  description: 'Artisan Services Payment',
  image: '/logo.png', // Your logo URL
  theme: {
    color: '#A55233', // Your brand color
  },
};

// Algolia Configuration (Search)
export const SEARCH_CONFIG = {
  enabled: true,
  provider: 'algolia',
  algolia: {
    appId: import.meta.env.VITE_ALGOLIA_APP_ID,
    searchApiKey: import.meta.env.VITE_ALGOLIA_SEARCH_KEY,
    indexName: import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'artisans',
  },
};

// SMS Service Configuration (Twilio/MSG91)
export const SMS_CONFIG = {
  enabled: false,
  provider: import.meta.env.VITE_SMS_PROVIDER || 'twilio', // 'twilio' | 'msg91' | 'kaleyra'
  apiKey: import.meta.env.VITE_SMS_API_KEY,
  senderId: import.meta.env.VITE_SMS_SENDER_ID,
};

// Email Service Configuration (Resend/SendGrid)
export const EMAIL_CONFIG = {
  enabled: false,
  provider: import.meta.env.VITE_EMAIL_PROVIDER || 'resend', // 'resend' | 'sendgrid' | 'ses'
  apiKey: import.meta.env.VITE_EMAIL_API_KEY,
  fromEmail: import.meta.env.VITE_EMAIL_FROM || 'noreply@kalasetu.com',
};

// Push Notifications Configuration (OneSignal/FCM)
export const PUSH_CONFIG = {
  enabled: true,
  provider: 'onesignal',
  onesignal: {
    appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
    safariWebId: import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID, // optional
  },
};

// Analytics Configuration (Mixpanel/PostHog/Amplitude)
export const ANALYTICS_CONFIG = {
  enabled: true,
  provider: 'posthog',
  posthog: {
    apiKey: import.meta.env.VITE_POSTHOG_KEY,
    host: import.meta.env.VITE_POSTHOG_HOST,
  },
};

// Error Tracking Configuration (Sentry)
export const ERROR_TRACKING_CONFIG = {
  enabled: true,
  provider: 'sentry',
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: Number.parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  },
};

// Session Replay Configuration (LogRocket/FullStory)
export const SESSION_REPLAY_CONFIG = {
  enabled: true,
  provider: 'logrocket',
  logrocket: {
    appId: import.meta.env.VITE_LOGROCKET_APP_ID,
  },
};

// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  enabled: true,
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
};

// Chat/Messaging Configuration (Stream/SendBird/Socket.io)
export const CHAT_CONFIG = {
  enabled: true,
  provider: 'stream',
  stream: {
    apiKey: import.meta.env.VITE_STREAM_API_KEY,
    appId: import.meta.env.VITE_STREAM_APP_ID,
  },
};

// Video Calls Configuration (Daily.co/Agora/Twilio)
export const VIDEO_CONFIG = {
  enabled: true,
  provider: 'daily',
  daily: {
    domain: import.meta.env.VITE_DAILY_DOMAIN,
  },
};

// A/B Testing Configuration (Optimizely/PostHog)
// Removed A/B testing config (not in use)

 

// App Metadata
export const APP_CONFIG = {
  name: 'Kalasetu',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Helper function to check if a service is configured
export const isServiceConfigured = (config) => {
  return Object.values(config).every(value => value !== undefined && value !== '');
};

// Validation function
export function validateConfig() {
  const required = [
    'VITE_API_URL',
    'VITE_CLOUDINARY_CLOUD_NAME',
    'VITE_CLOUDINARY_UPLOAD_PRESET',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_RAZORPAY_KEY_ID',
    // Enabled tools
    'VITE_ALGOLIA_APP_ID',
    'VITE_ALGOLIA_SEARCH_KEY',
    'VITE_ALGOLIA_INDEX_NAME',
    'VITE_ONESIGNAL_APP_ID',
    'VITE_POSTHOG_KEY',
    'VITE_SENTRY_DSN',
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_STREAM_API_KEY',
    'VITE_STREAM_APP_ID',
    // Optional but recommended
    'VITE_SENTRY_ENVIRONMENT',
    'VITE_SENTRY_TRACES_SAMPLE_RATE',
    'VITE_LOGROCKET_APP_ID',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
  } else {
    console.log('✅ All required environment variables are set');
  }
}

// Export all configs as a single object (optional)
export default {
  api: API_CONFIG,
  firebase: FIREBASE_CONFIG,
  cloudinary: CLOUDINARY_CONFIG,
  razorpay: RAZORPAY_CONFIG,
  search: SEARCH_CONFIG,
  push: PUSH_CONFIG,
  analytics: ANALYTICS_CONFIG,
  errorTracking: ERROR_TRACKING_CONFIG,
  sessionReplay: SESSION_REPLAY_CONFIG,
  googleMaps: GOOGLE_MAPS_CONFIG,
  chat: CHAT_CONFIG,
  video: VIDEO_CONFIG,
  app: APP_CONFIG,
};
