/**
 * @file videoController.js — Daily.co Video Call Management
 *
 * Creates and manages Daily.co video rooms for artisan-user consultations.
 * All endpoints require `protectAny` (both user types can join calls).
 *
 * Endpoints:
 *  POST   /api/video/room         — Create a new Daily.co room
 *  GET    /api/video/room/:name   — Get room details by name
 *  DELETE /api/video/room/:name   — Delete a room
 *  POST   /api/video/token        — Generate a meeting token for a participant
 *  GET    /api/video/rooms        — List all active rooms (admin/debug)
 *
 * Rooms are created per-booking and named with booking IDs for traceability.
 *
 * @see utils/dailyco.js — Daily.co REST API helpers
 * @see models/bookingModel.js — videoRoomName and videoRoomUrl fields
 * @see kalasetu-frontend/src/pages/VideoCallPage.jsx — Frontend video UI
 */

import asyncHandler from '../utils/asyncHandler.js';
import {
  createDailyRoom,
  getDailyRoom,
  deleteDailyRoom,
  createMeetingToken,
  listDailyRooms,
} from '../utils/dailyco.js';

/**
 * @desc    Create video call room
 * @route   POST /api/video/rooms
 * @access  Protected
 */
export const createRoom = asyncHandler(async (req, res) => {
  const {
    name,
    privacy,
    maxParticipants,
    enableScreenshare,
    enableChat,
    expiresIn, // in seconds (e.g., 3600 for 1 hour)
  } = req.body;

  const userId = req.user._id.toString();

  // Generate unique room name if not provided
  const roomName = name || `room-${userId}-${Date.now()}`;

  // Check if a room with the same name already exists
  if (name) {
    const existingRoom = await getDailyRoom(name);
    if (existingRoom) {
      res.status(409);
      throw new Error(`A room with the name "${name}" already exists`);
    }
  }

  // Calculate expiration timestamp
  const expiresAt = expiresIn
    ? Math.floor(Date.now() / 1000) + expiresIn
    : Math.floor(Date.now() / 1000) + 3600; // Default 1 hour

  const room = await createDailyRoom({
    name: roomName,
    privacy: privacy || 'private',
    maxParticipants: maxParticipants || 10,
    enableScreenshare: enableScreenshare ?? true,
    enableChat: enableChat ?? true,
    expiresAt,
  });

  if (!room) {
    res.status(500);
    throw new Error('Failed to create video room');
  }

  res.status(201).json({
    success: true,
    room: {
      name: room.name,
      url: room.url,
      createdAt: room.created_at,
      config: room.config,
    },
  });
});

/**
 * @desc    Get room details
 * @route   GET /api/video/rooms/:roomName
 * @access  Protected
 */
export const getRoomDetails = asyncHandler(async (req, res) => {
  const { roomName } = req.params;

  const room = await getDailyRoom(roomName);

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  res.json({
    success: true,
    room: {
      name: room.name,
      url: room.url,
      createdAt: room.created_at,
      config: room.config,
    },
  });
});

/**
 * @desc    Delete video room
 * @route   DELETE /api/video/rooms/:roomName
 * @access  Protected
 */
export const deleteRoom = asyncHandler(async (req, res) => {
  const { roomName } = req.params;
  const userId = req.user._id.toString();

  // Only the room creator can delete it (room names follow room-{userId}-{timestamp})
  if (!roomName.startsWith(`room-${userId}-`)) {
    res.status(403);
    throw new Error('Not authorized to delete this room');
  }

  const success = await deleteDailyRoom(roomName);

  if (!success) {
    res.status(500);
    throw new Error('Failed to delete room');
  }

  res.json({
    success: true,
    message: 'Room deleted successfully',
  });
});

/**
 * @desc    Create meeting token
 * @route   POST /api/video/tokens
 * @access  Protected
 */
export const getToken = asyncHandler(async (req, res) => {
  const { roomName, expiresIn } = req.body;

  if (!roomName) {
    res.status(400);
    throw new Error('Room name is required');
  }

  // Verify the room exists before issuing a token
  const room = await getDailyRoom(roomName);
  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  const user = req.user;
  const userId = user._id.toString();
  const userName = user.fullName || user.username;

  // isOwner determined server-side: only the room creator gets owner privileges
  // Room names follow pattern room-{userId}-{timestamp}
  const isOwner = roomName.startsWith(`room-${userId}-`);

  // Calculate expiration timestamp
  const expiresAt = expiresIn
    ? Math.floor(Date.now() / 1000) + Math.min(expiresIn, 7200) // Cap at 2 hours
    : Math.floor(Date.now() / 1000) + 3600; // Default 1 hour

  const token = await createMeetingToken(roomName, {
    userId,
    userName,
    isOwner,
    expiresAt,
  });

  if (!token) {
    res.status(500);
    throw new Error('Failed to create meeting token');
  }

  res.json({
    success: true,
    token,
    roomName,
    userId,
  });
});

/**
 * @desc    List all rooms
 * @route   GET /api/video/rooms
 * @access  Protected
 */
export const listRooms = asyncHandler(async (req, res) => {
  const { limit, endingAfter } = req.query;

  const rooms = await listDailyRooms({
    limit: limit ? parseInt(limit) : 100,
    endingAfter,
  });

  if (!rooms) {
    res.status(500);
    throw new Error('Failed to list rooms');
  }

  res.json({
    success: true,
    count: rooms.length,
    rooms: rooms.map(room => ({
      name: room.name,
      url: room.url,
      createdAt: room.created_at,
      config: room.config,
    })),
  });
});

export default {
  createRoom,
  getRoomDetails,
  deleteRoom,
  getToken,
  listRooms,
};
