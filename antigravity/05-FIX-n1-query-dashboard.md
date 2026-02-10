# TASK: Fix N+1 Query Problem in Artisan Dashboard

## Priority: HIGH (Performance)

## Problem
The artisan dashboard controller makes 7 separate database queries that should be combined into 1-2 aggregation pipelines. This causes severe performance issues as data grows.

## File to Fix
`kalasetu-backend/controllers/artisanDashboardController.js`

## Current Problematic Code (lines 15-74)
```javascript
// 7 SEPARATE QUERIES - BAD!
const activeBookings = await Booking.countDocuments({ artisan: artisanId, status: { $in: ['pending', 'confirmed'] } });
const completedBookings = await Booking.countDocuments({ artisan: artisanId, status: 'completed' });
const completedBookingsData = await Booking.find({ artisan: artisanId, status: 'completed' }).select('price');
const reviewCount = await Review.countDocuments({ artisan: artisanId });
const lastWeekBookings = await Booking.countDocuments({...});
const previousWeekBookings = await Booking.countDocuments({...});
const recentBookings = await Booking.find({...}).limit(5);
```

## Solution: Use MongoDB Aggregation

Replace the multiple queries with a single aggregation pipeline:

```javascript
import Booking from '../models/bookingModel.js';
import Review from '../models/reviewModel.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const artisanId = req.user._id;
  const now = new Date();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

  // Single aggregation for all booking stats
  const [bookingStats] = await Booking.aggregate([
    { $match: { artisan: artisanId } },
    {
      $facet: {
        // Count by status
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalPrice: { $sum: '$price' }
            }
          }
        ],
        // Last week bookings
        lastWeek: [
          { $match: { createdAt: { $gte: oneWeekAgo } } },
          { $count: 'count' }
        ],
        // Previous week bookings (for trend)
        previousWeek: [
          { $match: { createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } } },
          { $count: 'count' }
        ],
        // Recent bookings
        recentBookings: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'artisanservices',
              localField: 'service',
              foreignField: '_id',
              as: 'service'
            }
          },
          { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              status: 1,
              scheduledDate: 1,
              scheduledTime: 1,
              price: 1,
              createdAt: 1,
              'user.fullName': 1,
              'user.email': 1,
              'service.name': 1
            }
          }
        ]
      }
    }
  ]);

  // Get review count (separate query is fine - different collection)
  const reviewCount = await Review.countDocuments({ artisan: artisanId });

  // Process the aggregation results
  const statusCounts = bookingStats.statusCounts.reduce((acc, item) => {
    acc[item._id] = { count: item.count, totalPrice: item.totalPrice };
    return acc;
  }, {});

  const activeBookings = (statusCounts.pending?.count || 0) + (statusCounts.confirmed?.count || 0);
  const completedBookings = statusCounts.completed?.count || 0;
  const totalEarnings = statusCounts.completed?.totalPrice || 0;
  const lastWeekCount = bookingStats.lastWeek[0]?.count || 0;
  const previousWeekCount = bookingStats.previousWeek[0]?.count || 0;

  // Calculate trend
  let bookingsTrend = 0;
  if (previousWeekCount > 0) {
    bookingsTrend = Math.round(((lastWeekCount - previousWeekCount) / previousWeekCount) * 100);
  } else if (lastWeekCount > 0) {
    bookingsTrend = 100;
  }

  res.json({
    success: true,
    data: {
      activeBookings,
      completedBookings,
      totalEarnings,
      totalReviews: reviewCount,
      bookingsTrend,
      recentBookings: bookingStats.recentBookings,
      unreadMessages: 0 // TODO: Implement when chat system provides this
    }
  });
});
```

## Why This Is Better

| Before | After |
|--------|-------|
| 7 database round trips | 2 database round trips |
| Slow with large datasets | Scales well |
| Multiple cursor operations | Single aggregation |

## Steps

1. Read the current `artisanDashboardController.js`
2. Replace the `getDashboardStats` function with the aggregation version
3. Test by visiting the artisan dashboard
4. Verify all stats display correctly

## Testing

1. Login as an artisan
2. Go to dashboard
3. Check that all stats load correctly:
   - Active bookings count
   - Completed bookings count
   - Total earnings
   - Review count
   - Recent bookings list
   - Booking trend percentage

## Success Criteria
- Dashboard loads faster
- All stats are correct
- Only 2 database queries instead of 7
- No console errors

## Related Files
- `kalasetu-backend/controllers/artisanDashboardController.js` - Main fix
- `kalasetu-backend/models/bookingModel.js` - Booking schema
- `kalasetu-backend/models/reviewModel.js` - Review schema
