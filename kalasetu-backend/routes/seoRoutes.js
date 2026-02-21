/**
 * @file seoRoutes.js — SEO & Sitemap Routes
 *
 * Public endpoints for search engine optimization: structured data for
 * artisan profiles, JSON sitemap data, and XML sitemap generation.
 * No authentication required — these are consumed by crawlers.
 *
 * Mounted at: /api/seo
 *
 * Routes (all public):
 *  GET /artisan/:publicId — JSON-LD structured data for an artisan profile
 *  GET /sitemap           — Sitemap data as JSON
 *  GET /sitemap.xml       — XML sitemap for search engine submission
 *
 * @see controllers/seoController.js — Handler implementations
 */
import express from 'express';
import { getArtisanSEO, getSitemapData, getSitemapXml } from '../controllers/seoController.js';

const router = express.Router();

router.get('/artisan/:publicId', getArtisanSEO);
router.get('/sitemap', getSitemapData);
router.get('/sitemap.xml', getSitemapXml);

export default router;


