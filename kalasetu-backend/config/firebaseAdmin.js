import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import { FIREBASE_CONFIG } from './env.config.js';

// Helper to load service account either from env (preferred in production) or local file (dev)
function getServiceAccount() {
  // First, try to get from env.config (which reads from environment variable)
  if (FIREBASE_CONFIG.serviceAccount) {
    return FIREBASE_CONFIG.serviceAccount;
  }
  
  // Fallback to local file if exists (only for local dev)
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

if (!admin.apps.length) {
  const creds = getServiceAccount();
  if (creds) {
    admin.initializeApp({
      credential: admin.credential.cert(creds)
    });
    console.log('✅ Firebase Admin initialized');
  } else {
    console.warn('⚠️  Firebase Admin not initialized: missing service account');
  }
}

export default admin;