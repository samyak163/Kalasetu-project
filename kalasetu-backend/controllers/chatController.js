/**
 * @file chatController.js — Stream Chat Integration
 *
 * Manages real-time messaging between artisans and users via Stream Chat SDK.
 * All endpoints require `protectAny` (both user types can chat).
 *
 * Endpoints:
 *  POST /api/chat/token        — Generate Stream Chat client token for current user
 *  POST /api/chat/channel      — Create/get a DM channel between two participants
 *  GET  /api/chat/channels     — List channels for current user
 *  POST /api/chat/channel/:id/members — Add members to a channel
 *  DELETE /api/chat/channel/:id/members — Remove members from a channel
 *
 * Stream Chat user IDs are mapped to KalaSetu MongoDB ObjectIds.
 * Users are upserted in Stream when they first request a token.
 *
 * @see utils/streamChat.js — Stream Chat SDK helpers
 * @see kalasetu-frontend/src/context/ChatContext.jsx — Frontend chat state
 */

import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createStreamUserToken,
  upsertStreamUser,
  createDirectMessageChannel,
  queryChannels,
  addChannelMembers,
  removeChannelMembers,
} from '../utils/streamChat.js';
import User from '../models/userModel.js';
import Artisan from '../models/artisanModel.js';

/**
 * @desc    Get Stream Chat token for user
 * @route   GET /api/chat/token
 * @access  Protected (artisan or USER)
 */
export const getChatToken = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  // Upsert user in Stream and validate the result
  const upsertResult = await upsertStreamUser(req.user);

  if (!upsertResult) {
    res.status(503);
    throw new Error('Chat service is currently unavailable');
  }

  // Generate token
  const token = createStreamUserToken(userId, 86400); // 24 hours

  if (!token) {
    res.status(500);
    throw new Error('Failed to generate chat token');
  }

  res.json({
    success: true,
    token,
    userId,
  });
});

/**
 * @desc    Create direct message channel
 * @route   POST /api/chat/channels/dm
 * @access  Protected
 */
export const createDMChannel = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  const userId = req.user._id.toString();

  if (!recipientId) {
    res.status(400);
    throw new Error('Recipient ID is required');
  }

  // Validate recipientId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(recipientId)) {
    res.status(400);
    throw new Error('Invalid recipient ID format');
  }

  if (recipientId === userId) {
    res.status(400);
    throw new Error('Cannot create DM channel with yourself');
  }

  // Validate recipient exists in the database (check both User and Artisan collections)
  const recipientUser = await User.findById(recipientId).select('_id');
  const recipientArtisan = await Artisan.findById(recipientId).select('_id');

  if (!recipientUser && !recipientArtisan) {
    res.status(404);
    throw new Error('Recipient not found');
  }

  const channel = await createDirectMessageChannel(userId, recipientId);

  if (!channel) {
    res.status(500);
    throw new Error('Failed to create DM channel');
  }

  res.status(201).json({
    success: true,
    channelId: channel.id,
    channelType: channel.type,
    channel: {
      id: channel.id,
      type: channel.type,
      cid: channel.cid,
    },
  });
});

/**
 * @desc    Get user's channels
 * @route   GET /api/chat/channels
 * @access  Protected
 */
export const getUserChannels = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { limit = 20, offset = 0 } = req.query;

  const channels = await queryChannels(
    { members: { $in: [userId] } },
    { last_message_at: -1 },
    { limit: parseInt(limit), offset: parseInt(offset) }
  );

  if (!channels) {
    res.status(500);
    throw new Error('Failed to fetch channels');
  }

  res.json({
    success: true,
    count: channels.length,
    channels: channels.map((channel) => ({
      id: channel.id,
      type: channel.type,
      cid: channel.cid,
      name: channel.data.name,
      image: channel.data.image,
      memberCount: Object.keys(channel.state.members).length,
      lastMessage: channel.state.messages[channel.state.messages.length - 1],
      unreadCount: channel.countUnread(),
    })),
  });
});

/**
 * @desc    Add members to channel
 * @route   POST /api/chat/channels/:channelType/:channelId/members
 * @access  Protected
 */
export const addMembers = asyncHandler(async (req, res) => {
  const { channelType, channelId } = req.params;
  const { memberIds } = req.body;
  const userId = req.user._id.toString();

  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    res.status(400);
    throw new Error('Member IDs array is required');
  }

  // Verify the requesting user is already a member of this channel
  // (server-side SDK bypasses Stream's client auth, so we must validate here)
  const channels = await queryChannels(
    { type: channelType, id: channelId, members: { $in: [userId] } },
    {},
    { limit: 1 }
  );
  if (!channels || channels.length === 0) {
    res.status(403);
    throw new Error('Not authorized — you must be a channel member to add others');
  }

  const response = await addChannelMembers(channelType, channelId, memberIds);

  if (!response) {
    res.status(500);
    throw new Error('Failed to add members');
  }

  res.json({
    success: true,
    message: 'Members added successfully',
    members: response.members,
  });
});

/**
 * @desc    Remove members from channel
 * @route   DELETE /api/chat/channels/:channelType/:channelId/members
 * @access  Protected
 */
export const removeMembers = asyncHandler(async (req, res) => {
  const { channelType, channelId } = req.params;
  const { memberIds } = req.body;
  const userId = req.user._id.toString();

  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    res.status(400);
    throw new Error('Member IDs array is required');
  }

  // Verify the requesting user is already a member of this channel
  const channels = await queryChannels(
    { type: channelType, id: channelId, members: { $in: [userId] } },
    {},
    { limit: 1 }
  );
  if (!channels || channels.length === 0) {
    res.status(403);
    throw new Error('Not authorized — you must be a channel member to remove others');
  }

  const response = await removeChannelMembers(channelType, channelId, memberIds);

  if (!response) {
    res.status(500);
    throw new Error('Failed to remove members');
  }

  res.json({
    success: true,
    message: 'Members removed successfully',
  });
});

export default {
  getChatToken,
  createDMChannel,
  getUserChannels,
  addMembers,
  removeMembers,
};
