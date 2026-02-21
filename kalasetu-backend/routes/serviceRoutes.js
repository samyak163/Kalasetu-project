/**
 * @file serviceRoutes.js — Artisan Service CRUD Routes
 *
 * CRUD for artisan services (offerings with pricing, duration, etc.).
 * Public listing endpoints are unauthenticated; mutation endpoints
 * require artisan `protect` middleware.
 *
 * Mounted at: /api/services
 *
 * Public routes:
 *  GET /                  — List all services (with filters)
 *  GET /artisan/:publicId — Get services for a specific artisan
 *
 * Protected routes (artisan protect):
 *  POST   /     — Create a new service
 *  PATCH  /:id  — Update a service
 *  DELETE /:id  — Delete a service
 *
 * @see controllers/artisanServiceController.js — Handler implementations
 */
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { listServices, listMyServices, createService, updateService, deleteService, getServicesByArtisanPublicId, getServiceStats } from '../controllers/artisanServiceController.js';

const router = express.Router();

// Controllers are already wrapped in asyncHandler — no need to double-wrap
router.get('/', listServices);
router.get('/mine', protect, listMyServices); // Artisan's own services (includes archived)
router.get('/artisan/:publicId', getServicesByArtisanPublicId);
router.get('/:serviceId/stats', getServiceStats);
router.post('/', protect, createService);
router.patch('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

export default router;


