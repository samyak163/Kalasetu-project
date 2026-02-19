/**
 * @file searchController.js — Search & Discovery
 *
 * Server-side search fallback for artisan and service discovery.
 * The primary search experience uses Algolia on the frontend (InstantSearch);
 * this controller provides a backend fallback and additional search endpoints.
 *
 * Endpoints:
 *  GET /api/search/artisans   — Search artisans by name, craft, location
 *  GET /api/search/services   — Search services by name, category
 *  GET /api/search/categories — Search/list categories
 *
 * Tracks search events in PostHog for analytics.
 *
 * @see utils/algolia.js — Algolia indexing (artisan profiles)
 * @see kalasetu-frontend/src/components/ArtisanSearch.jsx — Frontend Algolia UI
 */

import asyncHandler from '../utils/asyncHandler.js';
import { trackEvent } from '../utils/posthog.js';
import Artisan from '../models/artisanModel.js';
import Category from '../models/categoryModel.js';
import ArtisanService from '../models/artisanServiceModel.js';

/**
 * Search artisans
 * GET /api/search/artisans
 */
const escapeRegex = (input = '') => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatArtisan = (artisan) => {
  if (!artisan) return null;
  return {
    _id: artisan._id,
    publicId: artisan.publicId,
    fullName: artisan.fullName,
    businessName: artisan.businessName || '',
    profileImage: artisan.profileImageUrl || artisan.profileImage || '',
    craft: artisan.craft || '',
    city: artisan.location?.city || '',
    averageRating: artisan.averageRating || 0,
    totalReviews: artisan.totalReviews || 0,
    verified: artisan.isVerified || artisan.emailVerified || false,
    bio: artisan.bio || '',
    portfolioImageUrls: artisan.portfolioImageUrls || [],
  };
};

const performSearch = async (req) => {
  // req.query is pre-validated and coerced by Zod via validateRequest middleware
  const { q = '', category, service, limit = 20 } = req.query;
  const trimmed = q.trim();
  let mode = 'artisan';
  let selectedCategory = null;
  let selectedService = service?.trim();

  if (!selectedCategory && category) {
    selectedCategory = await Category.findOne({
      $or: [{ slug: category }, { name: new RegExp(`^${escapeRegex(category)}$`, 'i') }],
      active: true,
    }).lean();
  }

  if (!selectedCategory && trimmed) {
    selectedCategory = await Category.findOne({ name: new RegExp(`^${escapeRegex(trimmed)}$`, 'i'), active: true }).lean();
  }

  if (!selectedService && trimmed) {
    const serviceMatch = await ArtisanService.findOne({
      name: new RegExp(`^${escapeRegex(trimmed)}$`, 'i'),
      isActive: true,
    }).lean();
    if (serviceMatch) {
      selectedService = serviceMatch.name;
    }
  }

  // limit is already coerced to int and clamped 1-50 by Zod schema
  const limitInt = limit;

  if (selectedService) {
    mode = 'service';
    const regex = new RegExp(`^${escapeRegex(selectedService)}`, 'i');
    const serviceDocs = await ArtisanService.find({ name: regex, isActive: true })
      .populate({ path: 'artisan', select: 'publicId fullName businessName profileImageUrl profileImage craft location averageRating totalReviews isVerified emailVerified bio portfolioImageUrls isActive' })
      .sort({ createdAt: -1 })
      .limit(limitInt * 4) // fetch more to dedupe
      .lean();

    const services = [];
    for (const doc of serviceDocs) {
      if (doc.artisan?.isActive === false) continue;
      const artisanInfo = formatArtisan(doc.artisan);
      if (!artisanInfo) continue;
      services.push({
        serviceId: doc._id,
        name: doc.name,
        price: doc.price,
        durationMinutes: doc.durationMinutes,
        artisan: artisanInfo,
      });
      if (services.length >= limitInt) break;
    }

    return {
      mode,
      service: selectedService,
      services,
    };
  }

  if (selectedCategory) {
    mode = 'category';
    const serviceDocs = await ArtisanService.find({
      category: selectedCategory._id,
      isActive: true,
    })
      .populate({ path: 'artisan', select: 'publicId fullName businessName profileImageUrl profileImage craft location averageRating totalReviews isVerified emailVerified bio portfolioImageUrls isActive' })
      .sort({ createdAt: -1 })
      .lean();

    const grouped = new Map();
    for (const doc of serviceDocs) {
      if (doc.artisan?.isActive === false) continue;
      const artisanInfo = formatArtisan(doc.artisan);
      if (!artisanInfo) continue;
      const key = doc.name;
      if (!grouped.has(key)) grouped.set(key, []);
      const entries = grouped.get(key);
      if (entries.length < 5) {
        entries.push({
          serviceId: doc._id,
          price: doc.price,
          durationMinutes: doc.durationMinutes,
          artisan: artisanInfo,
        });
      }
    }

    const services = [];
    const canonicalOrder = (selectedCategory.suggestedServices || []).map((s) => s.name);

    const pushService = (name) => {
      if (!grouped.has(name)) return;
      services.push({
        name,
        offerings: grouped.get(name),
      });
      grouped.delete(name);
    };

    canonicalOrder.forEach(pushService);
    for (const [name] of grouped.entries()) {
      if (services.length >= 5) break;
      pushService(name);
    }

    return {
      mode,
      category: {
        name: selectedCategory.name,
        slug: selectedCategory.slug,
      },
      services,
    };
  }

  // Fallback: artisan name search
  mode = 'artisan';
  const queryRegex = trimmed ? new RegExp(escapeRegex(trimmed), 'i') : null;
  const artisanFilter = {
    isActive: { $ne: false },
    ...(queryRegex
      ? {
          $or: [
            { fullName: queryRegex },
            { businessName: queryRegex },
            { craft: queryRegex },
          ],
        }
      : {}),
  };

  const artisans = await Artisan.find(artisanFilter)
    .select('publicId fullName businessName profileImageUrl profileImage craft location averageRating totalReviews isVerified emailVerified bio portfolioImageUrls')
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(limitInt)
    .lean();

  return {
    mode,
    artisans: artisans.map((a) => formatArtisan(a)),
  };
};

export const searchArtisans = asyncHandler(async (req, res) => {
  const results = await performSearch(req);

  trackEvent(
    (req.user?.id || req.user?._id || 'anonymous').toString(),
    'artisan_search',
    {
      mode: results.mode,
      query: req.query.q || '',
      category: results.category?.name || req.query.category || '',
      service: results.service || req.query.service || '',
    }
  );

  res.json({ success: true, ...results });
});

// Get search suggestions (autocomplete)
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q = '' } = req.query;
  if (!q || q.length < 2) {
    return res.json({ success: true, suggestions: { categories: [], services: [], artisans: [] } });
  }
  const limit = 5;
  const prefixRegex = `^${escapeRegex(q)}`;

  // Categories by prefix
  const categories = await Category.find({ name: { $regex: prefixRegex, $options: 'i' }, active: true })
    .select('name slug')
    .limit(limit)
    .lean();

  // Actual ArtisanService offerings by prefix
  const services = await ArtisanService.aggregate([
    { $match: { name: { $regex: prefixRegex, $options: 'i' }, isActive: true } },
    { $group: { _id: { name: '$name', categoryName: '$categoryName' }, count: { $sum: 1 } } },
    { $project: { name: '$_id.name', categoryName: '$_id.categoryName', count: 1, _id: 0 } },
    { $limit: limit }
  ]);

  // Suggested service templates from categories (e.g., "Pottery", "Tailor")
  // These fill remaining slots after real ArtisanService results
  if (services.length < limit) {
    const categoryMatches = await Category.find({
      'suggestedServices.name': { $regex: prefixRegex, $options: 'i' },
      active: true,
    }).select('name suggestedServices').lean();

    const existingNames = new Set(services.map(s => s.name.toLowerCase()));
    const prefixRe = new RegExp(prefixRegex, 'i');
    for (const cat of categoryMatches) {
      for (const svc of cat.suggestedServices) {
        if (prefixRe.test(svc.name) && !existingNames.has(svc.name.toLowerCase())) {
          services.push({ name: svc.name, categoryName: cat.name });
          existingNames.add(svc.name.toLowerCase());
          if (services.length >= limit) break;
        }
      }
      if (services.length >= limit) break;
    }
  }

  // Only show artisans if the query looks like a person name (2+ words)
  const isLikelyName = q.trim().includes(' ');
  let artisans = [];
  if (isLikelyName) {
    artisans = await Artisan.find({ fullName: { $regex: escapeRegex(q), $options: 'i' } })
      .select('publicId fullName profileImageUrl profileImage')
      .limit(limit)
      .lean();
  }

  res.json({ success: true, suggestions: { categories, services, artisans } });
});

/**
 * Get search facets
 * GET /api/search/facets
 */
export const getSearchFacets = asyncHandler(async (req, res) => {
  const [crafts, cities, states] = await Promise.all([
    Artisan.distinct('craft'),
    Artisan.distinct('location.city'),
    Artisan.distinct('location.state'),
  ]);

  res.json({
    success: true,
    data: {
      craft: crafts.filter(Boolean),
      'location.city': cities.filter(Boolean),
      'location.state': states.filter(Boolean),
    },
  });
});

/**
 * Get trending search terms
 * GET /api/search/trending
 * Returns hardcoded array initially; can later be driven by analytics.
 */
export const getTrendingSearches = asyncHandler(async (_req, res) => {
  const trending = [
    'Mehndi Artist',
    'Pottery',
    'Block Printing',
    'Carpenter',
    'Tailor',
    'Home Cleaning',
    'Electrician',
    'Plumber',
    'Painter',
    'Embroidery',
  ];
  res.json({ success: true, trending });
});

// Alias for searchArtisans (same handler, used by GET /api/search)
export const search = searchArtisans;

