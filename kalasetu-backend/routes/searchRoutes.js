import express from 'express';
import { searchArtisans, getSearchFacets, getSearchSuggestions, search } from '../controllers/searchController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // allow up to 120 search requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Specific routes first (more specific before less specific)
router.get('/artisans', searchLimiter, searchArtisans);
router.get('/suggestions', searchLimiter, getSearchSuggestions);
router.get('/facets', searchLimiter, getSearchFacets);
// Main search endpoint (returns artisans + categories) - must be last
router.get('/', searchLimiter, search);

export default router;

