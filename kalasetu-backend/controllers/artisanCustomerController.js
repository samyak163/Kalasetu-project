import asyncHandler from '../utils/asyncHandler.js';
import Booking from '../models/bookingModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

/**
 * @desc    Get artisan's customers with booking statistics
 * @route   GET /api/artisan/customers
 * @access  Private (Artisan only)
 */
export const getArtisanCustomers = asyncHandler(async (req, res) => {
  const artisanId = req.user._id;

  // Convert artisanId to ObjectId for aggregation
  const artisanObjectId = new mongoose.Types.ObjectId(artisanId);

  // Aggregate bookings grouped by user
  const customerStats = await Booking.aggregate([
    {
      $match: { 
        artisan: artisanObjectId,
        user: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$user',
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: '$price' },
        lastBooking: { $max: '$createdAt' },
        firstBooking: { $min: '$createdAt' }
      }
    },
    {
      $sort: { totalSpent: -1 }
    }
  ]);

  // Get user IDs
  const userIds = customerStats.map(stat => stat._id);

  // Populate user details
  const users = await User.find({
    _id: { $in: userIds }
  }).select('fullName phoneNumber email').lean();

  // Create a map of user details
  const userMap = {};
  for (const user of users) {
    if (user && user._id) {
      const idString = String(user._id);
      userMap[idString] = user;
    }
  }

  // Combine stats with user details
  const customers = customerStats.map(stat => {
    const idString = String(stat._id);
    const user = userMap[idString];
    return {
      _id: stat._id,
      fullName: user?.fullName || 'Unknown',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || '',
      totalBookings: stat.totalBookings,
      totalSpent: stat.totalSpent,
      lastBooking: stat.lastBooking,
      firstBooking: stat.firstBooking
    };
  });

  res.status(200).json({
    success: true,
    data: customers
  });
});
