import asyncHandler from '../utils/asyncHandler.js';
import CallHistory from '../models/callHistoryModel.js';

// @desc    Get call history for logged-in user
// @route   GET /api/calls/history
// @access  Private
export const getCallHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;

  const calls = await CallHistory.find({
    $or: [{ user: userId }, { artisan: userId }],
  })
    .populate('user', 'fullName email profileImageUrl')
    .populate('artisan', 'fullName email profileImageUrl craft')
    .sort({ startedAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await CallHistory.countDocuments({
    $or: [{ user: userId }, { artisan: userId }],
  });

  res.status(200).json({
    success: true,
    data: calls,
    count: calls.length,
    total,
  });
});

// @desc    Create call history entry
// @route   POST /api/calls/history
// @access  Private
export const createCallHistory = asyncHandler(async (req, res) => {
  const { roomName, artisanId, userId, startedAt } = req.body;

  const call = await CallHistory.create({
    roomName,
    user: userId || req.user._id,
    artisan: artisanId,
    startedAt: startedAt || new Date(),
    status: 'active',
  });

  res.status(201).json({
    success: true,
    data: call,
  });
});

// @desc    Update call history (end call)
// @route   PUT /api/calls/history/:id
// @access  Private
export const updateCallHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { endedAt, durationSec, status } = req.body;

  const call = await CallHistory.findById(id);

  if (!call) {
    res.status(404);
    throw new Error('Call history not found');
  }

  // Check authorization
  if (
    call.user.toString() !== req.user._id.toString() &&
    call.artisan?.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to update this call');
  }

  call.endedAt = endedAt || new Date();
  call.durationSec = durationSec || Math.floor((new Date(call.endedAt) - new Date(call.startedAt)) / 1000);
  call.status = status || 'completed';

  await call.save();

  res.status(200).json({
    success: true,
    data: call,
  });
});
