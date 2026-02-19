/**
 * @file uploadRoutes.js — Cloudinary Upload Signature Routes
 *
 * Generates signed upload credentials for direct client-to-Cloudinary
 * uploads. The frontend uses these signatures to upload images without
 * proxying through the backend. Folder access is restricted to a
 * whitelist to prevent unauthorized uploads to arbitrary paths.
 *
 * Mounted at: /api/uploads
 *
 * Routes:
 *  GET /signature?folder=kalasetu/artisan/profiles — Get upload signature
 *
 * Allowed folders:
 *  kalasetu/artisan/profiles, portfolio, services, documents/*
 *  kalasetu/user/profiles
 *  artisan/profiles, artisan/portfolio (legacy paths)
 *
 * Auth: protectAny (both users and artisans may upload)
 *
 * @see config/cloudinary.js — Cloudinary SDK setup
 */
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
  // allowed_formats is signed — Cloudinary enforces this server-side,
  // blocking SVGs (which can contain JavaScript) and other non-image types
  const paramsToSign = { timestamp, folder, allowed_formats: 'jpg,jpeg,png,webp' };
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
    allowed_formats: 'jpg,jpeg,png,webp',
  });
});

export default router;
