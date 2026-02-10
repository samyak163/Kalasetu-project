import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
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

const Review = mongoose.model('Review', reviewSchema);
export default Review;