import Admin from '../models/adminModel.js';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';
import Review from '../models/reviewModel.js';
import Payment from '../models/paymentModel.js';
import Booking from '../models/bookingModel.js';
import RefundRequest from '../models/refundRequestModel.js';
import SupportTicket from '../models/supportTicketModel.js';
import { refundPayment } from '../utils/razorpay.js';
import { sendEmail } from '../utils/email.js';
import { sendNotificationToUser } from '../utils/onesignal.js';
import Notification from '../models/notificationModel.js';

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

// ===== REFUND REQUEST MANAGEMENT =====

export const getAllRefundRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', startDate, endDate, search } = req.query;
    let query = {};

    // Filter by status
    if (status !== 'all') {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Search by payment ID
    if (search) {
      const escaped = escapeRegex(search);
      const matchingPayments = await Payment.find({
        $or: [
          { razorpayPaymentId: { $regex: escaped, $options: 'i' } },
          { razorpayOrderId: { $regex: escaped, $options: 'i' } }
        ]
      }).select('_id');

      if (matchingPayments.length > 0) {
        query.payment = { $in: matchingPayments.map(p => p._id) };
      } else {
        // No matching payments, return empty result
        query._id = { $in: [] };
      }
    }

    const [refunds, total] = await Promise.all([
      RefundRequest.find(query)
        .populate('payment', 'amount razorpayPaymentId razorpayOrderId status purpose')
        .populate('requestedBy', 'fullName email profileImageUrl')
        .populate('adminResponse.adminId', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean(),
      RefundRequest.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: refunds,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch refund requests' });
  }
};

export const getRefundRequestsStats = async (req, res) => {
  try {
    const [statusCounts, amountAgg] = await Promise.all([
      RefundRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      RefundRequest.aggregate([
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Build stats object
    const statusMap = Object.fromEntries(statusCounts.map(s => [s._id, s.count]));
    const amountMap = Object.fromEntries(amountAgg.map(s => [s._id, s.totalAmount]));

    const stats = {
      total: statusCounts.reduce((sum, s) => sum + s.count, 0),
      pending: statusMap.pending || 0,
      approved: statusMap.approved || 0,
      processing: statusMap.processing || 0,
      processed: statusMap.processed || 0,
      rejected: statusMap.rejected || 0,
      failed: statusMap.failed || 0,
      totalPendingAmount: (amountMap.pending || 0) + (amountMap.approved || 0) + (amountMap.processing || 0),
      totalProcessedAmount: amountMap.processed || 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch refund stats' });
  }
};

export const approveRefundRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const refundRequest = await RefundRequest.findById(id);
    if (!refundRequest) {
      return res.status(404).json({ success: false, message: 'Refund request not found' });
    }

    if (refundRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only approve pending requests'
      });
    }

    // Set admin response
    refundRequest.adminResponse = {
      adminId: req.user._id,
      action: 'approved',
      reason: reason || 'Approved by admin',
      respondedAt: new Date()
    };
    refundRequest.status = 'processing';

    // Get payment details
    const payment = await Payment.findById(refundRequest.payment);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Call Razorpay API
    try {
      const razorpayRefund = await refundPayment(payment.razorpayPaymentId, refundRequest.amount);

      if (!razorpayRefund) {
        throw new Error('Razorpay refund API returned null');
      }

      refundRequest.razorpayRefundId = razorpayRefund.id;
      refundRequest.razorpayRefundStatus = razorpayRefund.status;
      await refundRequest.save();

      // Send notifications (non-blocking)
      notifyRefundApproved(refundRequest).catch(() => {});

      await req.user.logActivity('approve_refund', 'refund', id, { amount: refundRequest.amount });

      res.status(200).json({
        success: true,
        message: 'Refund approved and processing',
        data: refundRequest
      });
    } catch (razorpayError) {
      // If Razorpay fails, mark as failed
      refundRequest.status = 'failed';
      refundRequest.failureReason = razorpayError.message;
      await refundRequest.save();

      res.status(500).json({
        success: false,
        message: 'Failed to process refund with payment gateway',
        error: razorpayError.message
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve refund request' });
  }
};

export const rejectRefundRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const refundRequest = await RefundRequest.findById(id);
    if (!refundRequest) {
      return res.status(404).json({ success: false, message: 'Refund request not found' });
    }

    if (refundRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject pending requests'
      });
    }

    // Set admin response
    refundRequest.adminResponse = {
      adminId: req.user._id,
      action: 'rejected',
      reason,
      respondedAt: new Date()
    };
    refundRequest.status = 'rejected';
    await refundRequest.save();

    // Send notifications (non-blocking)
    notifyRefundRejected(refundRequest).catch(() => {});

    await req.user.logActivity('reject_refund', 'refund', id, { reason });

    res.status(200).json({
      success: true,
      message: 'Refund request rejected',
      data: refundRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject refund request' });
  }
};

// Helper functions for notifications
async function notifyRefundApproved(refundRequest) {
  try {
    // Load requester
    const RequesterModel = refundRequest.requestedByModel === 'User'
      ? (await import('../models/userModel.js')).default
      : (await import('../models/artisanModel.js')).default;
    const requester = await RequesterModel.findById(refundRequest.requestedBy).lean();

    if (!requester) return;

    // Create in-app notification
    await Notification.create({
      ownerId: refundRequest.requestedBy,
      ownerType: refundRequest.requestedByModel === 'User' ? 'user' : 'artisan',
      title: 'Refund Approved',
      text: `Your refund request for Rs.${refundRequest.amount} has been approved and is being processed.`,
      url: `/refunds/${refundRequest._id}`,
      read: false
    });

    // Send email
    const emailHtml = buildRefundEmailHTML(requester.fullName, refundRequest, 'approved');
    await sendEmail({
      to: requester.email,
      subject: 'Your Refund Has Been Approved - KalaSetu',
      html: emailHtml
    }).catch(() => {});

    // Send push notification
    try {
      await sendNotificationToUser(
        refundRequest.requestedBy.toString(),
        'Refund Approved',
        `Your refund of Rs.${refundRequest.amount} is being processed.`
      );
    } catch {
      // Push notification failure is non-critical
    }
  } catch (error) {
    // Notification errors should not block the main operation
  }
}

async function notifyRefundRejected(refundRequest) {
  try {
    // Load requester
    const RequesterModel = refundRequest.requestedByModel === 'User'
      ? (await import('../models/userModel.js')).default
      : (await import('../models/artisanModel.js')).default;
    const requester = await RequesterModel.findById(refundRequest.requestedBy).lean();

    if (!requester) return;

    // Create in-app notification
    await Notification.create({
      ownerId: refundRequest.requestedBy,
      ownerType: refundRequest.requestedByModel === 'User' ? 'user' : 'artisan',
      title: 'Refund Request Rejected',
      text: `Your refund request for Rs.${refundRequest.amount} has been rejected. Reason: ${refundRequest.adminResponse.reason}`,
      url: `/refunds/${refundRequest._id}`,
      read: false
    });

    // Send email
    const emailHtml = buildRefundEmailHTML(requester.fullName, refundRequest, 'rejected');
    await sendEmail({
      to: requester.email,
      subject: 'Refund Request Update - KalaSetu',
      html: emailHtml
    }).catch(() => {});

    // Send push notification
    try {
      await sendNotificationToUser(
        refundRequest.requestedBy.toString(),
        'Refund Rejected',
        `Your refund request for Rs.${refundRequest.amount} was not approved.`
      );
    } catch {
      // Push notification failure is non-critical
    }
  } catch (error) {
    // Notification errors should not block the main operation
  }
}

function buildRefundEmailHTML(userName, refundRequest, status) {
  const brandColor = '#A55233';
  const statusColors = {
    approved: '#4caf50',
    rejected: '#f44336',
    processed: brandColor,
    failed: '#f44336'
  };
  const headerColor = statusColors[status] || brandColor;

  const statusTitles = {
    approved: 'Refund Approved',
    rejected: 'Refund Request Rejected',
    processed: 'Refund Processed',
    failed: 'Refund Failed'
  };

  const frontendUrl = process.env.FRONTEND_URL || 'https://kalasetu.com';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusTitles[status]}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${headerColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { font-size: 24px; font-weight: bold; color: ${headerColor}; margin: 20px 0; }
        .reason { background: white; border-left: 4px solid ${headerColor}; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: ${headerColor}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusTitles[status]}</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>Your refund request has been ${status}.</p>

          <div class="amount">
            Amount: Rs.${refundRequest.amount.toLocaleString('en-IN')}
          </div>

          ${status === 'rejected' || status === 'failed' ? `
            <div class="reason">
              <strong>Reason:</strong> ${refundRequest.adminResponse?.reason || refundRequest.failureReason || 'No reason provided'}
            </div>
          ` : ''}

          ${status === 'approved' ? `
            <p>Your refund is currently being processed by our payment gateway. You should receive the amount in your original payment method within 5-7 business days.</p>
          ` : ''}

          ${status === 'processed' ? `
            <p>The refund has been successfully processed. The amount should reflect in your account within 5-7 business days depending on your bank.</p>
          ` : ''}

          <a href="${frontendUrl}/refunds/${refundRequest._id}" class="button">View Refund Details</a>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// --- Support Ticket Management ---

// @desc    Get all support tickets with pagination and filters
// @route   GET /api/admin/support/tickets
// @access  Protected (Admin)
export const getAllSupportTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      category = 'all',
      priority = 'all',
      search,
      assignedTo
    } = req.query;

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (search && search.trim()) {
      const escapedSearch = escapeRegex(search.trim());
      query.$or = [
        { ticketNumber: { $regex: escapedSearch, $options: 'i' } },
        { subject: { $regex: escapedSearch, $options: 'i' } },
        { 'createdBy.userName': { $regex: escapedSearch, $options: 'i' } },
        { 'createdBy.userEmail': { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await SupportTicket.countDocuments(query);

    const tickets = await SupportTicket.find(query)
      .select('-messages')
      .sort({ status: 1, priority: -1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get support tickets statistics
// @route   GET /api/admin/support/tickets/stats
// @access  Protected (Admin)
export const getSupportTicketsStats = async (req, res) => {
  try {
    const [total, statusCounts, categoryCounts, priorityCounts] = await Promise.all([
      SupportTicket.countDocuments(),
      SupportTicket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      SupportTicket.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      SupportTicket.aggregate([
        { $match: { status: { $in: ['open', 'in_progress'] } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    const byStatus = {};
    statusCounts.forEach(item => {
      byStatus[item._id] = item.count;
    });

    const byCategory = {};
    categoryCounts.forEach(item => {
      byCategory[item._id] = item.count;
    });

    const byPriority = {};
    priorityCounts.forEach(item => {
      byPriority[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus,
        byCategory,
        byPriority
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Respond to a support ticket
// @route   POST /api/admin/support/tickets/:id/respond
// @access  Protected (Admin)
export const respondToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, internal } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (message.length > 5000) {
      return res.status(400).json({ success: false, message: 'Message must be at most 5000 characters' });
    }

    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: `Cannot respond to a ${ticket.status} ticket`
      });
    }

    const newMessage = {
      sender: {
        senderId: req.user._id,
        senderModel: 'Admin',
        senderName: req.user.fullName
      },
      message: message.trim(),
      internal: internal || false
    };

    ticket.messages.push(newMessage);

    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    if (!ticket.assignedTo) {
      ticket.assignedTo = req.user._id;
    }

    await ticket.save();

    // If not an internal note, notify the user
    if (!internal) {
      try {
        // Load user model
        const UserModel = ticket.createdBy.userModel === 'User'
          ? (await import('../models/userModel.js')).default
          : (await import('../models/artisanModel.js')).default;
        const user = await UserModel.findById(ticket.createdBy.userId).lean();

        if (user) {
          // Create in-app notification
          await Notification.create({
            ownerId: ticket.createdBy.userId,
            ownerType: ticket.createdBy.userModel === 'User' ? 'user' : 'artisan',
            title: 'Support Ticket Response',
            text: `Admin responded to your ticket "${ticket.subject}"`,
            url: `/support/tickets/${ticket._id}`,
            read: false
          });

          // Send email
          const { sendTicketResponseEmail } = await import('../utils/email.js');
          await sendTicketResponseEmail(user.email, user.fullName, ticket, message).catch(() => {});

          // Send push notification
          await sendNotificationToUser(
            ticket.createdBy.userId,
            'Support Ticket Response',
            `Admin responded to your ticket "${ticket.subject}"`
          ).catch(() => {});
        }
      } catch (notifError) {
        console.error('Failed to send ticket response notification:', notifError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update support ticket status
// @route   PATCH /api/admin/support/tickets/:id/status
// @access  Protected (Admin)
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (open, in_progress, resolved, closed)'
      });
    }

    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = status;

    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
      ticket.closedBy = {
        userId: req.user._id,
        userModel: 'Admin'
      };
    }

    if (status === 'closed') {
      ticket.closedAt = new Date();
      ticket.closedBy = {
        userId: req.user._id,
        userModel: 'Admin'
      };
    }

    // Add system message
    const systemMessage = {
      sender: {
        senderId: req.user._id,
        senderModel: 'Admin',
        senderName: req.user.fullName
      },
      message: `Ticket ${status} by admin.${reason ? ` Reason: ${reason}` : ''}`,
      internal: false
    };
    ticket.messages.push(systemMessage);

    await ticket.save();

    // Notify user
    try {
      const UserModel = ticket.createdBy.userModel === 'User'
        ? (await import('../models/userModel.js')).default
        : (await import('../models/artisanModel.js')).default;
      const user = await UserModel.findById(ticket.createdBy.userId).lean();

      if (user) {
        // Create in-app notification
        await Notification.create({
          ownerId: ticket.createdBy.userId,
          ownerType: ticket.createdBy.userModel === 'User' ? 'user' : 'artisan',
          title: `Ticket ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          text: `Your support ticket "${ticket.subject}" has been ${status}`,
          url: `/support/tickets/${ticket._id}`,
          read: false
        });

        // Send email
        const { sendTicketStatusEmail } = await import('../utils/email.js');
        await sendTicketStatusEmail(user.email, user.fullName, ticket, status).catch(() => {});

        // Send push notification
        await sendNotificationToUser(
          ticket.createdBy.userId,
          `Ticket ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          `Your support ticket "${ticket.subject}" has been ${status}`
        ).catch(() => {});
      }
    } catch (notifError) {
      console.error('Failed to send ticket status notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


