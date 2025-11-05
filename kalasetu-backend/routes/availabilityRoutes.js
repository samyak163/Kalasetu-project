import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Availability from '../models/availabilityModel.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Get availability for current artisan
router.get('/', protect, asyncHandler(async (req, res) => {
  const doc = await Availability.findOne({ artisan: req.user._id });
  res.json({ success: true, data: doc });
}));

// Upsert availability
router.post('/', protect, asyncHandler(async (req, res) => {
  const updated = await Availability.findOneAndUpdate(
    { artisan: req.user._id },
    { $set: { ...req.body, artisan: req.user._id } },
    { new: true, upsert: true }
  );
  res.json({ success: true, data: updated });
}));

export default router;


