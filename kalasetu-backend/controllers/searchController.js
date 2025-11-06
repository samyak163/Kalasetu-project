import { getAlgoliaIndex } from '../utils/algolia.js';
import asyncHandler from '../utils/asyncHandler.js';
import { trackEvent } from '../utils/posthog.js';
import * as Sentry from '@sentry/node';
import Artisan from '../models/artisanModel.js';

/**
 * Search artisans
 * GET /api/search/artisans
 */
export const searchArtisans = asyncHandler(async (req, res) => {
  const { 
    q: qParam, 
    query: legacyQuery,
    page = 0, 
    hitsPerPage = 20, 
    filters,
    aroundLatLng,
    aroundRadius
  } = req.query;

  const index = getAlgoliaIndex();
  if (!index) {
    return res.status(503).json({
      success: false,
      message: 'Search service is not available'
    });
  }

  try {
    const searchParams = {
      query: qParam || legacyQuery || '',
      page: parseInt(page),
      hitsPerPage: parseInt(hitsPerPage),
      attributesToRetrieve: [
        'objectID','publicId','fullName','email','phoneNumber','skills','bio','profilePicture','location','rating','reviewCount','isVerified','portfolioImages'
      ],
      attributesToHighlight: ['fullName','skills','bio'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>'
    };

    if (filters) {
      searchParams.filters = filters;
    }
    if (aroundLatLng) {
      searchParams.aroundLatLng = aroundLatLng;
      if (aroundRadius) searchParams.aroundRadius = parseInt(aroundRadius);
    }

    const result = await index.search(qParam || legacyQuery || '', searchParams);

    // Track search with PostHog
    trackEvent({
      distinctId: req.user?.id || req.user?._id || 'anonymous',
      event: 'artisan_search',
      properties: {
        query: qParam || legacyQuery || '',
        results_count: result.nbHits,
        has_location: !!aroundLatLng
      }
    });

    res.json({
      success: true,
      hits: result.hits,
      nbHits: result.nbHits,
      page: result.page,
      nbPages: result.nbPages,
      hitsPerPage: result.hitsPerPage,
      processingTimeMS: result.processingTimeMS
    });
  } catch (error) {
    console.error('Search error:', error);
    
    if (Sentry) {
      Sentry.captureException(error);
    }

    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get search suggestions (autocomplete)
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q = '' } = req.query;
  const index = getAlgoliaIndex();
  if (!index) {
    return res.status(503).json({ success: false, suggestions: [] });
  }
  if (!q || q.length < 2) {
    return res.json({ success: true, suggestions: [] });
  }
  try {
    const result = await index.search(q, {
      hitsPerPage: 5,
      attributesToRetrieve: ['fullName','skills','publicId','profilePicture'],
      attributesToHighlight: ['fullName','skills']
    });
    const suggestions = (result.hits || []).map(hit => ({
      id: hit.publicId,
      name: hit.fullName,
      skills: hit.skills || [],
      image: hit.profilePicture,
      highlighted: hit._highlightResult
    }));
    res.json({ success: true, suggestions });
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
  const index = getAlgoliaIndex();
  if (!index) {
    return res.status(503).json({
      success: false,
      message: 'Search service is not available'
    });
  }

  try {
    const result = await index.search('', {
      facets: ['craft', 'location.city', 'location.state', 'skills'],
      maxValuesPerFacet: 100
    });

    res.json({
      success: true,
      data: result.facets
    });
  } catch (error) {
    console.error('Facets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get facets',
      error: error.message
    });
  }
});

/**
 * Comprehensive search - returns artisans and categories
 * GET /api/search
 */
export const search = asyncHandler(async (req, res) => {
  const { q, category, city, minRating, limit = 20, page = 1 } = req.query;

  try {
    // Try Algolia first if available
    const index = getAlgoliaIndex();
    if (index) {
      const searchParams = {
        query: q || '',
        page: parseInt(page) - 1,
        hitsPerPage: parseInt(limit),
        attributesToRetrieve: [
          'objectID', 'publicId', 'fullName', 'businessName', 'profileImage', 
          'profileImageUrl', 'profilePicture', 'craft', 'category', 'location', 
          'rating', 'address', 'city'
        ]
      };

      if (category) {
        searchParams.filters = `craft:"${category}" OR category:"${category}"`;
      }

      const result = await index.search(q || '', searchParams);
      
      // Get unique categories from results
      const categoriesSet = new Set();
      result.hits.forEach(hit => {
        if (hit.craft) categoriesSet.add(hit.craft);
        if (hit.category) categoriesSet.add(hit.category);
      });

      // Also search for categories matching query
      if (q && q.length >= 2) {
        const categoryQuery = { craft: { $regex: q, $options: 'i' } };
        // Only add isActive if field exists in schema
        const categoryResult = await Artisan.distinct('craft', categoryQuery);
        categoryResult.forEach(cat => categoriesSet.add(cat));
      }

      return res.json({
        success: true,
        artisans: result.hits.map(hit => ({
          _id: hit.objectID,
          publicId: hit.publicId,
          fullName: hit.fullName,
          businessName: hit.businessName,
          profileImage: hit.profileImage || hit.profileImageUrl || hit.profilePicture,
          category: hit.category || hit.craft,
          craft: hit.craft,
          city: hit.city || hit.location?.city,
          address: hit.address || hit.location,
          rating: hit.rating
        })),
        categories: Array.from(categoriesSet).slice(0, 5),
        pagination: {
          total: result.nbHits,
          page: parseInt(page),
          pages: result.nbPages
        }
      });
    }

    // Fallback to MongoDB search
    const query = {}; // Remove isActive requirement if field doesn't exist
    const searchConditions = [];

    if (q) {
      searchConditions.push(
        { fullName: { $regex: q, $options: 'i' } },
        { businessName: { $regex: q, $options: 'i' } },
        { craft: { $regex: q, $options: 'i' } },
        { skills: { $in: [new RegExp(q, 'i')] } }
      );
    }

    if (searchConditions.length > 0) {
      query.$or = searchConditions;
    }

    if (category) {
      query.$or = [
        { craft: { $regex: category, $options: 'i' } },
        { category: { $regex: category, $options: 'i' } }
      ];
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Get artisans
    const artisans = await Artisan.find(query)
      .select('fullName businessName profileImageUrl profileImage profilePicture craft category location address rating publicId')
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .sort({ 'rating.average': -1 });

    // Get unique categories that match search
    const categoryQuery = q ? { craft: { $regex: q, $options: 'i' } } : {};
    const categories = await Artisan.distinct('craft', {
      ...categoryQuery,
      craft: { $exists: true, $ne: '' }
    });

    const total = await Artisan.countDocuments(query);

    res.json({
      success: true,
      artisans: artisans.map(artisan => ({
        _id: artisan._id,
        publicId: artisan.publicId,
        fullName: artisan.fullName,
        businessName: artisan.businessName,
        profileImage: artisan.profileImage || artisan.profileImageUrl || artisan.profilePicture,
        category: artisan.category || artisan.craft,
        craft: artisan.craft,
        city: artisan.location?.city || artisan.address?.city,
        address: artisan.location || artisan.address,
        rating: artisan.rating
      })),
      categories: categories.slice(0, 5),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    
    if (Sentry) {
      Sentry.captureException(error);
    }

    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

