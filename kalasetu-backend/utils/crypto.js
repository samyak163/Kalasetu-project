import crypto from 'crypto';

// Uses AES-256-GCM for authenticated encryption
const KEY_ENV = process.env.FIELD_ENCRYPTION_KEY || '';
let KEY = null;
if (KEY_ENV) {
  try {
    // Accept base64 (preferred) or hex or raw 32-byte string
    if (KEY_ENV.length === 44) {
      KEY = Buffer.from(KEY_ENV, 'base64');
    } else if (KEY_ENV.length === 64) {
      KEY = Buffer.from(KEY_ENV, 'hex');
    } else if (KEY_ENV.length === 32) {
      KEY = Buffer.from(KEY_ENV);
    }
  } catch {
    KEY = null;
  }
}

export const isEncryptionEnabled = () => !!KEY;

export function encrypt(value) {
  if (!value) return '';
  if (!KEY) return value; // fallback to plaintext if key not set
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

export function decrypt(payload) {
  if (!payload) return '';
  if (!KEY) return payload; // fallback to plaintext if key not set
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
  return plaintext.toString('utf8');
}

export function maskAccountNumber(val) {
  if (!val) return '';
  const s = String(val);
  const tail = s.slice(-4);
  return `****${tail}`;
}
