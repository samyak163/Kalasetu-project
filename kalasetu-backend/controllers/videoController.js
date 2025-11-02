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
  const { roomName, isOwner, expiresIn } = req.body;

  if (!roomName) {
    res.status(400);
    throw new Error('Room name is required');
  }

  const user = req.user;
  const userId = user._id.toString();
  const userName = user.fullName || user.username;

  // Calculate expiration timestamp
  const expiresAt = expiresIn 
    ? Math.floor(Date.now() / 1000) + expiresIn 
    : Math.floor(Date.now() / 1000) + 3600; // Default 1 hour

  const token = await createMeetingToken(roomName, {
    userId,
    userName,
    isOwner: isOwner || false,
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
