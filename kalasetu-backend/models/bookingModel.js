import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'ArtisanService', index: true }, // optional for backward-compat
  serviceName: { type: String, default: '' }, // denormalized for search/listing
  categoryName: { type: String, default: '' },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'], default: 'pending', index: true },
  notes: { type: String, default: '' },
  price: { type: Number, default: 0 },
  depositPaid: { type: Boolean, default: false },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
  rejectionReason: { type: String, default: '' },
  chatChannelId: { type: String, default: '' },
  videoRoomName: { type: String, default: '' },
  videoRoomUrl: { type: String, default: '' },
}, { timestamps: true });

bookingSchema.index({ artisan: 1, start: 1, end: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
