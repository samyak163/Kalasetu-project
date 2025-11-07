import express from 'express';
const router = express.Router();
import {
    getAllArtisans,
    getArtisanById,
    getArtisanByPublicId,
    getNearbyArtisans,
    updateArtisanProfile,
} from '../controllers/artisanController.js';
import { getPublicPortfolio } from '../controllers/portfolioController.js';
import Artisan from '../models/artisanModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cache, invalidateCache } from '../middleware/cacheMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

// --- Public Data Routes ---
// URL: GET /api/artisans
router.get('/', cache('artisans:list', 300), getAllArtisans);

// We keep the old ID route for internal use, but we give it a more specific URL
// URL: GET /api/artisans/id/60d21b4...
router.get('/id/:id', getArtisanById);

// Nearby artisans using geospatial query
// URL: GET /api/artisans/nearby?lat=..&lng=..&radiusKm=10&limit=20
router.get('/nearby', cache('artisans:nearby', 60), getNearbyArtisans);

// Update artisan profile (authenticated)
// URL: PUT /api/artisans/profile
router.put('/profile', protect, invalidateCache(['cache:artisans:list*', 'cache:artisans:public*', 'cache:artisans:nearby*']), updateArtisanProfile);

// Public portfolio endpoint (must be before :publicId route)
// URL: GET /api/artisans/:publicId/portfolio
router.get('/:publicId/portfolio', cache('artisans:portfolio', 300), getPublicPortfolio);

// --- THE PUBLIC VANITY URL ROUTE ---
// This is the one we will use for our public profiles.
// URL: GET /api/artisans/ks_a1b2c3d4
router.get('/:publicId', cache('artisans:public', 300), getArtisanByPublicId);

// NEW: Fetch by slug without conflicting with other routes
// URL: GET /api/artisans/slug/:slug
router.get('/slug/:slug', cache('artisans:public', 300), asyncHandler(async (req, res) => {
    const artisan = await Artisan.findOne({ slug: req.params.slug }).select('-password');
    if (!artisan) return res.status(404).json({ message: 'Artisan not found' });
    res.json(artisan);
}));

export default router;