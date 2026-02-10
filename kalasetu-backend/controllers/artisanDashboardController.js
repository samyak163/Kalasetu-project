import asyncHandler from '../utils/asyncHandler.js';
import Booking from '../models/bookingModel.js';
import Review from '../models/reviewModel.js';
import Artisan from '../models/artisanModel.js';

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
