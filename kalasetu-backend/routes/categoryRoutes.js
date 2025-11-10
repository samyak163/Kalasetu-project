import express from 'express';
import { getCategories, getCategoryServices, getServiceSuggestions } from '../controllers/categoryController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(getCategories));
router.get('/suggestions/services/all', asyncHandler(getServiceSuggestions));
router.get('/:id/services', asyncHandler(getCategoryServices));

export default router;


