import DailyIframe from '@daily-co/daily-js';
import { VIDEO_CONFIG } from '../config/env.config';
import axios from './axios';

/**
 * Create video room
 * @param {Object} options - Room options
 * @returns {Promise<Object>} Room data
 */
export const createVideoRoom = async (options = {}) => {
  try {
    const { data } = await axios.post('/api/video/rooms', {
      name: options.name,
      privacy: options.privacy || 'private',
      maxParticipants: options.maxParticipants || 10,
      enableScreenshare: options.enableScreenshare ?? true,
      enableChat: options.enableChat ?? true,
      expiresIn: options.expiresIn || 3600, // 1 hour default
    });
    return data.room;
  } catch (error) {
    console.error('Failed to create video room:', error);
    throw error;
  }
};

/**
 * Get room details
 * @param {string} roomName - Room name
 * @returns {Promise<Object>} Room data
 */
export const getVideoRoom = async (roomName) => {
  try {
    const { data } = await axios.get(`/api/video/rooms/${roomName}`);
    return data.room;
  } catch (error) {
    console.error('Failed to get video room:', error);
    throw error;
  }
};

/**
 * Delete video room
 * @param {string} roomName - Room name
 * @returns {Promise<boolean>} Success
 */
export const deleteVideoRoom = async (roomName) => {
  try {
    await axios.delete(`/api/video/rooms/${roomName}`);
    return true;
  } catch (error) {
    console.error('Failed to delete video room:', error);
    throw error;
  }
};

/**
 * Get meeting token
 * @param {string} roomName - Room name
 * @param {Object} options - Token options
 * @returns {Promise<string>} Meeting token
 */
export const getMeetingToken = async (roomName, options = {}) => {
  try {
    const { data } = await axios.post('/api/video/tokens', {
      roomName,
      isOwner: options.isOwner || false,
      expiresIn: options.expiresIn || 3600,
    });
    return data.token;
  } catch (error) {
    console.error('Failed to get meeting token:', error);
    throw error;
  }
};

/**
 * List all rooms
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Rooms
 */
export const listVideoRooms = async (options = {}) => {
  try {
    const { data } = await axios.get('/api/video/rooms', {
      params: {
        limit: options.limit || 100,
        endingAfter: options.endingAfter,
      },
    });
    return data.rooms;
  } catch (error) {
    console.error('Failed to list video rooms:', error);
    throw error;
  }
};

/**
 * Create Daily call object
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Call options
 * @returns {DailyCall} Daily call object
 */
export const createDailyCall = (container, options = {}) => {
  if (!VIDEO_CONFIG.enabled || VIDEO_CONFIG.provider !== 'daily') {
    console.warn('Daily.co is disabled');
    return null;
  }

  try {
    const callObject = DailyIframe.createFrame(container, {
      showLeaveButton: options.showLeaveButton ?? true,
      showFullscreenButton: options.showFullscreenButton ?? true,
      iframeStyle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        border: '0',
        borderRadius: '8px',
      },
    });

    return callObject;
  } catch (error) {
    console.error('Failed to create Daily call:', error);
    return null;
  }
};

/**
 * Join video call
 * @param {DailyCall} callObject - Daily call object
 * @param {string} url - Room URL
 * @param {string} token - Meeting token (optional)
 * @returns {Promise<void>}
 */
export const joinVideoCall = async (callObject, url, token = null) => {
  try {
    await callObject.join({
      url,
      token,
    });
    console.log('✅ Joined video call:', url);
  } catch (error) {
    console.error('❌ Failed to join video call:', error);
    throw error;
  }
};

/**
 * Leave video call
 * @param {DailyCall} callObject - Daily call object
 * @returns {Promise<void>}
 */
export const leaveVideoCall = async (callObject) => {
  try {
    await callObject.leave();
    await callObject.destroy();
    console.log('✅ Left video call');
  } catch (error) {
    console.error('❌ Failed to leave video call:', error);
    throw error;
  }
};

export default {
  createVideoRoom,
  getVideoRoom,
  deleteVideoRoom,
  getMeetingToken,
  listVideoRooms,
  createDailyCall,
  joinVideoCall,
  leaveVideoCall,
};
