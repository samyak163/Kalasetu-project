import asyncHandler from '../utils/asyncHandler.js';
import Review from '../models/reviewModel.js';
import Artisan from '../models/artisanModel.js';
import Booking from '../models/bookingModel.js';
import { sendEmail } from '../utils/email.js';

export const createReview = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { artisanId, bookingId, rating, comment, images = [] } = req.body;

  if (!artisanId || !rating) {
    return res.status(400).json({ success: false, message: 'artisanId and rating are required' });
  }

  // Check if user has a completed booking with this artisan (required for review)
  const bookingQuery = {
    artisan: artisanId,
    user: userId,
    status: { $in: ['completed', 'confirmed'] }, // Allow reviews for completed or confirmed bookings
  };

  // If bookingId is provided, verify it belongs to the user and artisan
  if (bookingId) {
    bookingQuery._id = bookingId;
  }

  const validBooking = await Booking.findOne(bookingQuery).lean();

  if (!validBooking) {
    return res.status(403).json({
      success: false,
      message: 'You can only leave a review for artisans you have booked and completed services with.',
    });
  }

  // Check if user already reviewed this artisan for this booking
  const existingReview = await Review.findOne({
    artisan: artisanId,
    user: userId,
    booking: bookingId || validBooking._id,
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this booking.',
    });
  }

  // Create review with verified booking (mark as verified since booking exists)
  const review = await Review.create({
    artisan: artisanId,
    user: userId,
    booking: bookingId || validBooking._id,
    rating,
    comment,
    images,
    isVerified: true, // Verified purchase - user has completed booking
  });

  await recomputeRating(artisanId);
  
  // Send email notification to artisan (non-blocking, errors won't crash the request)
  try {
    const artisan = await Artisan.findById(artisanId).select('email fullName').lean();
    if (artisan?.email) {
      await sendEmail({
        to: artisan.email,
        subject: 'You received a new review on KalaSetu',
        text: `You have a new review: ${rating}★\n\n${comment || ''}`,
      });
    }
  } catch (emailError) {
    // Log error but don't fail the review creation
    console.error('Failed to send review notification email:', emailError);
  }
  
  res.status(201).json({ success: true, data: review });
});

export const getArtisanReviews = asyncHandler(async (req, res) => {
  const { artisanId } = req.params;
  const { page = 1, limit = 20, sort = 'recent', star } = req.query;
  const filter = { artisan: artisanId, status: 'active' };
  if (star) filter.rating = Number(star);
  const sortMap = { recent: { createdAt: -1 }, helpful: { helpfulVotes: -1 }, rating: { rating: -1 } };
  const reviews = await Review.find(filter)
    .populate('user', 'fullName profileImageUrl')
    .sort(sortMap[sort] || sortMap.recent)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const count = await Review.countDocuments(filter);
  res.json({ success: true, data: reviews, count });
});

export const toggleHelpful = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { id } = req.params;
  const r = await Review.findById(id);
  if (!r) return res.status(404).json({ success: false, message: 'Not found' });
  const has = r.helpfulVotes.some(u => String(u) === String(userId));
  r.helpfulVotes = has ? r.helpfulVotes.filter(u => String(u) !== String(userId)) : [...r.helpfulVotes, userId];
  await r.save();
  res.json({ success: true });
});

async function recomputeRating(artisanId) {
  const all = await Review.find({ artisan: artisanId, status: 'active' }).select('rating');
  const count = all.length;
  const sum = all.reduce((a, r) => a + (r.rating || 0), 0);
  const average = count ? Number((sum / count).toFixed(1)) : 0;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  all.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });
  await Artisan.findByIdAndUpdate(artisanId, { $set: { rating: average, reviewCount: count } });
}


