import { getAlgoliaIndex } from '../utils/algolia.js';
import asyncHandler from '../utils/asyncHandler.js';
import { trackEvent } from '../utils/posthog.js';
import * as Sentry from '@sentry/node';

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

    const result = await index.search('', searchParams);

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

