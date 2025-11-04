import express from 'express';
import { searchArtisans, getSearchFacets, getSearchSuggestions } from '../controllers/searchController.js';

const router = express.Router();

router.get('/artisans', searchArtisans);
router.get('/suggestions', getSearchSuggestions);
router.get('/facets', getSearchFacets);

export default router;

