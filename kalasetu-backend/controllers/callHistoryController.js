/**
 * @file callHistoryController.js — Call History Retrieval
 *
 * Provides paginated call history for the current user.
 * Queries both artisan and user fields to find calls regardless of role.
 * Requires `protectAny`.
 *
 * Endpoints:
 *  GET /api/calls/history — Paginated call history with participant details
 *
 * @see models/callHistoryModel.js — Call log schema
 * @see callController.js — Call initiation (creates history entries)
 */

import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import CallHistory from '../models/callHistoryModel.js';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';

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
  const { roomName, artisanId } = req.body;
  const callerId = req.user._id;

  if (!roomName) {
    res.status(400);
    throw new Error('Room name is required');
  }

  if (!artisanId || !mongoose.Types.ObjectId.isValid(artisanId)) {
    res.status(400);
    throw new Error('Valid artisan ID is required');
  }

  // Verify the artisan exists (prevents spoofed call records)
  const artisanExists = await Artisan.exists({ _id: artisanId });
  if (!artisanExists) {
    res.status(404);
    throw new Error('Artisan not found');
  }

  // Determine user vs artisan based on req.accountType (set by protectAny)
  // If the caller is an artisan, they are the artisan field; otherwise they are the user field
  const isCallerArtisan = req.accountType === 'artisan' || callerId.toString() === artisanId;

  const call = await CallHistory.create({
    roomName,
    user: isCallerArtisan ? undefined : callerId,
    artisan: isCallerArtisan ? callerId : artisanId,
    startedAt: new Date(),
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
