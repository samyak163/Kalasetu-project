import express from 'express';
import { searchArtisans, getSearchFacets } from '../controllers/searchController.js';

const router = express.Router();

router.get('/artisans', searchArtisans);
router.get('/facets', getSearchFacets);

export default router;

