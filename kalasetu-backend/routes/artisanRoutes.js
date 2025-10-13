import express from 'express';
const router = express.Router();
import {
    registerArtisan,
    loginArtisan,
    getAllArtisans,
    getArtisanById,
    getArtisanByPublicId, // <-- THE UPGRADE: Import the new function
} from '../controllers/artisanController.js';

// --- Authentication Routes ---
// URL: POST /api/artisans/register
router.post('/register', registerArtisan);

// URL: POST /api/artisans/login
router.post('/login', loginArtisan);

// --- Public Data Routes ---
// URL: GET /api/artisans
router.get('/', getAllArtisans);

// We keep the old ID route for internal use, but we give it a more specific URL
// URL: GET /api/artisans/id/60d21b4...
router.get('/id/:id', getArtisanById);

// --- THE UPGRADE: The New Public Vanity URL Route! ---
// This is the one we will use for our public profiles.
// URL: GET /api/artisans/ks_a1b2c3d4
router.get('/:publicId', getArtisanByPublicId);

export default router;