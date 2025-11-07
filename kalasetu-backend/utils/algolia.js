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
 * Index artisan data to Algolia with all searchable fields
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
      businessName: artisan.businessName || '',
      tagline: artisan.tagline || '',
      category: artisan.craft || artisan.category || '', // Use craft as category
      craft: artisan.craft || '',
      artform: artisan.craft || '', // Alias for craft
      skills: artisan.languagesSpoken || [], // Using languages as skills for now
      services: [], // Can be extracted from bio or craft if needed
      bio: artisan.bio || '',
      address: {
        city: artisan.location?.city || '',
        state: artisan.location?.state || '',
        country: artisan.location?.country || 'India',
        fullAddress: artisan.location?.address || ''
      },
      profileImage: artisan.profileImageUrl || artisan.profileImage || '',
      portfolioImages: artisan.portfolioImageUrls || [],
      publicId: artisan.publicId,
      rating: {
        average: artisan.averageRating || 0,
        count: artisan.totalReviews || 0
      },
      verifications: {
        email: {
          verified: artisan.emailVerified || false
        }
      },
      badges: artisan.certifications?.map(c => c.name) || [],
      _geoloc: artisan.location?.coordinates ? {
        lat: artisan.location.coordinates[1], // latitude
        lng: artisan.location.coordinates[0]  // longitude
      } : null,
      yearsOfExperience: artisan.yearsOfExperience || '',
      teamSize: artisan.teamSize || '',
      languagesSpoken: artisan.languagesSpoken || [],
      isActive: artisan.isActive !== false, // Default to true
      isVerified: artisan.emailVerified || false,
      createdAt: artisan.createdAt ? new Date(artisan.createdAt).getTime() : Date.now()
    };

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Algolia indexing timeout')), 5000)
    );

    const savePromise = index.saveObject(record);
    const result = await Promise.race([savePromise, timeoutPromise]);
    
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
 * Bulk index artisans with enhanced fields
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
      businessName: artisan.businessName || '',
      tagline: artisan.tagline || '',
      category: artisan.craft || artisan.category || '',
      craft: artisan.craft || '',
      artform: artisan.craft || '',
      skills: artisan.languagesSpoken || [],
      services: [],
      bio: artisan.bio || '',
      address: {
        city: artisan.location?.city || '',
        state: artisan.location?.state || '',
        country: artisan.location?.country || 'India',
        fullAddress: artisan.location?.address || ''
      },
      profileImage: artisan.profileImageUrl || artisan.profileImage || '',
      portfolioImages: artisan.portfolioImageUrls || [],
      publicId: artisan.publicId,
      rating: {
        average: artisan.averageRating || 0,
        count: artisan.totalReviews || 0
      },
      verifications: {
        email: {
          verified: artisan.emailVerified || false
        }
      },
      badges: artisan.certifications?.map(c => c.name) || [],
      _geoloc: artisan.location?.coordinates ? {
        lat: artisan.location.coordinates[1],
        lng: artisan.location.coordinates[0]
      } : null,
      yearsOfExperience: artisan.yearsOfExperience || '',
      teamSize: artisan.teamSize || '',
      languagesSpoken: artisan.languagesSpoken || [],
      isActive: artisan.isActive !== false,
      isVerified: artisan.emailVerified || false,
      createdAt: artisan.createdAt ? new Date(artisan.createdAt).getTime() : Date.now()
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
 * Configure Algolia index settings with advanced search configuration
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
        'category',
        'craft',
        'artform',
        'skills',
        'services',
        'bio',
        'tagline',
        'address.city',
        'address.state',
        'address.country'
      ],
      attributesForFaceting: [
        'searchable(category)',
        'searchable(craft)',
        'searchable(address.city)',
        'searchable(address.state)',
        'filterOnly(rating.average)',
        'filterOnly(verifications.email.verified)',
        'filterOnly(isActive)',
        'filterOnly(isVerified)'
      ],
      customRanking: [
        'desc(rating.average)',
        'desc(rating.count)',
        'desc(isVerified)'
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
      attributesToRetrieve: [
        'objectID',
        'fullName',
        'businessName',
        'profileImage',
        'portfolioImages',
        'category',
        'craft',
        'skills',
        'services',
        'address',
        'rating',
        'publicId',
        'verifications',
        'badges',
        '_geoloc',
        'tagline',
        'bio'
      ],
      attributesToHighlight: [
        'fullName',
        'businessName',
        'category',
        'craft',
        'skills',
        'services',
        'bio',
        'tagline'
      ],
      attributesToSnippet: ['bio:20'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      typoTolerance: true,
      minWordSizefor1Typo: 4,
      minWordSizefor2Typos: 8,
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

// Alias for backward compatibility
export const configureIndex = configureAlgoliaIndex;

