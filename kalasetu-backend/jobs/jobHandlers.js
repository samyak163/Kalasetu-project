import { sendNotificationToUser } from '../utils/onesignal.js';
import { indexArtisan } from '../utils/algolia.js';
import Artisan from '../models/artisanModel.js';
import { sendWelcomeEmail, sendEmail } from '../utils/email.js';
import { EMAIL_CONFIG } from '../config/env.config.js';

/**
 * Send welcome email job
 * @param {Object} data - Job data
 */
export const sendWelcomeEmailJob = async (data) => {
  try {
    const { userId, email, name } = data;

    await sendWelcomeEmail(email, name);
    console.log(`✅ Welcome email processed for ${email}`);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
    throw error;
  }
};

/**
 * Index artisan to search job
 * @param {Object} data - Job data
 */
export const indexArtisanJob = async (data) => {
  try {
    const { artisanId } = data;

    const artisan = await Artisan.findById(artisanId).select('-password');
    if (!artisan) {
      console.warn(`Artisan not found: ${artisanId}`);
      return;
    }

    await indexArtisan(artisan);
    console.log(`✅ Artisan indexed: ${artisanId}`);
  } catch (error) {
    console.error('❌ Failed to index artisan:', error.message);
    throw error;
  }
};

/**
 * Send reminder notification job
 * @param {Object} data - Job data
 */
export const sendReminderJob = async (data) => {
  try {
    const { userId, title, message, url } = data;

    await sendNotificationToUser(userId, {
      headings: { en: title },
      contents: { en: message },
      url,
      data: { type: 'reminder' },
    });

    console.log(`✅ Reminder sent to user: ${userId}`);
  } catch (error) {
    console.error('❌ Failed to send reminder:', error.message);
    throw error;
  }
};

/**
 * Clean up expired video calls job
 */
export const cleanupExpiredCallsJob = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // TODO: Implement when VideoCall model is created
    console.log(`✅ Cleanup job run (VideoCall model not yet implemented)`);
    
    // const expiredCalls = await VideoCall.find({
    //   status: 'scheduled',
    //   scheduledAt: { $lt: oneDayAgo },
    // });
    //
    // for (const call of expiredCalls) {
    //   call.status = 'cancelled';
    //   await call.save();
    // }
    //
    // console.log(`✅ Cleaned up ${expiredCalls.length} expired calls`);
  } catch (error) {
    console.error('❌ Failed to cleanup expired calls:', error.message);
    throw error;
  }
};

/**
 * Generate daily reports job
 */
export const generateDailyReportsJob = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get statistics for the day
    const newArtisans = await Artisan.countDocuments({
      createdAt: { $gte: today },
    });

    console.log(`✅ Daily report: ${newArtisans} new artisans registered today`);

    // Send report to admin email when email service is configured
    const to = EMAIL_CONFIG?.resend?.fromEmail;
    if (to) {
      await sendEmail({
        to,
        subject: 'KalaSetu Daily Report',
        html: `<p><strong>Date:</strong> ${today.toDateString()}</p>
               <p><strong>New artisans today:</strong> ${newArtisans}</p>`,
      });
    }
  } catch (error) {
    console.error('❌ Failed to generate daily report:', error.message);
    throw error;
  }
};

/**
 * Process bulk notifications job
 * @param {Object} data - Job data
 */
export const processBulkNotificationsJob = async (data) => {
  try {
    const { userIds, notification } = data;

    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(userId => 
          sendNotificationToUser(userId, notification)
        )
      );

      console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log(`✅ Bulk notifications sent to ${userIds.length} users`);
  } catch (error) {
    console.error('❌ Failed to process bulk notifications:', error.message);
    throw error;
  }
};

export default {
  sendWelcomeEmailJob,
  indexArtisanJob,
  sendReminderJob,
  cleanupExpiredCallsJob,
  generateDailyReportsJob,
  processBulkNotificationsJob,
};
