import { algoliasearch } from 'algoliasearch';
import { SEARCH_CONFIG } from '../config/env.config.js';

/**
 * Initialize Algolia client
 * @returns {Object|null} Algolia client or null if not configured
 */
export const initAlgoliaClient = () => {
  if (!SEARCH_CONFIG.enabled || SEARCH_CONFIG.provider !== 'algolia') {
    console.warn('Algolia search is not enabled');
    return null;
  }

  try {
    const client = algoliasearch(
      SEARCH_CONFIG.algolia.appId,
      SEARCH_CONFIG.algolia.adminApiKey
    );
    console.log('✅ Algolia client initialized');
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Algolia:', error.message);
    return null;
  }
};

/**
 * Get Algolia index
 * @param {string} indexName - Name of the index
 * @returns {Object|null} Algolia index or null
 */
export const getAlgoliaIndex = (indexName = SEARCH_CONFIG.algolia.indexName) => {
  const client = initAlgoliaClient();
  if (!client) return null;

  try {
    return client.initIndex(indexName);
  } catch (error) {
    console.error(`❌ Failed to get Algolia index ${indexName}:`, error.message);
    return null;
  }
};

/**
 * Index artisan data to Algolia
 * @param {Object} artisan - Artisan object
 * @returns {Promise<Object|null>} Result or null
 */
export const indexArtisan = async (artisan) => {
  const index = getAlgoliaIndex();
  if (!index) return null;

  try {
    const record = {
      objectID: artisan._id.toString(),
      fullName: artisan.fullName,
      email: artisan.email,
      phoneNumber: artisan.phoneNumber,
      craft: artisan.craft,
      bio: artisan.bio,
      businessName: artisan.businessName,
      languagesSpoken: artisan.languagesSpoken,
      location: artisan.location,
      publicId: artisan.publicId,
      profileImage: artisan.profileImageUrl || artisan.profileImage,
      rating: artisan.averageRating,
      reviewCount: artisan.totalReviews,
      createdAt: artisan.createdAt,
    };

    const result = await index.saveObject(record);
    console.log(`✅ Indexed artisan ${artisan.publicId}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to index artisan:', error.message);
    return null;
  }
};

/**
 * Update artisan in Algolia
 * @param {string} artisanId - Artisan ID
 * @param {Object} updates - Updated fields
 * @returns {Promise<Object|null>} Result or null
 */
export const updateArtisanIndex = async (artisanId, updates) => {
  const index = getAlgoliaIndex();
  if (!index) return null;

  try {
    const result = await index.partialUpdateObject({
      objectID: artisanId,
      ...updates
    });
    console.log(`✅ Updated artisan index ${artisanId}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to update artisan index:', error.message);
    return null;
  }
};

/**
 * Delete artisan from Algolia
 * @param {string} artisanId - Artisan ID
 * @returns {Promise<Object|null>} Result or null
 */
export const deleteArtisanIndex = async (artisanId) => {
  const index = getAlgoliaIndex();
  if (!index) return null;

  try {
    const result = await index.deleteObject(artisanId);
    console.log(`✅ Deleted artisan index ${artisanId}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to delete artisan index:', error.message);
    return null;
  }
};

/**
 * Bulk index artisans
 * @param {Array} artisans - Array of artisan objects
 * @returns {Promise<Object|null>} Result or null
 */
export const bulkIndexArtisans = async (artisans) => {
  const index = getAlgoliaIndex();
  if (!index) return null;

  try {
    const records = artisans.map(artisan => ({
      objectID: artisan._id.toString(),
      fullName: artisan.fullName,
      email: artisan.email,
      craft: artisan.craft,
      bio: artisan.bio,
      businessName: artisan.businessName,
      languagesSpoken: artisan.languagesSpoken,
      location: artisan.location,
      publicId: artisan.publicId,
      profileImage: artisan.profileImageUrl || artisan.profileImage,
      rating: artisan.averageRating,
      reviewCount: artisan.totalReviews,
    }));

    const result = await index.saveObjects(records);
    console.log(`✅ Bulk indexed ${artisans.length} artisans`);
    return result;
  } catch (error) {
    console.error('❌ Failed to bulk index artisans:', error.message);
    return null;
  }
};

/**
 * Configure Algolia index settings
 * @returns {Promise<Object|null>} Result or null
 */
export const configureAlgoliaIndex = async () => {
  const index = getAlgoliaIndex();
  if (!index) return null;

  try {
    const result = await index.setSettings({
      searchableAttributes: [
        'fullName',
        'businessName',
        'craft',
        'bio',
        'languagesSpoken',
        'location'
      ],
      attributesForFaceting: [
        'craft',
        'location'
      ],
      ranking: [
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom'
      ],
      attributesToHighlight: ['fullName', 'businessName', 'craft', 'bio'],
      attributesToSnippet: ['bio:20'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      hitsPerPage: 20,
      maxValuesPerFacet: 100
    });
    console.log('✅ Algolia index settings configured');
    return result;
  } catch (error) {
    console.error('❌ Failed to configure Algolia index:', error.message);
    return null;
  }
};

