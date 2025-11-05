import asyncHandler from '../utils/asyncHandler.js';
import CallHistory from '../models/callHistoryModel.js';

export const getCallHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const role = req.user?.role || 'artisan';
  const { limit = 50, offset = 0 } = req.query;
  const filter = role === 'artisan' ? { artisan: userId } : { user: userId };
  const list = await CallHistory.find(filter)
    .sort({ startedAt: -1 })
    .skip(parseInt(offset))
    .limit(Math.min(200, parseInt(limit)))
    .lean();
  res.json({ success: true, data: list });
});


