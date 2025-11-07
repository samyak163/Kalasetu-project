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

