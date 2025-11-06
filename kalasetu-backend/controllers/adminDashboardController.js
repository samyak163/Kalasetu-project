import Admin from '../models/adminModel.js';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';
import Review from '../models/reviewModel.js';
import Payment from '../models/paymentModel.js';
import Booking from '../models/bookingModel.js';

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

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const [artisanCount, userCount] = await Promise.all([
        Artisan.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
        User.countDocuments({ createdAt: { $gte: date, $lt: nextDate } })
      ]);
      last7Days.push({ date: date.toISOString().split('T')[0], artisans: artisanCount, users: userCount });
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
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

export const getAllArtisans = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all', verified = 'all', sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== 'all') query.isActive = status === 'active';
    if (verified !== 'all') query.isVerified = verified === 'verified';
    const artisans = await Artisan.find(query).select('-password').sort(sort).limit(limit * 1).skip((page - 1) * limit).lean();
    const count = await Artisan.countDocuments(query);
    res.status(200).json({ success: true, data: artisans, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (error) {
    console.error('Get artisans error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch artisans' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-password').sort(sort).limit(limit * 1).skip((page - 1) * limit).lean();
    const count = await User.countDocuments(query);
    res.status(200).json({ success: true, data: users, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (error) {
    console.error('Get users error:', error);
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
    console.error('Verify artisan error:', error);
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
    console.error('Update artisan status error:', error);
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
    console.error('Delete artisan error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete artisan' });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', sort = '-createdAt' } = req.query;
    const query = {};
    if (status !== 'all') query.status = status;
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
    console.error('Get reviews error:', error);
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
    console.error('Moderate review error:', error);
    res.status(500).json({ success: false, message: 'Failed to moderate review' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await req.user.logActivity('delete_review', 'review', id, { reason });
    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
};


