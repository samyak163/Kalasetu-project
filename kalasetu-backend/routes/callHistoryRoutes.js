import express from 'express';
import {
  getCallHistory,
  createCallHistory,
  updateCallHistory,
} from '../controllers/callHistoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { userProtect } from '../middleware/userProtectMiddleware.js';

const router = express.Router();

// Custom middleware: try artisan auth first, then user auth
const authMiddleware = async (req, res, next) => {
  try {
    await protect(req, res, next);
  } catch (artisanError) {
    try {
      await userProtect(req, res, next);
    } catch (userError) {
      res.status(401).json({ message: 'Not authorized. Please log in.' });
    }
  }
};

router.use(authMiddleware);

router.route('/').get(getCallHistory).post(createCallHistory);

router.route('/:id').put(updateCallHistory);

export default router;
