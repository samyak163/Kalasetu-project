import { Client } from '@upstash/qstash';
import { JOBS_CONFIG } from '../config/env.config.js';

let qstashClient = null;

/**
 * Initialize QStash client
 * @returns {Client|null} QStash client or null
 */
export const initQStash = () => {
  if (!JOBS_CONFIG?.enabled || JOBS_CONFIG?.provider !== 'qstash') {
    console.log('⚠️  QStash background jobs is disabled');
    return null;
  }

  if (!JOBS_CONFIG.qstash?.token) {
    console.warn('⚠️  QStash token is not configured');
    return null;
  }

  try {
    qstashClient = new Client({
      token: JOBS_CONFIG.qstash.token,
    });

    console.log('✅ QStash client initialized');
    return qstashClient;
  } catch (error) {
    console.error('❌ Failed to initialize QStash:', error.message);
    return null;
  }
};

/**
 * Get QStash client instance
 * @returns {Client|null}
 */
export const getQStashClient = () => {
  if (!qstashClient) {
    return initQStash();
  }
  return qstashClient;
};

/**
 * Publish a message to a URL endpoint
 * @param {Object} options - Publish options
 * @returns {Promise<Object|null>} Message response
 */
export const publishMessage = async (options) => {
  const client = getQStashClient();
  if (!client) return null;

  try {
    const { url, body, delay, headers = {}, retries = 3 } = options;

    const response = await client.publishJSON({
      url,
      body,
      delay: delay || undefined, // delay in seconds
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      retries,
    });

    console.log(`✅ Message published to QStash: ${url}`);
    return response;
  } catch (error) {
    console.error('❌ Failed to publish message to QStash:', error.message);
    return null;
  }
};

/**
 * Schedule a recurring job
 * @param {Object} options - Schedule options
 * @returns {Promise<Object|null>} Schedule response
 */
export const scheduleJob = async (options) => {
  const client = getQStashClient();
  if (!client) return null;

  try {
    const { url, body, cron, headers = {} } = options;

    const response = await client.schedules.create({
      destination: url,
      cron, // e.g., "0 0 * * *" for daily at midnight
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    console.log(`✅ Job scheduled on QStash: ${cron}`);
    return response;
  } catch (error) {
    console.error('❌ Failed to schedule job on QStash:', error.message);
    return null;
  }
};

/**
 * Delete a scheduled job
 * @param {string} scheduleId - Schedule ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteSchedule = async (scheduleId) => {
  const client = getQStashClient();
  if (!client) return false;

  try {
    await client.schedules.delete(scheduleId);
    console.log(`✅ Schedule deleted: ${scheduleId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete schedule:', error.message);
    return false;
  }
};

/**
 * Get all schedules
 * @returns {Promise<Array|null>} Schedules array
 */
export const getSchedules = async () => {
  const client = getQStashClient();
  if (!client) return null;

  try {
    const schedules = await client.schedules.list();
    return schedules;
  } catch (error) {
    console.error('❌ Failed to get schedules:', error.message);
    return null;
  }
};

/**
 * Verify QStash signature
 * @param {Object} req - Express request object
 * @returns {Promise<boolean>} Verification status
 */
export const verifySignature = async (req) => {
  const client = getQStashClient();
  if (!client) return false;

  try {
    const signature = req.headers['upstash-signature'];
    const body = JSON.stringify(req.body);

    const isValid = await client.verifySignature({
      signature,
      body,
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    });

    return isValid;
  } catch (error) {
    console.error('❌ Failed to verify QStash signature:', error.message);
    return false;
  }
};

/**
 * Batch publish multiple messages
 * @param {Array} messages - Array of message objects
 * @returns {Promise<Array|null>} Batch response
 */
export const batchPublish = async (messages) => {
  const client = getQStashClient();
  if (!client) return null;

  try {
    const batch = messages.map(msg => ({
      url: msg.url,
      body: JSON.stringify(msg.body),
      headers: msg.headers || {},
      delay: msg.delay,
      retries: msg.retries || 3,
    }));

    const response = await client.batchJSON(batch);
    console.log(`✅ Batch published ${messages.length} messages to QStash`);
    return response;
  } catch (error) {
    console.error('❌ Failed to batch publish to QStash:', error.message);
    return null;
  }
};

export default {
  initQStash,
  getQStashClient,
  publishMessage,
  scheduleJob,
  deleteSchedule,
  getSchedules,
  verifySignature,
  batchPublish,
};
