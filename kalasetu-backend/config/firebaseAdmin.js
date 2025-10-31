import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';

// Helper to load service account either from env (preferred in production) or local file (dev)
function getServiceAccount() {
  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (envJson) {
    try {
      return JSON.parse(envJson);
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e.message);
      return null;
    }
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
  } else {
    console.warn('Firebase Admin not initialized: missing service account');
  }
}

export default admin;