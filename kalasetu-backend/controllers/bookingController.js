import asyncHandler from '../utils/asyncHandler.js';
import { z } from 'zod';
import Booking from '../models/bookingModel.js';
import ArtisanService from '../models/artisanServiceModel.js';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';
import { createDirectMessageChannel, upsertStreamUser, sendMessage } from '../utils/streamChat.js';
import { createDailyRoom } from '../utils/dailyco.js';

const createBookingSchema = z.object({
  artisan: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid artisan ID'),
  serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  start: z.string().min(1, 'Start time is required'),
  end: z.string().optional(),
  notes: z.string().max(500).optional(),
  price: z.number().min(0).max(500000).optional(),
});

export const createBooking = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
  }
  const { artisan: artisanId, serviceId, start, end, notes, price } = parsed.data;

  // Validate artisan exists and is active
  const artisanDoc = await Artisan.findById(artisanId).select('isActive').lean();
  if (!artisanDoc) return res.status(404).json({ success: false, message: 'Artisan not found' });
  if (artisanDoc.isActive === false) {
    return res.status(400).json({ success: false, message: 'This artisan is not currently accepting bookings' });
  }

  let service = null;
  let serviceName = '';
  let categoryName = '';
  let durationMinutes = 60;

  if (serviceId) {
    service = await ArtisanService.findById(serviceId).lean();
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    if (String(service.artisan) !== String(artisanId)) {
      return res.status(400).json({ success: false, message: 'Service does not belong to artisan' });
    }
    serviceName = service.name || '';
    categoryName = service.categoryName || '';
    durationMinutes = service.durationMinutes || 60;
  }

  const startTime = new Date(start);
  if (isNaN(startTime.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid start time' });
  }
  if (startTime <= new Date()) {
    return res.status(400).json({ success: false, message: 'Start time must be in the future' });
  }

  const endTime = end ? new Date(end) : new Date(startTime.getTime() + durationMinutes * 60000);
  if (isNaN(endTime.getTime()) || endTime <= startTime) {
    return res.status(400).json({ success: false, message: 'End time must be after start time' });
  }

  // Check for overlapping bookings
  const overlap = await Booking.findOne({
    artisan: artisanId,
    status: { $in: ['pending', 'confirmed'] },
    start: { $lt: endTime },
    end: { $gt: startTime },
  }).lean();
  if (overlap) {
    return res.status(409).json({ success: false, message: 'This time slot is already booked' });
  }

  const finalPrice = price ?? service?.price ?? 0;
  const booking = await Booking.create({
    artisan: artisanId,
    user: userId,
    service: service?._id,
    serviceName,
    categoryName,
    start: startTime,
    end: endTime,
    notes: notes || '',
    price: finalPrice,
  });
  res.status(201).json({ success: true, data: booking });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const list = await Booking.find({ user: userId })
    .populate('artisan', 'fullName publicId profileImageUrl')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: list });
});

export const getArtisanBookings = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  const list = await Booking.find({ artisan: artisanId })
    .populate('user', 'fullName phoneNumber email')
    .populate('service', 'name')
    .sort({ start: 1 })
    .lean();
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

const ensureCommunicationChannels = async (booking) => {
  if (!booking) return booking;
  const artisan = await Artisan.findById(booking.artisan).lean();
  const user = await User.findById(booking.user).lean();
  if (!artisan || !user) return booking;

  // Upsert Stream users and ensure DM channel
  try {
    await Promise.all([upsertStreamUser(artisan), upsertStreamUser(user)]);
    if (!booking.chatChannelId) {
      const channel = await createDirectMessageChannel(artisan._id.toString(), user._id.toString());
      if (channel?.id) {
        booking.chatChannelId = channel.id;
        await Booking.updateOne({ _id: booking._id }, { chatChannelId: channel.id });
        // Notify user in channel
        await sendMessage(channel.type || 'messaging', channel.id, artisan._id.toString(), `Booking confirmed for ${booking.serviceName || 'your request'}!`);
      }
    }
  } catch (err) {
    console.error('Failed to prepare Stream chat for booking', err.message);
  }

  // Ensure Daily room
  try {
    if (!booking.videoRoomName) {
      const roomName = `booking-${booking._id}`;
      const room = await createDailyRoom({
        name: roomName,
        privacy: 'private',
        maxParticipants: 2,
      });
      if (room?.name) {
        booking.videoRoomName = room.name;
        booking.videoRoomUrl = room.url || '';
        await Booking.updateOne({ _id: booking._id }, { videoRoomName: booking.videoRoomName, videoRoomUrl: booking.videoRoomUrl });
      }
    }
  } catch (err) {
    console.error('Failed to prepare Daily room for booking', err.message);
  }

  return booking;
};

export const respondToBooking = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  const { id } = req.params;
  const { action, reason } = req.body || {};

  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (String(booking.artisan) !== String(artisanId)) return res.status(403).json({ success: false, message: 'Forbidden' });
  if (booking.status !== 'pending') return res.status(400).json({ success: false, message: 'Booking already handled' });

  booking.respondedAt = new Date();

  if (action === 'accept') {
    booking.status = 'confirmed';
    booking.rejectionReason = '';
    await booking.save();
    await ensureCommunicationChannels(booking);
    return res.json({ success: true, data: booking });
  }

  if (action === 'reject') {
    booking.status = 'rejected';
    booking.rejectionReason = reason || '';
    await booking.save();
    return res.json({ success: true, data: booking });
  }

  res.status(400).json({ success: false, message: 'Invalid action' });
});

export const completeBooking = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id;
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (String(booking.artisan) !== String(artisanId)) return res.status(403).json({ success: false, message: 'Forbidden' });
  if (booking.status !== 'confirmed') {
    return res.status(400).json({ success: false, message: 'Only confirmed bookings can be marked as completed' });
  }

  booking.status = 'completed';
  booking.completedAt = new Date();
  await booking.save();
  res.json({ success: true, data: booking });
});


