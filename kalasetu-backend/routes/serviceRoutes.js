import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';
import { listServices, createService, updateService, deleteService, getServicesByArtisanPublicId } from '../controllers/artisanServiceController.js';

const router = express.Router();

router.get('/', asyncHandler(listServices));
router.get('/artisan/:publicId', asyncHandler(getServicesByArtisanPublicId));
router.post('/', protect, asyncHandler(createService));
router.patch('/:id', protect, asyncHandler(updateService));
router.delete('/:id', protect, asyncHandler(deleteService));

export default router;


