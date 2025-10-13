import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    artisan: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Artisan' },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;