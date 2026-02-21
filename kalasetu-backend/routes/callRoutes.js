/**
 * @file callRoutes.js — Voice Call Routes (Legacy)
 *
 * Single endpoint for artisan-side call history. This is a legacy route
 * file; newer call history is handled by callHistoryRoutes.js which
 * supports both user types.
 *
 * Mounted at: /api/calls
 *
 * Routes:
 *  GET /history — Get artisan's call history (protect — artisan only)
 *
 * @see controllers/callController.js — Handler implementation
 * @see routes/callHistoryRoutes.js — Newer dual-auth call history
 */
import express from 'express';
import { protectAny } from '../middleware/authMiddleware.js';
import { getCallHistory } from '../controllers/callController.js';

const router = express.Router();

// protectAny: both artisans and users can view their call history
// getCallHistory is already wrapped in asyncHandler at its definition
router.get('/history', protectAny, getCallHistory);

export default router;


