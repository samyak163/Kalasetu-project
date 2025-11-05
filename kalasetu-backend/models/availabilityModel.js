import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  startTime: String,
  endTime: String,
  isActive: { type: Boolean, default: true }
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true, unique: true },
  recurringSchedule: [{ dayOfWeek: { type: Number, min: 0, max: 6 }, slots: [slotSchema] }],
  exceptions: [{ date: Date, isAvailable: Boolean, slots: [slotSchema], reason: String }],
  bufferTime: { type: Number, default: 30 },
  advanceBookingDays: { type: Number, default: 30 },
  minNoticeHours: { type: Number, default: 24 }
}, { timestamps: true });

const Availability = mongoose.model('Availability', availabilitySchema);
export default Availability;


