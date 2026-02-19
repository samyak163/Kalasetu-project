/**
 * @file multer.js — File Upload Middleware Configuration
 *
 * Configures Multer instances for handling multipart/form-data file uploads.
 * Files are stored in memory (Buffer) — NOT on disk — because they're immediately
 * forwarded to Cloudinary for cloud storage.
 *
 * Two upload presets:
 *  1. imageUpload    — Profile photos, portfolio images (JPEG, PNG, WebP)
 *  2. documentUpload — Verification documents (JPEG, PNG, WebP, PDF)
 *
 * Both enforce a 10MB size limit and reject disallowed MIME types
 * with a Multer error that the error middleware translates to a 400 response.
 *
 * Flow: Client → Multer (validate + buffer) → Controller → Cloudinary (upload)
 *
 * @exports {Object} imageUpload    — Multer instance for image files
 * @exports {Object} documentUpload — Multer instance for document files (images + PDF)
 *
 * @requires multer — Express file upload middleware
 *
 * @see routes/uploadRoutes.js — Routes that use these upload instances
 * @see controllers/artisanProfileController.js — Profile photo upload
 * @see controllers/portfolioController.js — Portfolio image upload
 * @see config/cloudinary.js — Where uploaded buffers are sent for cloud storage
 */

import multer from 'multer';

// ----- Allowed MIME Types -----

/** Image-only uploads: profile photos, portfolio gallery, service images */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Document uploads: verification docs can also be PDFs (Aadhar, PAN, certificates) */
const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// ----- Size Limits -----

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOC_SIZE = 10 * 1024 * 1024;   // 10MB

/**
 * Multer instance for image uploads (profile photos, portfolio images).
 * Storage: memory (Buffer) — files are forwarded to Cloudinary, not saved to disk.
 * Accepts: JPEG, PNG, WebP. Max: 10MB.
 */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }
  },
});

/**
 * Multer instance for document uploads (Aadhar, PAN, police verification, etc.).
 * Storage: memory (Buffer) — same as imageUpload but also allows PDF.
 * Accepts: JPEG, PNG, WebP, PDF. Max: 10MB.
 */
export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOC_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_DOC_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }
  },
});
