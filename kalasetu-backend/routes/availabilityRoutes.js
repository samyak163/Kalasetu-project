import express from 'express';
import { z } from 'zod';
import { protect } from '../middleware/authMiddleware.js';
import Availability from '../models/availabilityModel.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Zod schema to whitelist availability fields (prevents mass assignment)
const slotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean().optional(),
});

const availabilitySchema = z.object({
  recurringSchedule: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    slots: z.array(slotSchema),
  })).optional(),
  exceptions: z.array(z.object({
    date: z.string().or(z.date()),
    isAvailable: z.boolean(),
    slots: z.array(slotSchema).optional(),
    reason: z.string().max(200).optional(),
  })).max(90).optional(),
  bufferTime: z.number().int().min(0).max(480).optional(),
  advanceBookingDays: z.number().int().min(1).max(365).optional(),
  minNoticeHours: z.number().int().min(0).max(168).optional(),
});

// Get availability for current artisan
router.get('/', protect, asyncHandler(async (req, res) => {
  const doc = await Availability.findOne({ artisan: req.user._id });
  res.json({ success: true, data: doc });
}));

// Upsert availability (validated and whitelisted)
router.post('/', protect, asyncHandler(async (req, res) => {
  const parsed = availabilitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues.map(i => i.message).join(', '),
    });
  }

  const updated = await Availability.findOneAndUpdate(
    { artisan: req.user._id },
    { $set: { ...parsed.data, artisan: req.user._id } },
    { new: true, upsert: true }
  );
  res.json({ success: true, data: updated });
}));

export default router;
