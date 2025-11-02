import { getAlgoliaIndex } from '../utils/algolia.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Search artisans
 * GET /api/search/artisans
 */
export const searchArtisans = asyncHandler(async (req, res) => {
  const { query, page = 0, hitsPerPage = 20, filters } = req.query;

  const index = getAlgoliaIndex();
  if (!index) {
    return res.status(503).json({
      success: false,
      message: 'Search service is not available'
    });
  }

  try {
    const searchParams = {
      query: query || '',
      page: parseInt(page),
      hitsPerPage: parseInt(hitsPerPage)
    };

    if (filters) {
      searchParams.filters = filters;
    }

    const result = await index.search(query, searchParams);

    res.json({
      success: true,
      data: {
        hits: result.hits,
        nbHits: result.nbHits,
        page: result.page,
        nbPages: result.nbPages,
        hitsPerPage: result.hitsPerPage
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
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

