/**
 * @file availabilityModel.js — Artisan Availability Schedule Schema
 * @collection availabilities
 *
 * Defines when an artisan is available for bookings. Each artisan has
 * exactly one Availability document (artisan field is unique).
 *
 * Two scheduling modes:
 *  - recurringSchedule — Weekly repeating slots (e.g., Mon-Fri 9am-5pm)
 *    Each entry: { dayOfWeek: 0-6 (Sun-Sat), slots: [{ startTime, endTime }] }
 *  - exceptions        — One-off overrides (holidays, special availability)
 *    Each entry: { date, isAvailable, slots, reason }
 *
 * Booking constraints:
 *  - bufferTime          — Minutes between consecutive bookings (default 30)
 *  - advanceBookingDays  — How far ahead customers can book (default 30 days)
 *  - minNoticeHours      — Minimum hours before a booking start (default 24)
 *
 * @exports {Model} Availability — Mongoose model
 *
 * @see controllers/bookingController.js — Checks availability before confirming
 * @see kalasetu-frontend/src/components/profile/tabs/AvailabilityTab.jsx — UI editor
 */

import mongoose from 'mongoose';

/** Sub-schema for individual time slots within a day */
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


