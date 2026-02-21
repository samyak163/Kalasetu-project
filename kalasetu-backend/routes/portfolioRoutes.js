/**
 * @file portfolioRoutes.js — Artisan Portfolio Management Routes
 *
 * CRUD for artisan portfolio projects and their images. All routes
 * require artisan authentication via router-level protect middleware.
 * The public portfolio view is served via artisanRoutes.js instead.
 *
 * Mounted at: /api/artisan/portfolio
 *
 * Routes (all artisan protect):
 *  GET    /projects              — List own portfolio projects
 *  POST   /projects              — Create a project
 *  POST   /projects/:id/images   — Add images to a project
 *  DELETE /projects/:id/images   — Remove an image
 *  PATCH  /projects/:id/cover    — Set cover image
 *  PATCH  /projects/:id/reorder  — Reorder images
 *  PATCH  /projects/:id          — Update project metadata
 *  DELETE /projects/:id          — Delete a project
 *
 * @see controllers/portfolioController.js — Handler implementations
 * @see routes/artisanRoutes.js — Public portfolio (GET /:publicId/portfolio)
 * @see models/Project.js — Portfolio project schema
 */
import express from 'express';
import {
  getProjects,
  createProject,
  addImages,
  deleteImage,
  setCoverImage,
  reorderImages,
  updateProject,
  deleteProject
} from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require artisan authentication
router.use(protect);

router.get('/projects', getProjects);
router.post('/projects', createProject);
router.post('/projects/:id/images', addImages);
router.delete('/projects/:id/images', deleteImage);
router.patch('/projects/:id/cover', setCoverImage);
router.patch('/projects/:id/reorder', reorderImages);
router.patch('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

export default router;

