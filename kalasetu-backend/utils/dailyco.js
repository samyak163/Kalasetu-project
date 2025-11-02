import Daily from '@daily-co/daily-js';
import { VIDEO_CONFIG } from '../config/env.config.js';

/**
 * Create Daily.co room
 * @param {Object} options - Room options
 * @returns {Promise<Object|null>} Room data
 */
export const createDailyRoom = async (options = {}) => {
  if (!VIDEO_CONFIG.enabled || VIDEO_CONFIG.provider !== 'daily') {
    console.log('⚠️ Daily.co is disabled');
    return null;
  }

  if (!VIDEO_CONFIG.daily.apiKey) {
    console.warn('Daily.co API key is not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VIDEO_CONFIG.daily.apiKey}`,
      },
      body: JSON.stringify({
        name: options.name,
        privacy: options.privacy || 'private', // 'public' | 'private'
        properties: {
          enable_screenshare: options.enableScreenshare ?? true,
          enable_chat: options.enableChat ?? true,
          enable_knocking: options.enableKnocking ?? true,
          enable_prejoin_ui: options.enablePrejoinUI ?? true,
          max_participants: options.maxParticipants || 10,
          exp: options.expiresAt, // Unix timestamp
          ...options.properties,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create room: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Daily.co room created: ${data.name}`);
    return data;
  } catch (error) {
    console.error('❌ Failed to create Daily.co room:', error.message);
    return null;
  }
};

/**
 * Get Daily.co room
 * @param {string} roomName - Room name
 * @returns {Promise<Object|null>} Room data
 */
export const getDailyRoom = async (roomName) => {
  if (!VIDEO_CONFIG.enabled || VIDEO_CONFIG.provider !== 'daily') {
    return null;
  }

  if (!VIDEO_CONFIG.daily.apiKey) {
    console.warn('Daily.co API key is not configured');
    return null;
  }

  try {
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VIDEO_CONFIG.daily.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get room: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to get Daily.co room:', error.message);
    return null;
  }
};

/**
 * Delete Daily.co room
 * @param {string} roomName - Room name
 * @returns {Promise<boolean>} Success
 */
export const deleteDailyRoom = async (roomName) => {
  if (!VIDEO_CONFIG.enabled || VIDEO_CONFIG.provider !== 'daily') {
    return false;
  }

  if (!VIDEO_CONFIG.daily.apiKey) {
    console.warn('Daily.co API key is not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VIDEO_CONFIG.daily.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete room: ${response.statusText}`);
    }

    console.log(`✅ Daily.co room deleted: ${roomName}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete Daily.co room:', error.message);
    return false;
  }
};

/**
 * Create meeting token
 * @param {string} roomName - Room name
 * @param {Object} options - Token options
 * @returns {Promise<string|null>} Meeting token
 */
export const createMeetingToken = async (roomName, options = {}) => {
  if (!VIDEO_CONFIG.enabled || VIDEO_CONFIG.provider !== 'daily') {
    return null;
  }

  if (!VIDEO_CONFIG.daily.apiKey) {
    console.warn('Daily.co API key is not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VIDEO_CONFIG.daily.apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: options.userName,
          user_id: options.userId,
          is_owner: options.isOwner || false,
          enable_screenshare: options.enableScreenshare ?? true,
          enable_recording: options.enableRecording ?? false,
          start_video_off: options.startVideoOff || false,
          start_audio_off: options.startAudioOff || false,
          exp: options.expiresAt, // Unix timestamp
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create token: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Meeting token created for room: ${roomName}`);
    return data.token;
  } catch (error) {
    console.error('❌ Failed to create meeting token:', error.message);
    return null;
  }
};

/**
 * List all rooms
 * @param {Object} options - Query options
 * @returns {Promise<Array|null>} Rooms
 */
export const listDailyRooms = async (options = {}) => {
  if (!VIDEO_CONFIG.enabled || VIDEO_CONFIG.provider !== 'daily') {
    return null;
  }

  if (!VIDEO_CONFIG.daily.apiKey) {
    console.warn('Daily.co API key is not configured');
    return null;
  }

  try {
    const queryParams = new URLSearchParams({
      limit: options.limit || 100,
      ending_after: options.endingAfter || '',
    });

    const response = await fetch(`https://api.daily.co/v1/rooms?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VIDEO_CONFIG.daily.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list rooms: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ Failed to list Daily.co rooms:', error.message);
    return null;
  }
};

export default {
  createDailyRoom,
  getDailyRoom,
  deleteDailyRoom,
  createMeetingToken,
  listDailyRooms,
};
