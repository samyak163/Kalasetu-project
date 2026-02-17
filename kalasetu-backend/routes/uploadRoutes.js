import express from 'express';
import cloudinary from '../config/cloudinary.js';
import { protectAny } from '../middleware/authMiddleware.js';

const router = express.Router();

// Returns a signature for signed direct uploads to Cloudinary
// Only authenticated users (artisan or customer) can get upload credentials
// GET /api/uploads/signature?folder=artisan/profiles
router.get('/signature', protectAny, (req, res) => {
  const ALLOWED_FOLDERS = new Set([
    'kalasetu/artisan/profiles',
    'kalasetu/artisan/portfolio',
    'kalasetu/artisan/services',
    'kalasetu/artisan/documents/aadhar',
    'kalasetu/artisan/documents/pan',
    'kalasetu/artisan/documents/policeVerification',
    'kalasetu/artisan/documents/businessLicense',
    'kalasetu/artisan/documents/insurance',
    'kalasetu/user/profiles',
    'artisan/profiles',
    'artisan/portfolio',
  ]);

  const requestedFolder = (req.query.folder || 'kalasetu/artisan/profiles').toString();
  const folder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : 'kalasetu/artisan/profiles';

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return res.json({
    timestamp,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  });
});

export default router;
