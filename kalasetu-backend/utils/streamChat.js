import { StreamChat } from 'stream-chat';
import { CHAT_CONFIG } from '../config/env.config.js';

let streamClient = null;

/**
 * Initialize Stream Chat client
 * @returns {StreamChat|null} Stream client or null
 */
export const initStreamChat = () => {
  if (!CHAT_CONFIG.enabled || CHAT_CONFIG.provider !== 'stream') {
    console.log('⚠️ Stream Chat is disabled');
    return null;
  }

  if (!CHAT_CONFIG.stream.apiKey || !CHAT_CONFIG.stream.apiSecret) {
    console.warn('Stream Chat credentials are not configured');
    return null;
  }

  try {
    streamClient = StreamChat.getInstance(
      CHAT_CONFIG.stream.apiKey,
      CHAT_CONFIG.stream.apiSecret
    );

    console.log('✅ Stream Chat initialized');
    return streamClient;
  } catch (error) {
    console.error('❌ Failed to initialize Stream Chat:', error.message);
    return null;
  }
};

/**
 * Get Stream Chat client instance
 * @returns {StreamChat|null}
 */
export const getStreamClient = () => {
  if (!streamClient) {
    return initStreamChat();
  }
  return streamClient;
};

/**
 * Create Stream user token
 * @param {string} userId - User ID
 * @param {number} expiresIn - Token expiration in seconds (default: 1 hour)
 * @returns {string|null} User token
 */
export const createStreamUserToken = (userId, expiresIn = 3600) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const token = client.createToken(userId, expiresIn);
    return token;
  } catch (error) {
    console.error('❌ Failed to create Stream user token:', error.message);
    return null;
  }
};

/**
 * Upsert Stream user (create or update)
 * @param {Object} user - User object
 * @returns {Promise<Object|null>} Response
 */
export const upsertStreamUser = async (user) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const response = await client.upsertUser({
      id: user.id || user._id.toString(),
      name: user.fullName || user.username,
      image: user.profileImage || user.avatar,
      role: user.role || 'user',
      // Custom fields
      email: user.email,
      accountType: user.accountType || user.role,
      verified: user.verified || false,
    });

    console.log(`✅ Stream user upserted: ${user.id || user._id}`);
    return response;
  } catch (error) {
    console.error('❌ Failed to upsert Stream user:', error.message);
    return null;
  }
};

/**
 * Delete Stream user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Response
 */
export const deleteStreamUser = async (userId) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const response = await client.deleteUser(userId, {
      mark_messages_deleted: true,
      hard_delete: false,
    });

    console.log(`✅ Stream user deleted: ${userId}`);
    return response;
  } catch (error) {
    console.error('❌ Failed to delete Stream user:', error.message);
    return null;
  }
};

/**
 * Create or get a channel
 * @param {string} type - Channel type (e.g., 'messaging')
 * @param {string} channelId - Channel ID
 * @param {Object} data - Channel data
 * @returns {Promise<Object|null>} Channel
 */
export const getOrCreateChannel = async (type, channelId, data = {}) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const channel = client.channel(type, channelId, data);
    await channel.create();
    
    console.log(`✅ Channel created/retrieved: ${channelId}`);
    return channel;
  } catch (error) {
    console.error('❌ Failed to get/create channel:', error.message);
    return null;
  }
};

/**
 * Create direct messaging channel between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<Object|null>} Channel
 */
export const createDirectMessageChannel = async (userId1, userId2) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const channelId = [userId1, userId2].sort().join('-');
    const channel = client.channel('messaging', channelId, {
      members: [userId1, userId2],
      created_by_id: userId1,
    });

    await channel.create();
    console.log(`✅ DM channel created: ${channelId}`);
    return channel;
  } catch (error) {
    console.error('❌ Failed to create DM channel:', error.message);
    return null;
  }
};

/**
 * Add members to a channel
 * @param {string} channelType - Channel type
 * @param {string} channelId - Channel ID
 * @param {Array<string>} memberIds - Member IDs to add
 * @returns {Promise<Object|null>} Response
 */
export const addChannelMembers = async (channelType, channelId, memberIds) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const channel = client.channel(channelType, channelId);
    const response = await channel.addMembers(memberIds);
    
    console.log(`✅ Members added to channel ${channelId}`);
    return response;
  } catch (error) {
    console.error('❌ Failed to add channel members:', error.message);
    return null;
  }
};

/**
 * Remove members from a channel
 * @param {string} channelType - Channel type
 * @param {string} channelId - Channel ID
 * @param {Array<string>} memberIds - Member IDs to remove
 * @returns {Promise<Object|null>} Response
 */
export const removeChannelMembers = async (channelType, channelId, memberIds) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const channel = client.channel(channelType, channelId);
    const response = await channel.removeMembers(memberIds);
    
    console.log(`✅ Members removed from channel ${channelId}`);
    return response;
  } catch (error) {
    console.error('❌ Failed to remove channel members:', error.message);
    return null;
  }
};

/**
 * Send message to channel
 * @param {string} channelType - Channel type
 * @param {string} channelId - Channel ID
 * @param {string} userId - User ID sending the message
 * @param {string} text - Message text
 * @param {Object} extras - Extra message data
 * @returns {Promise<Object|null>} Response
 */
export const sendMessage = async (channelType, channelId, userId, text, extras = {}) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const channel = client.channel(channelType, channelId);
    const response = await channel.sendMessage({
      text,
      user_id: userId,
      ...extras,
    });

    console.log(`✅ Message sent to channel ${channelId}`);
    return response;
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
    return null;
  }
};

/**
 * Ban user from a channel
 * @param {string} channelType - Channel type
 * @param {string} channelId - Channel ID
 * @param {string} userId - User ID to ban
 * @param {Object} options - Ban options
 * @returns {Promise<Object|null>} Response
 */
export const banUser = async (channelType, channelId, userId, options = {}) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const response = await client.banUser(userId, {
      type: channelType,
      id: channelId,
      ...options,
    });

    console.log(`✅ User ${userId} banned from channel ${channelId}`);
    return response;
  } catch (error) {
    console.error('❌ Failed to ban user:', error.message);
    return null;
  }
};

/**
 * Unban user from a channel
 * @param {string} channelType - Channel type
 * @param {string} channelId - Channel ID
 * @param {string} userId - User ID to unban
 * @returns {Promise<Object|null>} Response
 */
export const unbanUser = async (channelType, channelId, userId) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const response = await client.unbanUser(userId, {
      type: channelType,
      id: channelId,
    });

    console.log(`✅ User ${userId} unbanned from channel ${channelId}`);
    return response;
  } catch (error) {
    console.error('❌ Failed to unban user:', error.message);
    return null;
  }
};

/**
 * Query channels
 * @param {Object} filter - Filter criteria
 * @param {Object} sort - Sort options
 * @param {Object} options - Query options
 * @returns {Promise<Array|null>} Channels
 */
export const queryChannels = async (filter, sort = {}, options = {}) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const channels = await client.queryChannels(filter, sort, options);
    return channels;
  } catch (error) {
    console.error('❌ Failed to query channels:', error.message);
    return null;
  }
};

export default {
  initStreamChat,
  createStreamUserToken,
  upsertStreamUser,
  deleteStreamUser,
  createDirectMessageChannel,
  sendMessage,
  queryChannels,
};
