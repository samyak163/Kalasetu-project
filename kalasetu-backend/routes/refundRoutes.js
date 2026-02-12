import express from 'express';
import { protectAny } from '../middleware/authMiddleware.js';
import { createRefundRequest, getUserRefundRequests, getRefundRequestById } from '../controllers/refundController.js';

const router = express.Router();

router.post('/', protectAny, createRefundRequest);
router.get('/', protectAny, getUserRefundRequests);
router.get('/:id', protectAny, getRefundRequestById);

export default router;
