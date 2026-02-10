import asyncHandler from '../utils/asyncHandler.js';
import { trackEvent } from '../utils/posthog.js';
import * as Sentry from '@sentry/node';
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
  };
};

const performSearch = async (req) => {
  const { q = '', category, service, limit = 20 } = req.query;
  const trimmed = q.trim();
  let mode = 'artisan';
  let selectedCategory = null;
  let selectedService = service?.trim();

  if (!selectedCategory && category) {
    selectedCategory = await Category.findOne({
      $or: [{ slug: category }, { name: new RegExp(`^${escapeRegex(category)}$`, 'i') }],
    }).lean();
  }

  if (!selectedCategory && trimmed) {
    selectedCategory = await Category.findOne({ name: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') }).lean();
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

  const limitInt = Math.min(50, Math.max(1, parseInt(limit)));

  if (selectedService) {
    mode = 'service';
    const regex = new RegExp(`^${escapeRegex(selectedService)}`, 'i');
    const serviceDocs = await ArtisanService.find({ name: regex, isActive: true })
      .populate({ path: 'artisan', select: 'publicId fullName businessName profileImageUrl profileImage craft location averageRating totalReviews isVerified emailVerified' })
      .sort({ createdAt: -1 })
      .limit(limitInt * 4) // fetch more to dedupe
      .lean();

    const services = [];
    const seenArtisans = new Set();
    for (const doc of serviceDocs) {
      const artisanInfo = formatArtisan(doc.artisan);
      if (!artisanInfo) continue;
      if (doc.artisan?.isActive === false) continue;
      services.push({
        serviceId: doc._id,
        name: doc.name,
        price: doc.price,
        durationMinutes: doc.durationMinutes,
        artisan: artisanInfo,
      });
      seenArtisans.add(String(doc.artisan?._id));
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
      .populate({ path: 'artisan', select: 'publicId fullName businessName profileImageUrl profileImage craft location averageRating totalReviews isVerified emailVerified' })
      .sort({ createdAt: -1 })
      .lean();

    const grouped = new Map();
    for (const doc of serviceDocs) {
      const artisanInfo = formatArtisan(doc.artisan);
      if (!artisanInfo) continue;
      if (doc.artisan?.isActive === false) continue;
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
  const artisanFilter = queryRegex
    ? {
        $or: [
          { fullName: queryRegex },
          { businessName: queryRegex },
          { craft: queryRegex },
        ],
      }
    : {};

  const artisans = await Artisan.find(artisanFilter)
    .select('publicId fullName businessName profileImageUrl profileImage craft location averageRating totalReviews isVerified emailVerified')
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(limitInt)
    .lean();

  return {
    mode,
    artisans: artisans.map((a) => formatArtisan(a)),
  };
};

export const searchArtisans = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Search error:', error);
    if (Sentry) Sentry.captureException(error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get search suggestions (autocomplete)
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q = '' } = req.query;
  if (!q || q.length < 2) {
    return res.json({ success: true, suggestions: { categories: [], services: [], artisans: [] } });
  }
  try {
    const limit = 5;
    // Categories by prefix
    const categories = await Category.find({ name: { $regex: `^${escapeRegex(q)}`, $options: 'i' }, active: true })
      .select('name slug')
      .limit(limit)
      .lean();
    // Services by prefix
    const services = await ArtisanService.aggregate([
      { $match: { name: { $regex: `^${escapeRegex(q)}`, $options: 'i' }, isActive: true } },
      { $group: { _id: { name: '$name', categoryName: '$categoryName' }, count: { $sum: 1 } } },
      { $project: { name: '$_id.name', categoryName: '$_id.categoryName', count: 1, _id: 0 } },
      { $limit: limit }
    ]);
    // Only show artisans if the query looks like a person name (2+ words) or explicit
    const isLikelyName = q.trim().includes(' ');
    let artisans = [];
    if (isLikelyName) {
      artisans = await Artisan.find({ fullName: { $regex: escapeRegex(q), $options: 'i' } })
        .select('publicId fullName profileImageUrl profileImage')
        .limit(limit)
        .lean();
    }
    res.json({ success: true, suggestions: { categories, services, artisans } });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get suggestions' });
  }
});

/**
 * Get search facets
 * GET /api/search/facets
 */
export const getSearchFacets = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get facets',
    });
  }
});

// Alias for searchArtisans (same handler, used by GET /api/search)
export const search = searchArtisans;

