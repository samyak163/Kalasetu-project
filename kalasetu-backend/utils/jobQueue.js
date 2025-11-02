import { publishMessage, scheduleJob } from './qstash.js';
import { SERVER_CONFIG, JOBS_CONFIG } from '../config/env.config.js';

// Use configured public backend URL for webhook, else fallback to localhost (for local dev)
const WEBHOOK_BASE = JOBS_CONFIG.webhookBaseUrl || `http://localhost:${SERVER_CONFIG.port}`;
const WEBHOOK_URL = `${WEBHOOK_BASE}/api/jobs/webhook`;

// Determine if the webhook URL is publicly reachable (not loopback)
function isLoopbackUrl(urlStr) {
  try {
    const { hostname } = new URL(urlStr);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1'
    );
  } catch {
    return true; // treat invalid URL as not safe
  }
}

const isPublicWebhook = !isLoopbackUrl(WEBHOOK_URL);

/**
 * Queue a job to be processed
 * @param {string} jobType - Type of job
 * @param {Object} data - Job data
 * @param {number} delay - Delay in seconds
 * @returns {Promise<Object|null>} Job response
 */
export const queueJob = async (jobType, data, delay = 0) => {
  if (!isPublicWebhook) {
    console.warn('⚠️  Skipping QStash publish: webhook URL is not publicly reachable:', WEBHOOK_URL);
    return null;
  }
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
  if (!isPublicWebhook) {
    console.warn('⚠️  Skipping QStash schedule (cleanup): webhook URL is not publicly reachable:', WEBHOOK_URL);
    return null;
  }
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
  if (!isPublicWebhook) {
    console.warn('⚠️  Skipping QStash schedule (daily reports): webhook URL is not publicly reachable:', WEBHOOK_URL);
    return null;
  }
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
