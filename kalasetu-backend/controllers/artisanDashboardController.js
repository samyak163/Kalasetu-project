/**
 * @file artisanDashboardController.js — Artisan Dashboard Analytics
 *
 * Provides statistics, income reports, and profile completeness data for
 * the artisan dashboard. All endpoints require `protect` (artisan-only).
 *
 * Endpoints:
 *  GET /api/artisan/dashboard/stats               — Overview stats (bookings, earnings, rating, growth)
 *  GET /api/artisan/dashboard/income-report        — Income grouped by weekly/monthly period
 *  GET /api/artisan/dashboard/verification-status  — Profile completeness checklist
 *
 * Performance: getDashboardStats uses a single MongoDB $facet aggregation
 * to compute 6 booking metrics in one DB call instead of 6 separate queries.
 *
 * @see routes/artisanDashboardRoutes.js — Route definitions
 * @see pages/dashboard/artisan/ — Frontend dashboard components consuming this data
 */

import asyncHandler from '../utils/asyncHandler.js';
import Booking from '../models/bookingModel.js';
import Review from '../models/reviewModel.js';
import Artisan from '../models/artisanModel.js';
import Payment from '../models/paymentModel.js';
import ArtisanService from '../models/artisanServiceModel.js';

/**
 * @desc    Get artisan dashboard statistics
 * @route   GET /api/artisan/dashboard/stats
 * @access  Private (Artisan only)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const artisanId = req.user._id;

  const today = new Date();
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - 7);
  const previousWeekStart = new Date(today);
  previousWeekStart.setDate(today.getDate() - 14);

  // Run all independent queries in parallel (3 DB calls instead of 9)
  const [bookingStats, artisan, reviewCount, recentBookings] = await Promise.all([
    // Single aggregation pipeline replaces 6 separate booking queries
    Booking.aggregate([
      { $match: { artisan: artisanId } },
      {
        $facet: {
          activeCount: [
            { $match: { status: { $in: ['pending', 'confirmed'] } } },
            { $count: 'count' }
          ],
          completedCount: [
            { $match: { status: 'completed' } },
            { $count: 'count' }
          ],
          totalEarnings: [
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$price' } } }
          ],
          pendingCount: [
            { $match: { status: 'pending' } },
            { $count: 'count' }
          ],
          lastWeekCount: [
            { $match: { createdAt: { $gte: lastWeekStart, $lt: today } } },
            { $count: 'count' }
          ],
          previousWeekCount: [
            { $match: { createdAt: { $gte: previousWeekStart, $lt: lastWeekStart } } },
            { $count: 'count' }
          ]
        }
      }
    ]),

    // Artisan profile data
    Artisan.findById(artisanId).select('averageRating totalReviews profileViews').lean(),

    // Review count as backup
    Review.countDocuments({ artisan: artisanId }),

    // Recent bookings
    Booking.find({ artisan: artisanId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'fullName phoneNumber email')
      .populate('service', 'name')
      .select('serviceName start end status price user service')
      .lean()
  ]);

  // Extract values from the aggregation facet results
  const stats = bookingStats[0];
  const activeBookings = stats.activeCount[0]?.count || 0;
  const completedBookings = stats.completedCount[0]?.count || 0;
  const totalEarnings = stats.totalEarnings[0]?.total || 0;
  const pendingBookings = stats.pendingCount[0]?.count || 0;
  const lastWeekBookings = stats.lastWeekCount[0]?.count || 0;
  const previousWeekBookings = stats.previousWeekCount[0]?.count || 0;

  const weeklyGrowth = previousWeekBookings > 0
    ? Math.round(((lastWeekBookings - previousWeekBookings) / previousWeekBookings) * 100)
    : 0;

  // Format recent bookings for frontend
  const formattedRecentBookings = recentBookings.map(booking => ({
    _id: booking._id,
    serviceName: booking.serviceName || booking.service?.name || 'Service',
    user: booking.user,
    start: booking.start,
    end: booking.end,
    status: booking.status,
    price: booking.price || 0
  }));

  res.status(200).json({
    success: true,
    data: {
      stats: {
        activeBookings,
        completedBookings,
        totalEarnings,
        rating: artisan?.averageRating || 0,
        reviewCount: artisan?.totalReviews || reviewCount || 0,
        profileViews: artisan?.profileViews || 0,
        weeklyGrowth,
        pendingActions: {
          newRequests: pendingBookings,
          unreadMessages: 0 // TODO: Implement when chat system is connected
        }
      },
      recentBookings: formattedRecentBookings
    }
  });
});

/**
 * @desc    Get artisan income report grouped by period
 * @route   GET /api/artisan/dashboard/income-report?period=monthly|weekly
 * @access  Private (Artisan only)
 */
export const getIncomeReport = asyncHandler(async (req, res) => {
  const artisanId = req.user._id;
  const period = req.query.period === 'weekly' ? 'weekly' : 'monthly';

  const cutoff = new Date();
  let groupFormat;

  if (period === 'weekly') {
    cutoff.setDate(cutoff.getDate() - 12 * 7); // last 12 weeks
    groupFormat = { $dateToString: { format: '%G-W%V', date: '$createdAt' } };
  } else {
    cutoff.setMonth(cutoff.getMonth() - 12); // last 12 months
    groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  }
  cutoff.setHours(0, 0, 0, 0);

  const results = await Payment.aggregate([
    {
      $match: {
        recipientId: artisanId,
        status: 'captured',
        createdAt: { $gte: cutoff }
      }
    },
    {
      $group: {
        _id: groupFormat,
        amount: { $sum: '$amount' }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, label: '$_id', amount: 1 } }
  ]);

  const total = results.reduce((sum, r) => sum + r.amount, 0);

  res.status(200).json({
    success: true,
    data: { periods: results, total }
  });
});

/**
 * @desc    Get artisan profile completeness / verification checklist
 * @route   GET /api/artisan/dashboard/verification-status
 * @access  Private (Artisan only)
 */
export const getProfileVerificationStatus = asyncHandler(async (req, res) => {
  const artisanId = req.user._id;

  const [artisan, serviceCount] = await Promise.all([
    Artisan.findById(artisanId)
      .select('profileImageUrl bio portfolioImageUrls emailVerified')
      .lean(),
    ArtisanService.countDocuments({ artisan: artisanId })
  ]);

  if (!artisan) {
    return res.status(404).json({ success: false, message: 'Artisan not found' });
  }

  const defaultPhoto = 'https://placehold.co/100x100/A55233/FFFFFF?text=Profile';
  const steps = [
    { name: 'hasProfilePhoto', completed: !!artisan.profileImageUrl && artisan.profileImageUrl !== defaultPhoto },
    { name: 'hasBio', completed: !!artisan.bio && artisan.bio.length > 10 },
    { name: 'hasService', completed: serviceCount > 0 },
    { name: 'hasPortfolio', completed: Array.isArray(artisan.portfolioImageUrls) && artisan.portfolioImageUrls.length > 0 },
    { name: 'emailVerified', completed: !!artisan.emailVerified },
  ];

  const completedCount = steps.filter(s => s.completed).length;

  res.status(200).json({
    success: true,
    data: {
      steps,
      completedCount,
      totalCount: steps.length,
      isFullyVerified: completedCount === steps.length
    }
  });
});
