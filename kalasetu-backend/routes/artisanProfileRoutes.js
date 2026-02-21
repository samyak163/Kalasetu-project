/**
 * @file artisanProfileRoutes.js — Artisan Profile Management Routes
 *
 * Authenticated profile management for artisans: profile CRUD, photo uploads,
 * document verification, bank details, slug customization, and email/phone
 * verification flows. All routes require artisan `protect` middleware.
 *
 * Mounted at: /api/artisan (singular — authenticated artisan context)
 *
 * Profile:
 *  GET  /profile       — Get own profile (cached 1min)
 *  PUT  /profile       — Update profile fields (invalidates cache)
 *
 * Photo:
 *  POST   /profile/photo — Upload profile photo (multipart, Cloudinary)
 *  DELETE /profile/photo — Remove profile photo
 *
 * Documents:
 *  PUT  /profile/documents       — Update document metadata
 *  POST /profile/documents/upload — Upload verification document (multipart)
 *
 * Verification:
 *  GET /profile/verification-status — Get verification checklist (cached 1min)
 *
 * Bank details:
 *  PUT /profile/bank — Update bank/payout details
 *
 * Slug:
 *  PUT /profile/slug — Update custom URL slug
 *
 * Email/Phone verification:
 *  POST /profile/verify/email/initiate — Send email verification OTP
 *  POST /profile/verify/email/confirm  — Confirm email OTP
 *  POST /profile/verify/phone/initiate — Send phone verification (not configured)
 *  POST /profile/verify/phone/confirm  — Confirm phone OTP (not configured)
 *
 * Includes a local `toTempFile` middleware that converts multer's memory
 * buffer to a temp file for Cloudinary's file-path-based upload API.
 *
 * @see controllers/artisanProfileController.js — Handler implementations
 * @see config/multer.js — imageUpload, documentUpload configs
 * @see middleware/cacheMiddleware.js — Redis cache layer
 */
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { cache, invalidateCache } from '../middleware/cacheMiddleware.js';
import { imageUpload, documentUpload } from '../config/multer.js';
// validation handled in controller; we can add per-route when needed
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  updateDocuments,
  getVerificationStatus,
  updateBankDetails,
  uploadDocument,
  updateSlug,
  initiateEmailVerification,
  confirmEmailVerification,
  initiatePhoneVerification,
  confirmPhoneVerification,
} from '../controllers/artisanProfileController.js';

const router = express.Router();

// For Cloudinary uploader which expects a path, convert memory buffer to temp file
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// middleware to write memory buffer to a temp file with req.file.path
const toTempFile = (req, res, next) => {
  if (!req.file) return next();
  const tmpPath = path.join(os.tmpdir(), `ks_${Date.now()}_${Math.random().toString(16).slice(2)}.bin`);
  fs.writeFile(tmpPath, req.file.buffer, (err) => {
    if (err) return next(err);
    req.file.path = tmpPath;
    next();
  });
};

// GET /api/artisan/profile
router.get('/profile', protect, cache('artisan:profile', 60), getProfile);

// PUT /api/artisan/profile
router.put(
  '/profile',
  protect,
  invalidateCache(['cache:artisan:profile*','cache:artisans:public*','cache:artisans:list*']),
  updateProfile
);

// POST /api/artisan/profile/photo (multipart file: image)
router.post(
  '/profile/photo',
  protect,
  imageUpload.single('image'),
  toTempFile,
  invalidateCache(['cache:artisan:profile*','cache:artisans:public*']),
  uploadProfilePhoto
);

// DELETE /api/artisan/profile/photo
router.delete(
  '/profile/photo',
  protect,
  invalidateCache(['cache:artisan:profile*','cache:artisans:public*']),
  deleteProfilePhoto
);

// PUT /api/artisan/profile/documents
router.put(
  '/profile/documents',
  protect,
  invalidateCache(['cache:artisan:profile*']),
  updateDocuments
);

// GET /api/artisan/profile/verification-status
router.get('/profile/verification-status', protect, cache('artisan:verification', 60), getVerificationStatus);

// PUT /api/artisan/profile/bank
router.put('/profile/bank', protect, invalidateCache(['cache:artisan:profile*']), updateBankDetails);

// POST /api/artisan/profile/documents/upload?type=aadhar|pan|policeVerification|businessLicense|insurance
router.post(
  '/profile/documents/upload',
  protect,
  documentUpload.single('file'),
  toTempFile,
  invalidateCache(['cache:artisan:profile*']),
  uploadDocument
);

// PUT /api/artisan/profile/slug
router.put('/profile/slug', protect, updateSlug);

// Email re-verification
router.post('/profile/verify/email/initiate', protect, initiateEmailVerification);
router.post('/profile/verify/email/confirm', protect, confirmEmailVerification);

// Phone re-verification (not configured)
router.post('/profile/verify/phone/initiate', protect, initiatePhoneVerification);
router.post('/profile/verify/phone/confirm', protect, confirmPhoneVerification);

export default router;
