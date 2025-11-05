import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending', index: true },
  notes: { type: String, default: '' },
  price: { type: Number, default: 0 },
  depositPaid: { type: Boolean, default: false },
}, { timestamps: true });

bookingSchema.index({ artisan: 1, start: 1, end: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
