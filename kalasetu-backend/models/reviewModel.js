/**
 * @file reviewModel.js — Service Review & Rating Schema
 * @collection reviews
 *
 * Customer reviews of artisan services. Only customers (Users) can create reviews;
 * artisans can respond to reviews with a single reply.
 *
 * Key fields:
 *  - rating (1-5)      — Numeric star rating (required)
 *  - comment           — Review text (required, max 1000 chars)
 *  - images            — Optional photo evidence
 *  - response          — Artisan's reply (text + timestamp)
 *  - helpfulVotes      — Array of User IDs who found this review helpful
 *  - isVerified        — Whether the review is from a verified purchase/booking
 *  - status            — Moderation state (active/flagged/removed)
 *
 * Uniqueness constraint:
 *  - Partial unique index on (user + booking) — One review per booking per user.
 *    The partial filter ensures the index only applies when booking is an ObjectId
 *    (allows reviews without a booking reference for backward-compat).
 *
 * @exports {Model} Review — Mongoose model
 *
 * @see controllers/reviewController.js — Review CRUD and moderation
 * @see models/artisanModel.js — averageRating and totalReviews (denormalized stats)
 */

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  // Per-service reference — auto-populated from booking.service when creating a review.
  // Enables per-service rating aggregation without joining through bookings.
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'ArtisanService' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true, maxLength: 1000, trim: true },
  images: [{ type: String }],
  response: {
    text: { type: String, maxLength: 500 },
    createdAt: Date
  },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'flagged', 'removed'], default: 'active' }
}, { timestamps: true });

reviewSchema.index({ user: 1, booking: 1 }, { unique: true, partialFilterExpression: { booking: { $type: 'objectId' } } });
reviewSchema.index({ artisan: 1, status: 1 });
reviewSchema.index({ service: 1, status: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;