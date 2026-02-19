/**
 * @file firebaseAdmin.js — Firebase Admin SDK Initialization
 *
 * Sets up the Firebase Admin SDK for server-side authentication.
 * Used to verify Firebase ID tokens from social login (Google, Facebook)
 * on the frontend, converting them into KalaSetu JWT sessions.
 *
 * Credential loading strategy (prioritized):
 *  1. FIREBASE_SERVICE_ACCOUNT env var (JSON string) — preferred in production
 *  2. serviceAccountKey.json file in project root — fallback for local development
 *  3. If neither exists, Firebase features are disabled (social auth won't work)
 *
 * This file is safe to import even without credentials — it logs a warning
 * and exports the admin SDK (which will throw on actual use if not initialized).
 *
 * @exports {Object} admin — Firebase Admin SDK instance (may be uninitialized if no credentials)
 *
 * @requires firebase-admin — Firebase Admin SDK
 * @requires ./env.config.js — FIREBASE_CONFIG (serviceAccount parsed from env)
 *
 * @see controllers/authController.js — Artisan social auth using admin.auth().verifyIdToken()
 * @see controllers/userAuthController.js — User social auth using admin.auth().verifyIdToken()
 * @see env.config.js — Where FIREBASE_SERVICE_ACCOUNT JSON is parsed
 *
 * @security serviceAccountKey.json is in .gitignore — NEVER commit this file
 */

import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import { FIREBASE_CONFIG } from './env.config.js';

/**
 * Load Firebase service account credentials.
 * Tries env var first (production), then local file (development).
 * Returns null if neither source is available.
 */
function getServiceAccount() {
  // Production: credentials stored as JSON string in FIREBASE_SERVICE_ACCOUNT env var
  if (FIREBASE_CONFIG.serviceAccount) {
    return FIREBASE_CONFIG.serviceAccount;
  }

  // Development fallback: local serviceAccountKey.json file
  const filePath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error('Failed to read serviceAccountKey.json:', e.message);
      return null;
    }
  }

  return null;
}

// Initialize Firebase Admin only once (guard against multiple imports)
if (!admin.apps.length) {
  const creds = getServiceAccount();
  if (creds) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(creds)
      });
      console.log('✅ Firebase Admin initialized');
    } catch (e) {
      console.warn('⚠️  Firebase Admin not initialized: invalid service account credentials:', e.message);
    }
  } else {
    console.warn('⚠️  Firebase Admin not initialized: missing service account');
  }
}

export default admin;