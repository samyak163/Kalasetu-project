import asyncHandler from '../utils/asyncHandler.js';
import { verifySignature } from '../utils/qstash.js';
import {
  sendWelcomeEmailJob,
  indexArtisanJob,
  sendReminderJob,
  cleanupExpiredCallsJob,
  generateDailyReportsJob,
  processBulkNotificationsJob,
} from '../jobs/jobHandlers.js';

/**
 * Job webhook endpoint
 * POST /api/jobs/webhook
 */
export const handleJobWebhook = asyncHandler(async (req, res) => {
  // Verify QStash signature
  const isValid = await verifySignature(req);
  
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid signature',
    });
  }

  const { jobType, data } = req.body;

  try {
    switch (jobType) {
      case 'send-welcome-email':
        await sendWelcomeEmailJob(data);
        break;

      case 'index-artisan':
        await indexArtisanJob(data);
        break;

      case 'send-reminder':
        await sendReminderJob(data);
        break;

      case 'cleanup-expired-calls':
        await cleanupExpiredCallsJob();
        break;

      case 'generate-daily-reports':
        await generateDailyReportsJob();
        break;

      case 'process-bulk-notifications':
        await processBulkNotificationsJob(data);
        break;

      default:
        console.warn(`Unknown job type: ${jobType}`);
    }

    res.json({
      success: true,
      message: 'Job processed successfully',
    });
  } catch (error) {
    console.error(`Job processing error for ${jobType}:`, error);
    
    // Return 500 to trigger retry in QStash
    res.status(500).json({
      success: false,
      message: 'Job processing failed',
      error: error.message,
    });
  }
});

export default { handleJobWebhook };
