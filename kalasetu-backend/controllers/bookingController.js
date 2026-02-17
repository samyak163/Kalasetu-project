import asyncHandler from '../utils/asyncHandler.js';
import { z } from 'zod';
import mongoose from 'mongoose';
import Booking from '../models/bookingModel.js';
import ArtisanService from '../models/artisanServiceModel.js';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';
import { createDirectMessageChannel, upsertStreamUser, sendMessage } from '../utils/streamChat.js';
import { createDailyRoom } from '../utils/dailyco.js';
import { createNotification } from '../utils/notificationService.js';

const createBookingSchema = z.object({
  artisan: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid artisan ID'),
  serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  start: z.string().min(1, 'Start time is required'),
  end: z.string().optional(),
  notes: z.string().max(500).optional(),
  // price intentionally omitted — always derived from service price server-side
});

export const createBooking = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
  }
  const { artisan: artisanId, serviceId, start, end, notes } = parsed.data;

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

  // Check for overlapping bookings within a transaction to prevent race conditions
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const overlap = await Booking.findOne({
      artisan: artisanId,
      status: { $in: ['pending', 'confirmed'] },
      start: { $lt: endTime },
      end: { $gt: startTime },
    }).session(session);

    if (overlap) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }

    // Server-authoritative pricing: always use service price, never trust client
    const finalPrice = service?.price ?? 0;

    // .create() requires array syntax when using sessions
    const [booking] = await Booking.create([{
      artisan: artisanId,
      user: userId,
      service: service?._id,
      serviceName,
      categoryName,
      start: startTime,
      end: endTime,
      notes: notes || '',
      price: finalPrice,
    }], { session });

    await session.commitTransaction();

    // Notify artisan about new booking request
    const startDate = new Date(startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    createNotification({
      ownerId: artisanId,
      ownerType: 'artisan',
      title: 'New Booking Request',
      text: `You have a new booking request for ${serviceName || 'a service'} on ${startDate}. Please respond to confirm or decline.`,
    }).catch(() => {}); // non-blocking

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    await session.abortTransaction();
    throw err; // asyncHandler catches and passes to errorMiddleware
  } finally {
    session.endSession(); // CRITICAL: prevent connection leaks
  }
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
  const { reason } = req.body || {};
  const b = await Booking.findById(id);
  if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
  const isOwner = String(b.user) === String(userId) || String(b.artisan) === String(userId);
  if (!isOwner) return res.status(403).json({ success: false, message: 'Forbidden' });
  if (['completed', 'cancelled'].includes(b.status)) {
    return res.status(400).json({ success: false, message: `Cannot cancel a ${b.status} booking` });
  }
  b.status = 'cancelled';
  b.cancellationReason = reason || '';
  b.cancelledBy = userId;
  await b.save();

  // Notify the other party about cancellation
  const isUserCancelling = String(b.user) === String(userId);
  const notifyId = isUserCancelling ? b.artisan : b.user;
  const notifyType = isUserCancelling ? 'artisan' : 'user';
  createNotification({
    ownerId: notifyId,
    ownerType: notifyType,
    title: 'Booking Cancelled',
    text: `A booking for ${b.serviceName || 'a service'} has been cancelled.${reason ? ' Reason: ' + reason : ''}`,
  }).catch(() => {}); // non-blocking

  res.json({ success: true, data: { id: b._id, status: b.status } });
});

const modifyBookingSchema = z.object({
  newStart: z.string().min(1, 'New start time required'),
  newEnd: z.string().optional(),
  reason: z.string().max(300).optional(),
});

// User or artisan requests to modify a confirmed booking's time
export const requestModification = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  const parsed = modifyBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
  }

  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  const isOwner = String(booking.user) === String(userId) || String(booking.artisan) === String(userId);
  if (!isOwner) return res.status(403).json({ success: false, message: 'Forbidden' });

  if (!['pending', 'confirmed'].includes(booking.status)) {
    return res.status(400).json({ success: false, message: 'Only pending or confirmed bookings can be modified' });
  }

  if (booking.modificationRequest?.status === 'pending') {
    return res.status(400).json({ success: false, message: 'A modification request is already pending' });
  }

  const newStart = new Date(parsed.data.newStart);
  if (isNaN(newStart.getTime()) || newStart <= new Date()) {
    return res.status(400).json({ success: false, message: 'New start time must be in the future' });
  }

  const duration = booking.end.getTime() - booking.start.getTime();
  const newEnd = parsed.data.newEnd ? new Date(parsed.data.newEnd) : new Date(newStart.getTime() + duration);

  booking.modificationRequest = {
    newStart,
    newEnd,
    reason: parsed.data.reason || '',
    requestedBy: userId,
    requestedAt: new Date(),
    status: 'pending',
  };
  await booking.save();

  res.json({ success: true, data: booking });
});

// The other party responds to a modification request
export const respondToModification = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;
  const { action } = req.body || {};

  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  const isOwner = String(booking.user) === String(userId) || String(booking.artisan) === String(userId);
  if (!isOwner) return res.status(403).json({ success: false, message: 'Forbidden' });

  if (!booking.modificationRequest || booking.modificationRequest.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'No pending modification request' });
  }

  // The responder must be different from the requester
  if (String(booking.modificationRequest.requestedBy) === String(userId)) {
    return res.status(400).json({ success: false, message: 'You cannot respond to your own modification request' });
  }

  if (action === 'approve') {
    booking.start = booking.modificationRequest.newStart;
    booking.end = booking.modificationRequest.newEnd;
    booking.modificationRequest.status = 'approved';
    await booking.save();
    return res.json({ success: true, data: booking });
  }

  if (action === 'reject') {
    booking.modificationRequest.status = 'rejected';
    await booking.save();
    return res.json({ success: true, data: booking });
  }

  res.status(400).json({ success: false, message: 'Invalid action (use approve or reject)' });
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

    // Notify the customer that booking is confirmed
    const startDate = new Date(booking.start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const startTime = new Date(booking.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    createNotification({
      ownerId: booking.user,
      ownerType: 'user',
      title: 'Booking Confirmed',
      text: `Your booking for ${booking.serviceName || 'a service'} on ${startDate} at ${startTime} has been confirmed.`,
      url: '/dashboard/bookings',
    }).catch(() => {}); // non-blocking

    return res.json({ success: true, data: booking });
  }

  if (action === 'reject') {
    booking.status = 'rejected';
    booking.rejectionReason = reason || '';
    await booking.save();

    // Notify the customer that booking was rejected
    createNotification({
      ownerId: booking.user,
      ownerType: 'user',
      title: 'Booking Declined',
      text: `Your booking request for ${booking.serviceName || 'a service'} was declined.${reason ? ' Reason: ' + reason : ''}`,
      url: '/dashboard/bookings',
    }).catch(() => {}); // non-blocking

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

  // Notify customer — prompt for review
  createNotification({
    ownerId: booking.user,
    ownerType: 'user',
    title: 'Service Completed',
    text: `Your booking for ${booking.serviceName || 'a service'} has been marked as completed. How was your experience? Leave a review!`,
    url: '/dashboard/bookings',
  }).catch(() => {}); // non-blocking

  res.json({ success: true, data: booking });
});


