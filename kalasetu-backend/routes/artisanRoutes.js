/**
 * @file artisanRoutes.js — Public Artisan Data Routes
 *
 * Serves public-facing artisan data: directory listing, profile lookup by
 * publicId/slug, geospatial "nearby" search, and featured artisans. Most
 * routes are cached in Redis (60–300s) for performance.
 *
 * Mounted at: /api/artisans
 *
 * Public routes (no auth):
 *  GET /                    — List all artisans (cached 5min)
 *  GET /id/:id              — Get artisan by MongoDB _id
 *  GET /featured            — Top-rated active artisans (cached 5min)
 *  GET /nearby              — Geospatial search (cached 1min)
 *  GET /:publicId/portfolio     — Public portfolio for an artisan (cached 5min)
 *  GET /:publicId/availability  — Available time slots for a date (cached 1min)
 *  GET /:publicId               — Get artisan by vanity publicId (cached 5min)
 *  GET /slug/:slug              — Get artisan by URL slug (cached 5min)
 *
 * Protected routes:
 *  PUT /profile — Update own profile (artisan protect, invalidates cache)
 *
 * Route order matters: /featured and /nearby must precede /:publicId
 * to avoid the param route capturing them as publicId values.
 *
 * @see controllers/artisanController.js — Public artisan data handlers
 * @see controllers/portfolioController.js — getPublicPortfolio handler
 * @see middleware/cacheMiddleware.js — Redis cache layer
 */
import express from 'express';
const router = express.Router();
import {
    getAllArtisans,
    getArtisanById,
    getArtisanByPublicId,
    getNearbyArtisans,
    updateArtisanProfile,
    getFeaturedArtisans,
    PUBLIC_FIELDS,
} from '../controllers/artisanController.js';
import { getPublicPortfolio } from '../controllers/portfolioController.js';
import { getAvailability } from '../controllers/availabilityController.js';
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

// Featured artisans for homepage (top-rated active artisans)
// URL: GET /api/artisans/featured
router.get('/featured', cache('artisans:featured', 300), getFeaturedArtisans);

// Nearby artisans using geospatial query
// URL: GET /api/artisans/nearby?lat=..&lng=..&radiusKm=10&limit=20
router.get('/nearby', cache('artisans:nearby', 60), getNearbyArtisans);

// Update artisan profile (authenticated)
// URL: PUT /api/artisans/profile
router.put('/profile', protect, invalidateCache(['cache:artisans:list*', 'cache:artisans:public*', 'cache:artisans:nearby*']), updateArtisanProfile);

// Public portfolio endpoint (must be before :publicId route)
// URL: GET /api/artisans/:publicId/portfolio
router.get('/:publicId/portfolio', cache('artisans:portfolio', 300), getPublicPortfolio);

// Public availability endpoint — returns time slots for a date
// Short cache (60s) since availability changes with bookings
// URL: GET /api/artisans/:publicId/availability?date=2026-02-20
router.get('/:publicId/availability', cache('artisans:availability', 60), getAvailability);

// Slug-based lookup — MUST be before /:publicId to avoid 'slug' matching as a publicId
// URL: GET /api/artisans/slug/ravi-kumar-pottery
router.get('/slug/:slug', cache('artisans:public', 300), asyncHandler(async (req, res) => {
    const artisan = await Artisan.findOne({ slug: req.params.slug }).select(PUBLIC_FIELDS);
    if (!artisan) return res.status(404).json({ message: 'Artisan not found' });
    res.json(artisan);
}));

// --- THE PUBLIC VANITY URL ROUTE ---
// This is the one we will use for our public profiles.
// URL: GET /api/artisans/ks_a1b2c3d4
router.get('/:publicId', cache('artisans:public', 300), getArtisanByPublicId);

export default router;