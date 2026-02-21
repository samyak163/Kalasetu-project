/**
 * @file callHistoryRoutes.js — Call History CRUD Routes
 *
 * Records and retrieves video/voice call history for both artisans and
 * users. Uses a custom auth middleware that tries artisan protect first,
 * then falls back to userProtect — a manual "protectAny" implementation
 * (predates the centralized protectAny middleware).
 *
 * Mounted at: /api/call-history
 *
 * Routes (custom dual-auth):
 *  GET  /     — List call history for authenticated user
 *  POST /     — Create a call history entry
 *  PUT  /:id  — Update a call history entry (duration, status)
 *
 * @see controllers/callHistoryController.js — Handler implementations
 * @see models/callHistoryModel.js — CallHistory schema
 */
import express from 'express';
import {
  getCallHistory,
  createCallHistory,
  updateCallHistory,
} from '../controllers/callHistoryController.js';
import { protectAny } from '../middleware/authMiddleware.js';

const router = express.Router();

// protectAny properly handles dual-auth (tries User first, then Artisan, sets req.accountType)
// Replaces a broken custom middleware that used try/catch on protect/userProtect
// (Express auth middlewares send responses on failure instead of throwing,
// so the catch-based fallback never executed)
router.use(protectAny);

router.route('/').get(getCallHistory).post(createCallHistory);

router.route('/:id').put(updateCallHistory);

export default router;
