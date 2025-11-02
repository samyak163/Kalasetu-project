import algoliasearch from 'algoliasearch/lite';
import { SEARCH_CONFIG } from '../config/env.config.js';

/**
 * Initialize Algolia search client
 * @returns {Object|null} Algolia client or null
 */
export const initSearchClient = () => {
  if (!SEARCH_CONFIG.enabled || SEARCH_CONFIG.provider !== 'algolia') {
    console.warn('Algolia search is not enabled');
    return null;
  }

  try {
    return algoliasearch(
      SEARCH_CONFIG.algolia.appId,
      SEARCH_CONFIG.algolia.searchApiKey
    );
  } catch (error) {
    console.error('Failed to initialize search client:', error);
    return null;
  }
};

export const searchClient = initSearchClient();

