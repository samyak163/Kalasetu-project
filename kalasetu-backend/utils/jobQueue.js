import { publishMessage, scheduleJob } from './qstash.js';
import { SERVER_CONFIG, FRONTEND_CONFIG } from '../config/env.config.js';

// Use frontend URL or server URL for webhook
const WEBHOOK_BASE = FRONTEND_CONFIG.baseUrl || `http://localhost:${SERVER_CONFIG.port}`;
const WEBHOOK_URL = `${WEBHOOK_BASE}/api/jobs/webhook`;

/**
 * Queue a job to be processed
 * @param {string} jobType - Type of job
 * @param {Object} data - Job data
 * @param {number} delay - Delay in seconds
 * @returns {Promise<Object|null>} Job response
 */
export const queueJob = async (jobType, data, delay = 0) => {
  return publishMessage({
    url: WEBHOOK_URL,
    body: { jobType, data },
    delay,
    retries: 3,
  });
};

/**
 * Queue welcome email
 */
export const queueWelcomeEmail = async (userId, email, name) => {
  return queueJob('send-welcome-email', { userId, email, name }, 5);
};

/**
 * Queue artisan indexing
 */
export const queueArtisanIndexing = async (artisanId) => {
  return queueJob('index-artisan', { artisanId }, 2);
};

/**
 * Queue reminder notification
 */
export const queueReminder = async (userId, title, message, url, delay) => {
  return queueJob('send-reminder', { userId, title, message, url }, delay);
};

/**
 * Queue bulk notifications
 */
export const queueBulkNotifications = async (userIds, notification) => {
  return queueJob('process-bulk-notifications', { userIds, notification }, 0);
};

/**
 * Schedule daily cleanup job
 */
export const scheduleCleanupJob = async () => {
  return scheduleJob({
    url: WEBHOOK_URL,
    body: { jobType: 'cleanup-expired-calls' },
    cron: '0 2 * * *', // Every day at 2 AM
  });
};

/**
 * Schedule daily reports job
 */
export const scheduleDailyReports = async () => {
  return scheduleJob({
    url: WEBHOOK_URL,
    body: { jobType: 'generate-daily-reports' },
    cron: '0 8 * * *', // Every day at 8 AM
  });
};

export default {
  queueJob,
  queueWelcomeEmail,
  queueArtisanIndexing,
  queueReminder,
  queueBulkNotifications,
  scheduleCleanupJob,
  scheduleDailyReports,
};
