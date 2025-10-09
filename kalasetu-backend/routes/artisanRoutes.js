import express from 'express';
const router = express.Router();
import { registerArtisan, loginArtisan, getAllArtisans, getArtisanById, } from '../controllers/artisanController.js';

// --- Define the routes ---

// When a POST request comes to /api/artisans/register, call the registerArtisan function
router.post('/register', registerArtisan);

// When a POST request comes to /api/artisans/login, call the loginArtisan function
router.post('/login', loginArtisan);

export default router;