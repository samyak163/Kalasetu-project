import express from 'express';
import { getArtisanSEO, getSitemapData } from '../controllers/seoController.js';

const router = express.Router();

router.get('/artisan/:publicId', getArtisanSEO);
router.get('/sitemap', getSitemapData);

export default router;


