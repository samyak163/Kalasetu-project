import express from 'express';
import { getArtisanSEO, getSitemapData, getSitemapXml } from '../controllers/seoController.js';

const router = express.Router();

router.get('/artisan/:publicId', getArtisanSEO);
router.get('/sitemap', getSitemapData);
router.get('/sitemap.xml', getSitemapXml);

export default router;


