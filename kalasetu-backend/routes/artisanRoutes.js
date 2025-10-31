import express from 'express';
const router = express.Router();
import {
    getAllArtisans,
    getArtisanById,
    getArtisanByPublicId,
} from '../controllers/artisanController.js';

// --- Public Data Routes ---
// URL: GET /api/artisans
router.get('/', getAllArtisans);

// We keep the old ID route for internal use, but we give it a more specific URL
// URL: GET /api/artisans/id/60d21b4...
router.get('/id/:id', getArtisanById);

// --- THE PUBLIC VANITY URL ROUTE ---
// This is the one we will use for our public profiles.
// URL: GET /api/artisans/ks_a1b2c3d4
router.get('/:publicId', getArtisanByPublicId);

export default router;