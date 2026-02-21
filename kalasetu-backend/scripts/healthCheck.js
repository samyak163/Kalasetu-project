/**
 * @file healthCheck.js — API Key & Service Health Checker
 *
 * Validates that all external service credentials are correctly configured
 * and working. Makes lightweight API calls to each service to verify
 * keys aren't mistyped, expired, or deactivated.
 *
 * Usage:
 *   npm run health            # Check all services
 *   npm run health -- --json  # Output as JSON (for CI/scripts)
 *
 * Exit codes:
 *   0 — All critical services healthy
 *   1 — One or more critical services failed
 */

import dotenv from 'dotenv';
import { createRequire } from 'module';

dotenv.config();

// ─── Helpers ──────────────────────────────────────────────────

const require = createRequire(import.meta.url);
const jsonOutput = process.argv.includes('--json');

const PASS = '✅';
const FAIL = '❌';
const WARN = '⚠️';
const SKIP = '⏭️';

const results = [];

function log(icon, service, message) {
  if (!jsonOutput) {
    console.log(`  ${icon}  ${service.padEnd(20)} ${message}`);
  }
  results.push({ service, status: icon === PASS ? 'pass' : icon === FAIL ? 'fail' : icon === WARN ? 'warn' : 'skip', message });
}

/** Detect placeholder values from .env.example that were never replaced */
const PLACEHOLDER_PATTERNS = [
  /^your-/i, /^YOUR_/i, /^xxx/i, /^123456789/, /^rzp_test_1234/,
  /^re_xxx/, /^phc_xxx/, /^eyJxxx/, /^sig_xxx/, /^AIzaSyXXX/,
  /example/i, /placeholder/i, /change-this/i,
];
function isPlaceholder(value) {
  if (!value) return false;
  return PLACEHOLDER_PATTERNS.some(p => p.test(value));
}

/** Quick fetch with timeout (no external deps needed) */
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Service Checks ───────────────────────────────────────────

async function checkMongoDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) return log(FAIL, 'MongoDB', 'MONGO_URI not set');

  try {
    const { default: mongoose } = await import('mongoose');
    const conn = await mongoose.createConnection(uri).asPromise();
    // Run a simple admin command to verify the connection is live
    await conn.db.admin().ping();
    await conn.close();
    log(PASS, 'MongoDB', 'Connected and pinged successfully');
  } catch (err) {
    log(FAIL, 'MongoDB', `Connection failed: ${err.message}`);
  }
}

async function checkCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return log(FAIL, 'Cloudinary', 'Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET');
  }
  if (isPlaceholder(CLOUDINARY_CLOUD_NAME)) {
    return log(FAIL, 'Cloudinary', 'CLOUDINARY_CLOUD_NAME is a placeholder — replace with your real cloud name');
  }

  try {
    // Cloudinary Admin API — /ping endpoint verifies credentials
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    const res = await fetchWithTimeout(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/ping`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    if (res.ok) {
      log(PASS, 'Cloudinary', 'Credentials valid');
    } else {
      const body = await res.text();
      log(FAIL, 'Cloudinary', `HTTP ${res.status}: ${body.slice(0, 120)}`);
    }
  } catch (err) {
    log(FAIL, 'Cloudinary', `Request failed: ${err.message}`);
  }
}

async function checkRazorpay() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return log(FAIL, 'Razorpay', 'Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET');
  }

  try {
    // Razorpay API — fetch payments with count=0 to verify credentials
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const res = await fetchWithTimeout(
      'https://api.razorpay.com/v1/payments?count=1',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    if (res.ok) {
      log(PASS, 'Razorpay', `Credentials valid (key: ${RAZORPAY_KEY_ID.slice(0, 12)}...)`);
    } else if (res.status === 401) {
      log(FAIL, 'Razorpay', 'Invalid API key or secret (401 Unauthorized)');
    } else {
      log(FAIL, 'Razorpay', `HTTP ${res.status}: ${(await res.text()).slice(0, 120)}`);
    }
  } catch (err) {
    log(FAIL, 'Razorpay', `Request failed: ${err.message}`);
  }
}

async function checkStreamChat() {
  const { STREAM_API_KEY, STREAM_API_SECRET } = process.env;
  if (!STREAM_API_KEY || !STREAM_API_SECRET) {
    return log(WARN, 'Stream Chat', 'Missing STREAM_API_KEY or STREAM_API_SECRET');
  }

  try {
    const { StreamChat } = await import('stream-chat');
    const client = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
    // getAppSettings verifies the API key + secret pair
    await client.getAppSettings();
    log(PASS, 'Stream Chat', 'API key and secret valid');
  } catch (err) {
    log(FAIL, 'Stream Chat', `Auth failed: ${err.message}`);
  }
}

async function checkAlgolia() {
  const { ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY } = process.env;
  if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
    return log(WARN, 'Algolia', 'Missing ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY');
  }
  if (isPlaceholder(ALGOLIA_APP_ID)) {
    return log(FAIL, 'Algolia', `ALGOLIA_APP_ID is still a placeholder ("${ALGOLIA_APP_ID}") — replace with your real App ID from dashboard.algolia.com`);
  }
  if (isPlaceholder(ALGOLIA_ADMIN_KEY)) {
    return log(FAIL, 'Algolia', 'ALGOLIA_ADMIN_KEY is still a placeholder — use the Write API Key from dashboard.algolia.com/account/api-keys');
  }

  try {
    // Use the Algolia SDK (same as the app does) to verify credentials
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
    const { items } = await client.listIndices();
    log(PASS, 'Algolia', `Valid — ${items?.length || 0} index(es) found`);
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes('Invalid Application-ID') || msg.includes('Unreachable')) {
      log(FAIL, 'Algolia', 'Invalid App ID or cannot reach Algolia servers');
    } else if (msg.includes('Invalid API key') || msg.includes('403')) {
      log(FAIL, 'Algolia', 'API key rejected — use the Write API Key, not the Search-Only key');
    } else {
      log(FAIL, 'Algolia', `Auth failed: ${msg.slice(0, 150)}`);
    }
  }
}

async function checkRedis() {
  const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    return log(SKIP, 'Redis (Upstash)', 'Not configured (optional — caching disabled)');
  }
  if (isPlaceholder(UPSTASH_REDIS_REST_URL) || isPlaceholder(UPSTASH_REDIS_REST_TOKEN)) {
    return log(FAIL, 'Redis (Upstash)', 'Placeholder values detected — replace with real credentials from console.upstash.com');
  }

  try {
    // Upstash Redis REST API — simple PING
    const res = await fetchWithTimeout(
      `${UPSTASH_REDIS_REST_URL}/ping`,
      { headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` } }
    );
    if (res.ok) {
      log(PASS, 'Redis (Upstash)', 'PING successful');
    } else if (res.status === 401) {
      log(FAIL, 'Redis (Upstash)', 'Invalid token (401 Unauthorized)');
    } else {
      log(FAIL, 'Redis (Upstash)', `HTTP ${res.status}`);
    }
  } catch (err) {
    if (err.cause?.code === 'ENOTFOUND' || err.message.includes('fetch failed')) {
      log(FAIL, 'Redis (Upstash)', `Cannot reach Redis URL — check UPSTASH_REDIS_REST_URL is correct`);
    } else {
      log(FAIL, 'Redis (Upstash)', `Request failed: ${err.message}`);
    }
  }
}

async function checkDaily() {
  const { DAILY_API_KEY } = process.env;
  if (!DAILY_API_KEY) {
    return log(WARN, 'Daily.co', 'DAILY_API_KEY not set');
  }

  try {
    // Daily.co REST API — list rooms (limit 1) to verify key
    const res = await fetchWithTimeout(
      'https://api.daily.co/v1/rooms?limit=1',
      { headers: { Authorization: `Bearer ${DAILY_API_KEY}` } }
    );
    if (res.ok) {
      log(PASS, 'Daily.co', 'API key valid');
    } else if (res.status === 401) {
      log(FAIL, 'Daily.co', 'Invalid API key (401 Unauthorized)');
    } else {
      log(FAIL, 'Daily.co', `HTTP ${res.status}`);
    }
  } catch (err) {
    log(FAIL, 'Daily.co', `Request failed: ${err.message}`);
  }
}

async function checkResend() {
  const { RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY) {
    return log(WARN, 'Resend', 'RESEND_API_KEY not set');
  }

  try {
    // Resend REST API — list domains to verify key
    const res = await fetchWithTimeout(
      'https://api.resend.com/domains',
      { headers: { Authorization: `Bearer ${RESEND_API_KEY}` } }
    );
    if (res.ok) {
      const data = await res.json();
      log(PASS, 'Resend', `API key valid — ${data.data?.length || 0} domain(s)`);
    } else if (res.status === 401) {
      log(FAIL, 'Resend', 'Invalid API key (401 Unauthorized)');
    } else {
      log(FAIL, 'Resend', `HTTP ${res.status}`);
    }
  } catch (err) {
    log(FAIL, 'Resend', `Request failed: ${err.message}`);
  }
}

async function checkFirebase() {
  const { FIREBASE_SERVICE_ACCOUNT } = process.env;
  if (!FIREBASE_SERVICE_ACCOUNT) {
    return log(SKIP, 'Firebase Admin', 'FIREBASE_SERVICE_ACCOUNT not set (optional for social auth)');
  }

  try {
    const sa = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
    if (!sa.project_id || !sa.private_key || !sa.client_email) {
      return log(FAIL, 'Firebase Admin', 'Service account JSON missing project_id, private_key, or client_email');
    }
    log(PASS, 'Firebase Admin', `JSON valid — project: ${sa.project_id}`);
  } catch (err) {
    log(FAIL, 'Firebase Admin', `Invalid JSON: ${err.message}`);
  }
}

async function checkOneSignal() {
  const { ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY } = process.env;
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    return log(WARN, 'OneSignal', 'Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY');
  }

  try {
    const res = await fetchWithTimeout(
      `https://onesignal.com/api/v1/apps/${ONESIGNAL_APP_ID}`,
      { headers: { Authorization: `Basic ${ONESIGNAL_REST_API_KEY}` } }
    );
    if (res.ok) {
      const data = await res.json();
      log(PASS, 'OneSignal', `Valid — app: ${data.name || ONESIGNAL_APP_ID}`);
    } else if (res.status === 401 || res.status === 403) {
      log(FAIL, 'OneSignal', 'Invalid REST API key');
    } else {
      log(FAIL, 'OneSignal', `HTTP ${res.status}`);
    }
  } catch (err) {
    log(FAIL, 'OneSignal', `Request failed: ${err.message}`);
  }
}

async function checkRecaptcha() {
  const { RECAPTCHA_SECRET_KEY } = process.env;
  if (!RECAPTCHA_SECRET_KEY) {
    return log(WARN, 'reCAPTCHA', 'RECAPTCHA_SECRET_KEY not set');
  }
  // reCAPTCHA secret can only be verified with a real token, so we just validate format
  if (RECAPTCHA_SECRET_KEY.length < 20) {
    return log(FAIL, 'reCAPTCHA', 'Secret key looks too short (likely mistyped)');
  }
  log(PASS, 'reCAPTCHA', 'Secret key present (format OK)');
}

async function checkSentry() {
  const { SENTRY_DSN } = process.env;
  if (!SENTRY_DSN) {
    return log(SKIP, 'Sentry', 'SENTRY_DSN not set (optional)');
  }
  // Validate DSN format: https://<key>@<host>/<project>
  if (/^https:\/\/[a-f0-9]+@.+\/\d+$/.test(SENTRY_DSN)) {
    log(PASS, 'Sentry', 'DSN format valid');
  } else {
    log(FAIL, 'Sentry', 'DSN format invalid — expected https://<key>@<host>/<project-id>');
  }
}

async function checkPostHog() {
  const { POSTHOG_API_KEY, POSTHOG_ENABLED } = process.env;
  if (POSTHOG_ENABLED !== 'true') {
    return log(SKIP, 'PostHog', 'Disabled (POSTHOG_ENABLED != true)');
  }
  if (!POSTHOG_API_KEY) {
    return log(FAIL, 'PostHog', 'POSTHOG_ENABLED=true but POSTHOG_API_KEY not set');
  }
  log(PASS, 'PostHog', 'API key present');
}

async function checkGoogleMaps() {
  const { GOOGLE_MAPS_API_KEY } = process.env;
  if (!GOOGLE_MAPS_API_KEY) {
    return log(WARN, 'Google Maps', 'GOOGLE_MAPS_API_KEY not set');
  }

  try {
    // Geocoding API with a known address — verifies the key is valid
    const res = await fetchWithTimeout(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Mumbai&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    if (data.status === 'OK') {
      log(PASS, 'Google Maps', 'API key valid (geocoding works)');
    } else if (data.status === 'REQUEST_DENIED') {
      log(FAIL, 'Google Maps', `Key rejected: ${data.error_message || 'REQUEST_DENIED'}`);
    } else {
      log(WARN, 'Google Maps', `Unexpected status: ${data.status}`);
    }
  } catch (err) {
    log(FAIL, 'Google Maps', `Request failed: ${err.message}`);
  }
}

async function checkQStash() {
  const { QSTASH_TOKEN, JOBS_ENABLED } = process.env;
  if (JOBS_ENABLED !== 'true') {
    return log(SKIP, 'QStash', 'Jobs disabled (JOBS_ENABLED != true)');
  }
  if (!QSTASH_TOKEN) {
    return log(FAIL, 'QStash', 'JOBS_ENABLED=true but QSTASH_TOKEN not set');
  }

  try {
    const res = await fetchWithTimeout(
      'https://qstash.upstash.io/v2/schedules',
      { headers: { Authorization: `Bearer ${QSTASH_TOKEN}` } }
    );
    if (res.ok) {
      log(PASS, 'QStash', 'Token valid');
    } else if (res.status === 401) {
      log(FAIL, 'QStash', 'Invalid token (401 Unauthorized)');
    } else {
      log(FAIL, 'QStash', `HTTP ${res.status}`);
    }
  } catch (err) {
    log(FAIL, 'QStash', `Request failed: ${err.message}`);
  }
}

// ─── Required Env Var Check ───────────────────────────────────

function checkRequiredEnvVars() {
  const required = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    COOKIE_NAME: process.env.COOKIE_NAME,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
  };

  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length > 0) {
    log(FAIL, 'Core Env Vars', `Missing: ${missing.join(', ')}`);
  } else {
    log(PASS, 'Core Env Vars', `All ${Object.keys(required).length} core vars set`);
  }

  // JWT_SECRET strength check
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    log(WARN, 'JWT Secret', `Only ${process.env.JWT_SECRET.length} chars — use 32+ for security`);
  }
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  if (!jsonOutput) {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║     KalaSetu API Health Check                    ║');
    console.log('╚══════════════════════════════════════════════════╝\n');
    console.log('─── Core ─────────────────────────────────────────');
  }

  // Phase 1: Core config (sync)
  checkRequiredEnvVars();

  if (!jsonOutput) console.log('\n─── Critical Services ─────────────────────────────');

  // Phase 2: Critical services (must work for app to function)
  await checkMongoDB();
  await checkCloudinary();
  await checkRazorpay();

  if (!jsonOutput) console.log('\n─── Communication Services ────────────────────────');

  // Phase 3: Communication (parallel — independent of each other)
  await Promise.all([
    checkStreamChat(),
    checkResend(),
    checkOneSignal(),
    checkDaily(),
  ]);

  if (!jsonOutput) console.log('\n─── Search & Analytics ────────────────────────────');

  // Phase 4: Search, analytics, monitoring (parallel)
  await Promise.all([
    checkAlgolia(),
    checkSentry(),
    checkPostHog(),
    checkGoogleMaps(),
    checkRecaptcha(),
  ]);

  if (!jsonOutput) console.log('\n─── Infrastructure ────────────────────────────────');

  // Phase 5: Infrastructure services (parallel)
  await Promise.all([
    checkRedis(),
    checkFirebase(),
    checkQStash(),
  ]);

  // ─── Summary ───────────────────────────────────────────────

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warned = results.filter(r => r.status === 'warn').length;
  const skipped = results.filter(r => r.status === 'skip').length;

  if (jsonOutput) {
    console.log(JSON.stringify({ results, summary: { passed, failed, warned, skipped } }, null, 2));
  } else {
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ${PASS} Passed: ${passed}   ${FAIL} Failed: ${failed}   ${WARN} Warnings: ${warned}   ${SKIP} Skipped: ${skipped}`);

    if (failed > 0) {
      console.log(`\n  ${FAIL} ${failed} service(s) have broken credentials.`);
      console.log('  Fix the issues above and re-run: npm run health\n');
    } else if (warned > 0) {
      console.log(`\n  ${WARN} All critical services OK, but ${warned} service(s) have warnings.`);
      console.log('  These may cause some features to not work.\n');
    } else {
      console.log(`\n  ${PASS} All services healthy!\n`);
    }
  }

  // Exit with code 1 if any critical service failed
  process.exit(failed > 0 ? 1 : 0);
}

// Guard against double execution (can happen on Windows with certain shell configs)
if (!globalThis.__healthCheckRunning) {
  globalThis.__healthCheckRunning = true;
  main().catch(err => {
    console.error('Health check crashed:', err);
    process.exit(1);
  });
}
