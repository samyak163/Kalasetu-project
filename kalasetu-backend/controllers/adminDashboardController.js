import Admin from '../models/adminModel.js';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';
import Review from '../models/reviewModel.js';
import Payment from '../models/paymentModel.js';
import Booking from '../models/bookingModel.js';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getDashboardStats = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    const now = new Date();
    let startDate;
    switch (period) {
      case '7days': startDate = new Date(now.setDate(now.getDate() - 7)); break;
      case '30days': startDate = new Date(now.setDate(now.getDate() - 30)); break;
      case '90days': startDate = new Date(now.setDate(now.getDate() - 90)); break;
      case '1year': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      default: startDate = new Date(now.setDate(now.getDate() - 30));
    }

    const [
      totalArtisans,
      totalUsers,
      totalReviews,
      totalBookings,
      activeArtisans,
      verifiedArtisans,
      newArtisans,
      newUsers
    ] = await Promise.all([
      Artisan.countDocuments(),
      User.countDocuments(),
      Review.countDocuments(),
      Booking.countDocuments(),
      Artisan.countDocuments({ isActive: true }),
      Artisan.countDocuments({ isVerified: true }),
      Artisan.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: startDate } })
    ]);

    let paymentStats = { totalRevenue: 0, totalTransactions: 0 };
    try {
      const payments = await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' }, totalTransactions: { $sum: 1 } } }
      ]);
      if (payments.length > 0) paymentStats = payments[0];
    } catch {
      // ignore if payments not available
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const [artisanGrowth, userGrowth] = await Promise.all([
      Artisan.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
      ])
    ]);
    const artisanMap = Object.fromEntries(artisanGrowth.map(r => [r._id, r.count]));
    const userMap = Object.fromEntries(userGrowth.map(r => [r._id, r.count]));
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      last7Days.push({ date: key, artisans: artisanMap[key] || 0, users: userMap[key] || 0 });
    }

    const topCategories = await Artisan.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const recentArtisans = await Artisan.find().sort('-createdAt').limit(5).select('fullName email createdAt isVerified');
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('fullName email createdAt');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalArtisans,
          totalUsers,
          totalReviews,
          totalBookings,
          activeArtisans,
          verifiedArtisans,
          newArtisans,
          newUsers,
          totalRevenue: paymentStats.totalRevenue || 0,
          totalTransactions: paymentStats.totalTransactions || 0
        },
        growth: last7Days,
        topCategories,
        recentActivity: { artisans: recentArtisans, users: recentUsers }
      }
    });
  } catch (error) {
    // Dashboard stats error
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

export const getAllArtisans = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all', verified = 'all', sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      const escaped = escapeRegex(search);
      query.$or = [
        { fullName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { phoneNumber: { $regex: escaped, $options: 'i' } }
      ];
    }
    if (status !== 'all') query.isActive = status === 'active';
    if (verified !== 'all') query.isVerified = verified === 'verified';
    const artisans = await Artisan.find(query).select('-password').sort(sort).limit(limit * 1).skip((page - 1) * limit).lean();
    const count = await Artisan.countDocuments(query);
    res.status(200).json({ success: true, data: artisans, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (error) {
    // Get artisans error
    res.status(500).json({ success: false, message: 'Failed to fetch artisans' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      const escaped = escapeRegex(search);
      query.$or = [
        { fullName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-password').sort(sort).limit(limit * 1).skip((page - 1) * limit).lean();
    const count = await User.countDocuments(query);
    res.status(200).json({ success: true, data: users, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (error) {
    // Get users error
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const verifyArtisan = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const artisan = await Artisan.findByIdAndUpdate(id, { isVerified: verified }, { new: true }).select('-password');
    if (!artisan) return res.status(404).json({ success: false, message: 'Artisan not found' });
    await req.user.logActivity(verified ? 'verify' : 'unverify', 'artisan', id, { artisanName: artisan.fullName });
    res.status(200).json({ success: true, data: artisan, message: `Artisan ${verified ? 'verified' : 'unverified'} successfully` });
  } catch (error) {
    // Verify artisan error
    res.status(500).json({ success: false, message: 'Failed to verify artisan' });
  }
};

export const updateArtisanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;
    const artisan = await Artisan.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
    if (!artisan) return res.status(404).json({ success: false, message: 'Artisan not found' });
    await req.user.logActivity(isActive ? 'activate' : 'suspend', 'artisan', id, { artisanName: artisan.fullName, reason });
    res.status(200).json({ success: true, data: artisan, message: `Artisan ${isActive ? 'activated' : 'suspended'} successfully` });
  } catch (error) {
    // Update artisan status error
    res.status(500).json({ success: false, message: 'Failed to update artisan status' });
  }
};

export const deleteArtisan = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only super admins can delete artisans' });
    }
    const artisan = await Artisan.findById(id);
    if (!artisan) return res.status(404).json({ success: false, message: 'Artisan not found' });
    await req.user.logActivity('delete', 'artisan', id, { artisanName: artisan.fullName, email: artisan.email });
    await artisan.deleteOne();
    res.status(200).json({ success: true, message: 'Artisan deleted successfully' });
  } catch (error) {
    // Delete artisan error
    res.status(500).json({ success: false, message: 'Failed to delete artisan' });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', rating = 'all', startDate, endDate, search, sort = '-createdAt' } = req.query;
    const query = {};
    
    if (status !== 'all') query.status = status;
    if (rating !== 'all') query.rating = parseInt(rating);
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    
    if (search) {
      const escaped = escapeRegex(search);
      const artisanMatch = await Artisan.find({
        $or: [
          { fullName: { $regex: escaped, $options: 'i' } },
          { email: { $regex: escaped, $options: 'i' } }
        ]
      }).select('_id');
      const userMatch = await User.find({
        $or: [
          { fullName: { $regex: escaped, $options: 'i' } },
          { email: { $regex: escaped, $options: 'i' } }
        ]
      }).select('_id');

      if (artisanMatch.length > 0 || userMatch.length > 0) {
        query.$or = [];
        if (artisanMatch.length > 0) query.$or.push({ artisan: { $in: artisanMatch.map(a => a._id) } });
        if (userMatch.length > 0) query.$or.push({ user: { $in: userMatch.map(u => u._id) } });
      } else {
        query._id = { $in: [] };
      }
    }

    const reviews = await Review.find(query)
      .populate('artisan', 'fullName email')
      .populate('user', 'fullName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    const count = await Review.countDocuments(query);
    res.status(200).json({ success: true, data: reviews, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (error) {
    // Get reviews error
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

export const moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await req.user.logActivity('moderate_review', 'review', id, { status, reason });
    res.status(200).json({ success: true, data: review, message: 'Review moderated successfully' });
  } catch (error) {
    // Moderate review error
    res.status(500).json({ success: false, message: 'Failed to moderate review' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const review = await Review.findByIdAndUpdate(id, { status: 'removed' }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await req.user.logActivity('delete_review', 'review', id, { reason });
    res.status(200).json({ success: true, message: 'Review removed successfully' });
  } catch (error) {
    // Delete review error
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
};

export const getReviewsStats = async (req, res) => {
  try {
    const [totalReviews, flaggedReviews, activeReviews, avgRating] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ status: 'flagged' }),
      Review.countDocuments({ status: 'active' }),
      Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);
    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        flaggedReviews,
        activeReviews,
        averageRating: avgRating.length > 0 ? avgRating[0].avgRating : 0
      }
    });
  } catch (error) {
    // Get reviews stats error
    res.status(500).json({ success: false, message: 'Failed to fetch reviews stats' });
  }
};

export const restoreReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(id, { status: 'active' }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await req.user.logActivity('restore_review', 'review', id);
    res.status(200).json({ success: true, data: review, message: 'Review restored successfully' });
  } catch (error) {
    // Restore review error
    res.status(500).json({ success: false, message: 'Failed to restore review' });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', startDate, endDate, minAmount, maxAmount, search, export: exportFormat } = req.query;
    const query = {};
    
    if (status !== 'all') {
      if (status === 'paid') {
        query.status = { $in: ['captured', 'paid'] };
      } else {
        query.status = status;
      }
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseInt(minAmount) * 100; // Convert to paise
      if (maxAmount) query.amount.$lte = parseInt(maxAmount) * 100;
    }
    
    if (search) {
      const escaped = escapeRegex(search);
      query.$or = [
        { razorpayPaymentId: { $regex: escaped, $options: 'i' } },
        { razorpayOrderId: { $regex: escaped, $options: 'i' } },
        { orderId: { $regex: escaped, $options: 'i' } }
      ];
    }

    let payments = await Payment.find(query)
      .populate('payerId')
      .populate('recipientId')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    // Map payments to include user/artisan info
    payments = payments.map(payment => {
      const user = payment.payerModel === 'User' ? payment.payerId : null;
      const artisan = payment.recipientModel === 'Artisan' ? payment.recipientId : 
                     (payment.payerModel === 'Artisan' ? payment.payerId : null);
      return {
        ...payment,
        user,
        artisan,
        bookingId: payment.metadata?.bookingId || null
      };
    });
    
    const count = await Payment.countDocuments(query);
    
    if (exportFormat === 'csv') {
      // CSV export logic would go here
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
      // Simple CSV implementation
      let csv = 'ID,User,Artisan,Amount,Status,Date,Payment ID\n';
      payments.forEach(p => {
        csv += `${p._id},${p.user?.fullName || ''},${p.artisan?.fullName || ''},${p.amount},${p.status},${p.createdAt},${p.razorpayPaymentId || ''}\n`;
      });
      return res.send(csv);
    }
    
    res.status(200).json({
      success: true,
      data: payments,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    // Get payments error
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

export const getPaymentsStats = async (req, res) => {
  try {
    const [totalRevenue, pendingPayments, refundedAmount] = await Promise.all([
      Payment.aggregate([
        { $match: { status: { $in: ['captured', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.countDocuments({ status: 'pending' }),
      Payment.aggregate([
        { $match: { status: 'refunded' } },
        { $group: { _id: null, total: { $sum: '$refundAmount' } } }
      ])
    ]);
    
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const refunded = refundedAmount.length > 0 ? refundedAmount[0].total : 0;
    const platformCommission = revenue * 0.1; // 10% commission
    
    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenue,
        pendingPayments,
        refundedAmount: refunded,
        platformCommission
      }
    });
  } catch (error) {
    // Get payments stats error
    res.status(500).json({ success: false, message: 'Failed to fetch payments stats' });
  }
};

export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    
    if (payment.status !== 'captured' && payment.status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Only captured/paid payments can be refunded' });
    }
    
    // Update payment status to refunded
    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundedAt = new Date();
    await payment.save();
    
    await req.user.logActivity('process_refund', 'payment', id, { amount: payment.amount });
    res.status(200).json({ success: true, data: payment, message: 'Refund processed successfully' });
  } catch (error) {
    // Process refund error
    res.status(500).json({ success: false, message: 'Failed to process refund' });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', startDate, endDate, artisan, search, export: exportFormat } = req.query;
    const query = {};
    
    if (status !== 'all') query.status = status;
    
    if (startDate || endDate) {
      query.start = {};
      if (startDate) query.start.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.start.$lte = end;
      }
    }
    
    if (artisan) {
      const escapedArtisan = escapeRegex(artisan);
      const artisanDoc = await Artisan.findOne({ fullName: { $regex: escapedArtisan, $options: 'i' } });
      if (artisanDoc) query.artisan = artisanDoc._id;
    }

    if (search) {
      const escaped = escapeRegex(search);
      const userMatch = await User.find({
        $or: [
          { fullName: { $regex: escaped, $options: 'i' } },
          { email: { $regex: escaped, $options: 'i' } }
        ]
      }).select('_id');
      const artisanMatch = await Artisan.find({
        $or: [
          { fullName: { $regex: escaped, $options: 'i' } },
          { email: { $regex: escaped, $options: 'i' } }
        ]
      }).select('_id');
      
      if (userMatch.length > 0 || artisanMatch.length > 0) {
        query.$or = [];
        if (userMatch.length > 0) query.$or.push({ user: { $in: userMatch.map(u => u._id) } });
        if (artisanMatch.length > 0) query.$or.push({ artisan: { $in: artisanMatch.map(a => a._id) } });
      }
    }
    
    const bookings = await Booking.find(query)
      .populate('user', 'fullName email phoneNumber')
      .populate('artisan', 'fullName email phoneNumber')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const count = await Booking.countDocuments(query);
    
    if (exportFormat === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
      let csv = 'ID,User,Artisan,Date,Time,Duration,Price,Status\n';
      bookings.forEach(b => {
        const start = new Date(b.start);
        const duration = b.end ? Math.round((new Date(b.end) - start) / 60000) : 0;
        csv += `${b._id},${b.user?.fullName || ''},${b.artisan?.fullName || ''},${start.toLocaleDateString()},${start.toLocaleTimeString()},${duration}min,${b.price},${b.status}\n`;
      });
      return res.send(csv);
    }
    
    res.status(200).json({
      success: true,
      data: bookings,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    // Get bookings error
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

export const getBookingsStats = async (req, res) => {
  try {
    const [totalBookings, upcoming, completed, cancelled] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed', start: { $gte: new Date() } }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' })
    ]);
    
    const cancellationRate = totalBookings > 0 ? (cancelled / totalBookings) * 100 : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        upcoming,
        completed,
        cancelled,
        cancellationRate
      }
    });
  } catch (error) {
    // Get bookings stats error
    res.status(500).json({ success: false, message: 'Failed to fetch bookings stats' });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    await req.user.logActivity('cancel_booking', 'booking', id);
    res.status(200).json({ success: true, data: booking, message: 'Booking cancelled successfully' });
  } catch (error) {
    // Cancel booking error
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
};

// Settings model - simple in-memory or database
let settingsCache = null;

export const getSettings = async (req, res) => {
  try {
    // In a real app, fetch from database
    // For now, return default settings
    const defaultSettings = {
      platformName: 'KalaSetu',
      supportEmail: '',
      supportPhone: '',
      platformCommissionRate: 10,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      minimumBookingNotice: 24,
      maximumAdvanceBooking: 90,
      defaultBookingDuration: 60,
      allowSameDayBookings: true,
      autoConfirmBookings: false,
      cancellationPolicy: 'moderate',
      paymentGateway: 'Razorpay',
      testMode: false,
      autoPayoutToArtisans: false,
      payoutSchedule: 'weekly',
      minimumPayoutAmount: 1000,
      emailProvider: 'Resend',
      fromName: 'KalaSetu',
      fromEmail: '',
      enableReviews: true,
      enableVideoCalls: true,
      enableChat: true,
      enableLocationSearch: true,
      maintenanceMode: false
    };
    
    res.status(200).json({
      success: true,
      data: settingsCache || defaultSettings
    });
  } catch (error) {
    // Get settings error
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const newSettings = req.body;
    // In a real app, save to database
    // For now, update cache
    settingsCache = { ...settingsCache, ...newSettings };
    await req.user.logActivity('update_settings', 'settings', null, { settings: Object.keys(newSettings) });
    res.status(200).json({
      success: true,
      data: settingsCache,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    // Update settings error
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};


