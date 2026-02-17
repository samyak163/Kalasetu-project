import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import { z } from 'zod';
import Review from '../models/reviewModel.js';
import Artisan from '../models/artisanModel.js';
import Booking from '../models/bookingModel.js';
import { sendEmail } from '../utils/email.js';

const createReviewSchema = z.object({
  artisanId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid artisan ID'),
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID').optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(2000, 'Comment must be under 2000 characters').optional(),
  images: z.array(z.string().url()).max(10).optional(),
});

export const createReview = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
  }
  const { artisanId, bookingId, rating, comment, images = [] } = parsed.data;

  // Check if user has a completed booking with this artisan (required for review)
  const bookingQuery = {
    artisan: artisanId,
    user: userId,
    status: 'completed',
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

// Artisan responds to a review on their profile
const respondToReviewSchema = z.object({
  text: z.string().trim().min(1, 'Response cannot be empty').max(500, 'Response must be under 500 characters'),
});

export const respondToReview = asyncHandler(async (req, res) => {
  const artisanId = req.user._id || req.user.id;
  const { id } = req.params;

  const parsed = respondToReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
  }

  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  // Only the reviewed artisan can respond
  if (String(review.artisan) !== String(artisanId)) {
    return res.status(403).json({ success: false, message: 'You can only respond to reviews on your profile' });
  }

  if (review.response?.text) {
    return res.status(400).json({ success: false, message: 'You have already responded to this review' });
  }

  review.response = { text: parsed.data.text, createdAt: new Date() };
  await review.save();

  res.json({ success: true, data: review });
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
  // Convert to ObjectId for aggregation pipeline (string IDs won't match)
  const objectId = new mongoose.Types.ObjectId(artisanId);
  const result = await Review.aggregate([
    { $match: { artisan: objectId, status: 'active' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const average = result.length ? Number(result[0].avg.toFixed(1)) : 0;
  const count = result.length ? result[0].count : 0;

  await Artisan.findByIdAndUpdate(artisanId, { $set: { averageRating: average, totalReviews: count } });
}


