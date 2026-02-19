/**
 * @file callController.js — Call Initiation & History
 *
 * Manages call lifecycle — initiating calls between artisans and users,
 * and retrieving call history. Uses `protectAny`.
 *
 * Endpoints:
 *  GET  /api/calls/history — Get call history for current user (artisan or user)
 *  POST /api/calls/start   — Start a new call record
 *  PUT  /api/calls/:id/end — End a call and record duration
 *
 * @see models/callHistoryModel.js — Call log schema
 * @see controllers/videoController.js — Daily.co room creation
 */

import asyncHandler from '../utils/asyncHandler.js';
import CallHistory from '../models/callHistoryModel.js';

export const getCallHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { limit = 50, offset = 0 } = req.query;

  // Query both artisan and user fields — the caller may be either type
  // (req.user.role doesn't exist on Artisan/User models, so use $or)
  const list = await CallHistory.find({
    $or: [{ artisan: userId }, { user: userId }],
  })
    .sort({ startedAt: -1 })
    .skip(parseInt(offset))
    .limit(Math.min(200, parseInt(limit)))
    .lean();
  res.json({ success: true, data: list });
});


