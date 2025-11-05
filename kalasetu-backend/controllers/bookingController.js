import asyncHandler from '../utils/asyncHandler.js';
import Booking from '../models/bookingModel.js';

export const createBooking = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { artisan, start, end, notes, price } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (!artisan || !start || !end) return res.status(400).json({ success: false, message: 'artisan, start and end are required' });
  const booking = await Booking.create({ artisan, user: userId, start, end, notes: notes || '', price: price || 0 });
  res.status(201).json({ success: true, data: booking });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const list = await Booking.find({ user: userId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: list });
});

export const getArtisanBookings = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  const list = await Booking.find({ artisan: artisanId }).sort({ start: 1 }).lean();
  res.json({ success: true, data: list });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;
  const b = await Booking.findById(id);
  if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
  const isOwner = String(b.user) === String(userId) || String(b.artisan) === String(userId);
  if (!isOwner) return res.status(403).json({ success: false, message: 'Forbidden' });
  b.status = 'cancelled';
  await b.save();
  res.json({ success: true, data: { id: b._id, status: b.status } });
});


