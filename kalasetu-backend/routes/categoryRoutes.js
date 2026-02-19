/**
 * @file categoryRoutes.js — Category & Service Discovery Routes
 *
 * Public endpoints for browsing the service category taxonomy.
 * Categories are seeded via `npm run seed:core` and rarely change.
 *
 * Mounted at: /api/categories
 *
 * Routes (all public):
 *  GET /                        — List all categories (flat or tree)
 *  GET /suggestions/services/all — Service name suggestions (autocomplete)
 *  GET /:id/services            — List services under a category
 *
 * @see controllers/categoryController.js — Handler implementations
 * @see models/categoryModel.js — Category schema (hierarchical)
 */
import express from 'express';
import { getCategories, getCategoryServices, getServiceSuggestions } from '../controllers/categoryController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(getCategories));
router.get('/suggestions/services/all', asyncHandler(getServiceSuggestions));
router.get('/:id/services', asyncHandler(getCategoryServices));

export default router;


