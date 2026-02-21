/**
 * @file availabilityController.js — Public Artisan Availability
 *
 * Returns available time slots for a given artisan on a specific date.
 * Synthesizes three data sources:
 *  1. Availability model (recurringSchedule + exceptions) — preferred
 *  2. Artisan model workingHours — fallback if no Availability doc
 *  3. Existing bookings — subtracted to show only free slots
 *
 * Endpoint:
 *  GET /api/artisans/:publicId/availability?date=YYYY-MM-DD
 *  Returns: { success: true, data: { date, slots: [{ time, available }], meta } }
 *
 * This is a PUBLIC endpoint (no auth). Customer-facing DateTimePicker uses it.
 *
 * @see models/availabilityModel.js — Recurring schedule + exceptions
 * @see models/artisanModel.js — Legacy workingHours + minimumBookingNotice
 * @see models/bookingModel.js — Existing bookings for conflict detection
 */

import asyncHandler from '../utils/asyncHandler.js';
import Artisan from '../models/artisanModel.js';
import Availability from '../models/availabilityModel.js';
import Booking from '../models/bookingModel.js';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const SLOT_DURATION = 60; // minutes per slot — matches default service duration

/**
 * Parse "HH:MM" string to total minutes since midnight.
 */
function parseTime(str) {
  if (!str || !str.includes(':')) return null;
  const [h, m] = str.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

/**
 * Format minutes since midnight to "HH:MM".
 */
function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Generate time slots from a start/end range, split by slotDuration.
 * Returns array of minute values (start of each slot).
 */
function generateSlotStarts(startMin, endMin, slotDuration) {
  const slots = [];
  for (let t = startMin; t + slotDuration <= endMin; t += slotDuration) {
    slots.push(t);
  }
  return slots;
}

/**
 * GET /api/artisans/:publicId/availability?date=YYYY-MM-DD
 *
 * Returns available time slots for the given date.
 */
export const getAvailability = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter "date" is required in YYYY-MM-DD format',
    });
  }

  // Parse date in local context (IST assumed for Indian marketplace)
  const requestedDate = new Date(`${date}T00:00:00+05:30`);
  if (isNaN(requestedDate.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid date' });
  }

  // Don't allow past dates
  const todayIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  todayIST.setHours(0, 0, 0, 0);
  if (requestedDate < todayIST) {
    return res.json({ success: true, data: { date, slots: [], meta: { reason: 'past_date' } } });
  }

  // Find artisan by publicId
  const artisan = await Artisan.findOne({ publicId })
    .select('_id workingHours minimumBookingNotice bufferTimeBetweenBookings maxBookingsPerDay')
    .lean();

  if (!artisan) {
    return res.status(404).json({ success: false, message: 'Artisan not found' });
  }

  const artisanId = artisan._id;
  // Derive day-of-week from the date string directly (UTC-safe).
  // requestedDate.getDay() uses UTC internally, but "2026-02-19T00:00:00+05:30"
  // is "2026-02-18T18:30:00Z" — getDay() would return the WRONG day for IST dates.
  const [year, month, dayNum] = date.split('-').map(Number);
  const dayOfWeek = new Date(Date.UTC(year, month - 1, dayNum)).getUTCDay();
  const dayName = DAY_NAMES[dayOfWeek];

  // Check advance booking limit from Availability model
  const availabilityDoc = await Availability.findOne({ artisan: artisanId }).lean();
  const advanceBookingDays = availabilityDoc?.advanceBookingDays || 30;
  const maxDate = new Date(todayIST);
  maxDate.setDate(maxDate.getDate() + advanceBookingDays);
  if (requestedDate > maxDate) {
    return res.json({
      success: true,
      data: { date, slots: [], meta: { reason: 'too_far_ahead', advanceBookingDays } },
    });
  }

  // Determine working slots for this day
  // Priority: Availability exceptions > Availability recurringSchedule > Artisan workingHours
  let rawSlots = []; // Array of { startMin, endMin }

  // Check for date-specific exception first
  const exception = availabilityDoc?.exceptions?.find(
    (ex) => new Date(ex.date).toISOString().slice(0, 10) === date
  );

  if (exception) {
    if (!exception.isAvailable) {
      // Artisan marked this date as unavailable
      return res.json({
        success: true,
        data: { date, slots: [], meta: { reason: 'day_off', note: exception.reason || '' } },
      });
    }
    // Exception with custom slots
    if (exception.slots?.length > 0) {
      rawSlots = exception.slots
        .filter((s) => s.isActive !== false)
        .map((s) => ({ startMin: parseTime(s.startTime), endMin: parseTime(s.endTime) }))
        .filter((s) => s.startMin !== null && s.endMin !== null && s.endMin > s.startMin);
    }
  }

  // Fall back to recurring schedule from Availability model
  if (rawSlots.length === 0 && availabilityDoc?.recurringSchedule?.length > 0) {
    const daySchedule = availabilityDoc.recurringSchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (daySchedule?.slots?.length > 0) {
      rawSlots = daySchedule.slots
        .filter((s) => s.isActive !== false)
        .map((s) => ({ startMin: parseTime(s.startTime), endMin: parseTime(s.endTime) }))
        .filter((s) => s.startMin !== null && s.endMin !== null && s.endMin > s.startMin);
    }
  }

  // Fall back to artisan model workingHours (legacy)
  if (rawSlots.length === 0 && artisan.workingHours?.[dayName]) {
    const dayHours = artisan.workingHours[dayName];
    if (dayHours.active && dayHours.start && dayHours.end) {
      const startMin = parseTime(dayHours.start);
      const endMin = parseTime(dayHours.end);
      if (startMin !== null && endMin !== null && endMin > startMin) {
        rawSlots = [{ startMin, endMin }];
      }
    }
  }

  // If no working hours for this day, return empty
  if (rawSlots.length === 0) {
    return res.json({
      success: true,
      data: { date, slots: [], meta: { reason: 'closed' } },
    });
  }

  // Generate individual time slots from ranges
  const bufferTime = availabilityDoc?.bufferTime || artisan.bufferTimeBetweenBookings || 0;
  const effectiveSlotDuration = SLOT_DURATION + bufferTime;

  const allSlotStarts = [];
  for (const range of rawSlots) {
    allSlotStarts.push(...generateSlotStarts(range.startMin, range.endMin, effectiveSlotDuration));
  }

  if (allSlotStarts.length === 0) {
    return res.json({
      success: true,
      data: { date, slots: [], meta: { reason: 'no_slots' } },
    });
  }

  // Fetch existing bookings for this artisan on this date
  const dayStart = new Date(`${date}T00:00:00+05:30`);
  const dayEnd = new Date(`${date}T23:59:59+05:30`);

  const existingBookings = await Booking.find({
    artisan: artisanId,
    status: { $in: ['pending', 'confirmed'] },
    start: { $lt: dayEnd },
    end: { $gt: dayStart },
  })
    .select('start end')
    .lean();

  // Check max bookings per day limit
  const maxPerDay = artisan.maxBookingsPerDay || 0; // 0 = unlimited
  const dayBookingCount = existingBookings.length;

  // Compute minimum notice cutoff
  const minNoticeHours = availabilityDoc?.minNoticeHours || artisan.minimumBookingNotice || 0;
  const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const noticeCutoff = new Date(nowIST.getTime() + minNoticeHours * 60 * 60 * 1000);

  // Build slot availability
  const slots = allSlotStarts.map((slotStartMin) => {
    const time = formatTime(slotStartMin);
    const slotEndMin = slotStartMin + SLOT_DURATION;

    // Build Date objects for this slot to check against bookings
    const slotStart = new Date(`${date}T${time}:00+05:30`);
    const slotEnd = new Date(`${date}T${formatTime(slotEndMin)}:00+05:30`);

    // Check minimum booking notice
    if (slotStart < noticeCutoff) {
      return { time, available: false, reason: 'too_soon' };
    }

    // Check if max bookings per day exceeded
    if (maxPerDay > 0 && dayBookingCount >= maxPerDay) {
      return { time, available: false, reason: 'day_full' };
    }

    // Check for booking conflicts
    const hasConflict = existingBookings.some((b) => {
      const bStart = new Date(b.start);
      const bEnd = new Date(b.end);
      return slotStart < bEnd && slotEnd > bStart;
    });

    if (hasConflict) {
      return { time, available: false, reason: 'booked' };
    }

    return { time, available: true };
  });

  res.json({
    success: true,
    data: {
      date,
      slots,
      meta: {
        slotDurationMinutes: SLOT_DURATION,
        bufferMinutes: bufferTime,
        minNoticeHours,
        advanceBookingDays,
      },
    },
  });
});
