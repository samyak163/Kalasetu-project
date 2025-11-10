import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';
import { listServices, createService, updateService, deleteService } from '../controllers/artisanServiceController.js';

const router = express.Router();

router.get('/', asyncHandler(listServices));
router.post('/', protect, asyncHandler(createService));
router.patch('/:id', protect, asyncHandler(updateService));
router.delete('/:id', protect, asyncHandler(deleteService));

export default router;


