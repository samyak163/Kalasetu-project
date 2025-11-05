import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getCallHistory } from '../controllers/callController.js';

const router = express.Router();

router.get('/history', protect, asyncHandler(getCallHistory));

export default router;


