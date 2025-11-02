import { StreamChat } from 'stream-chat';
import { CHAT_CONFIG } from '../config/env.config';
import axios from './axios';

let streamClient = null;

/**
 * Initialize Stream Chat client
 * @param {string} userId - User ID
 * @param {string} token - Chat token from backend
 * @param {Object} user - User object
 * @returns {Promise<StreamChat|null>}
 */
export const initStreamChat = async (userId, token, user) => {
  if (!CHAT_CONFIG.enabled || CHAT_CONFIG.provider !== 'stream') {
    console.log('⚠️ Stream Chat is disabled');
    return null;
  }

  if (!CHAT_CONFIG.stream.apiKey) {
    console.warn('Stream Chat API key is not configured');
    return null;
  }

  try {
    // Initialize client
    streamClient = StreamChat.getInstance(CHAT_CONFIG.stream.apiKey);

    // Connect user
    await streamClient.connectUser(
      {
        id: userId,
        name: user.fullName || user.username,
        image: user.profileImage || user.avatar,
        role: user.role || 'user',
        accountType: user.accountType || user.role,
      },
      token
    );

    console.log('✅ Stream Chat connected:', userId);
    return streamClient;
  } catch (error) {
    console.error('❌ Failed to initialize Stream Chat:', error);
    return null;
  }
};

/**
 * Get Stream Chat client instance
 * @returns {StreamChat|null}
 */
export const getStreamClient = () => {
  return streamClient;
};

/**
 * Disconnect Stream Chat
 */
export const disconnectStreamChat = async () => {
  if (streamClient) {
    try {
      await streamClient.disconnectUser();
      streamClient = null;
      console.log('✅ Stream Chat disconnected');
    } catch (error) {
      console.error('❌ Failed to disconnect Stream Chat:', error);
    }
  }
};

/**
 * Get chat token from backend
 * @returns {Promise<Object>} { token, userId }
 */
export const getChatToken = async () => {
  try {
    const { data } = await axios.get('/api/chat/token');
    return data;
  } catch (error) {
    console.error('Failed to get chat token:', error);
    throw error;
  }
};

/**
 * Create direct message channel
 * @param {string} recipientId - Recipient user ID
 * @returns {Promise<Object>} Channel data
 */
export const createDMChannel = async (recipientId) => {
  try {
    const { data } = await axios.post('/api/chat/channels/dm', { recipientId });
    return data;
  } catch (error) {
    console.error('Failed to create DM channel:', error);
    throw error;
  }
};

/**
 * Get user's channels
 * @param {number} limit - Limit
 * @param {number} offset - Offset
 * @returns {Promise<Array>} Channels
 */
export const getUserChannels = async (limit = 20, offset = 0) => {
  try {
    const { data } = await axios.get('/api/chat/channels', {
      params: { limit, offset },
    });
    return data.channels;
  } catch (error) {
    console.error('Failed to get channels:', error);
    throw error;
  }
};

/**
 * Add members to channel
 * @param {string} channelType - Channel type
 * @param {string} channelId - Channel ID
 * @param {Array<string>} memberIds - Member IDs
 * @returns {Promise<Object>} Response
 */
export const addChannelMembers = async (channelType, channelId, memberIds) => {
  try {
    const { data } = await axios.post(
      `/api/chat/channels/${channelType}/${channelId}/members`,
      { memberIds }
    );
    return data;
  } catch (error) {
    console.error('Failed to add members:', error);
    throw error;
  }
};

/**
 * Remove members from channel
 * @param {string} channelType - Channel type
 * @param {string} channelId - Channel ID
 * @param {Array<string>} memberIds - Member IDs
 * @returns {Promise<Object>} Response
 */
export const removeChannelMembers = async (channelType, channelId, memberIds) => {
  try {
    const { data } = await axios.delete(
      `/api/chat/channels/${channelType}/${channelId}/members`,
      { data: { memberIds } }
    );
    return data;
  } catch (error) {
    console.error('Failed to remove members:', error);
    throw error;
  }
};

export default {
  initStreamChat,
  getStreamClient,
  disconnectStreamChat,
  getChatToken,
  createDMChannel,
  getUserChannels,
  addChannelMembers,
  removeChannelMembers,
};
