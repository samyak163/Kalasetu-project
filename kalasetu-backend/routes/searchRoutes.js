/**
 * @file searchRoutes.js — Search & Discovery Routes
 *
 * Public search endpoints powered by MongoDB text search and Algolia.
 * Rate-limited to 500 requests/minute per IP to prevent abuse while
 * allowing aggressive autocomplete/typeahead usage.
 *
 * Mounted at: /api/search
 *
 * Routes (all public, rate-limited):
 *  GET /artisans    — Search artisans with filters (location, category, etc.)
 *  GET /suggestions — Typeahead suggestions for search input
 *  GET /facets      — Get filter facets (categories, locations, price ranges)
 *  GET /            — Combined search (artisans + categories) — must be last
 *
 * Route order matters: specific routes (/artisans, /suggestions, /facets)
 * must precede the catch-all / route.
 *
 * @see controllers/searchController.js — Handler implementations
 */
import express from 'express';
import { searchArtisans, getSearchFacets, getSearchSuggestions, getTrendingSearches, search } from '../controllers/searchController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500, // Increased from 120 to 500 search requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Specific routes first (more specific before less specific)
router.get('/artisans', searchLimiter, searchArtisans);
router.get('/suggestions', searchLimiter, getSearchSuggestions);
router.get('/facets', searchLimiter, getSearchFacets);
router.get('/trending', searchLimiter, getTrendingSearches);
// Main search endpoint (returns artisans + categories) - must be last
router.get('/', searchLimiter, search);

export default router;

