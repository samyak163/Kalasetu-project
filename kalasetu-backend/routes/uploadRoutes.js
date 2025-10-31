import express from 'express';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Returns a signature for signed direct uploads to Cloudinary
// GET /api/uploads/signature?folder=artisan/profiles
router.get('/signature', (req, res) => {
  const folder = (req.query.folder || 'artisan/profiles').toString();
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
