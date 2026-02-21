/**
 * @file cloudinary.js — Cloudinary SDK Configuration
 *
 * Initializes the Cloudinary v2 SDK with server-side credentials.
 * Exports a configured instance ready for image upload, transformation, and deletion.
 *
 * Used by:
 *  - utils/cloudinary.js     — Upload helper functions (signed uploads, transformations)
 *  - controllers/*            — Profile photos, portfolio images, service images
 *  - routes/uploadRoutes.js   — Generates signed upload URLs for the frontend
 *
 * Cloudinary handles:
 *  - Profile photo uploads (artisans and users)
 *  - Portfolio/gallery image hosting
 *  - Automatic image optimization (quality: auto, format: auto via env.config.js)
 *  - Image transformations (resize, crop, thumbnails)
 *
 * @exports {Object} cloudinary — Configured Cloudinary v2 SDK instance
 *
 * @requires cloudinary — Cloudinary Node.js SDK (v2)
 * @requires ./env.config.js — CLOUDINARY_CONFIG (cloudName, apiKey, apiSecret)
 *
 * @see env.config.js — Where Cloudinary credentials and defaults are defined
 * @see utils/cloudinary.js — Upload/transform helper functions consuming this instance
 */

import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CONFIG } from './env.config.js';

cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.cloudName,
  api_key: CLOUDINARY_CONFIG.apiKey,
  api_secret: CLOUDINARY_CONFIG.apiSecret,
});

export default cloudinary;
