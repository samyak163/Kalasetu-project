import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import algoliasearch from 'algoliasearch/lite';
import axios from 'axios';
import { SEARCH_CONFIG, API_CONFIG } from '../config/env.config.js';
import SEO from '../components/SEO.jsx';
import { optimizeImage } from '../utils/cloudinary.js';

// Initialize Algolia search client
const searchClient = SEARCH_CONFIG.enabled && SEARCH_CONFIG.algolia.appId && SEARCH_CONFIG.algolia.searchApiKey
  ? algoliasearch(SEARCH_CONFIG.algolia.appId, SEARCH_CONFIG.algolia.searchApiKey)
  : null;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';

  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    category: category || '',
    minRating: 0,
    maxDistance: 100, // km
    verifiedOnly: false
  });

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log('Location access denied');
        }
      );
    }
  }, []);

  // Search artisans
  useEffect(() => {
    const searchArtisans = async () => {
      setLoading(true);
      try {
        if (searchClient) {
          // Use Algolia direct search
          const index = searchClient.initIndex(SEARCH_CONFIG.algolia.indexName || 'artisans');
          
          const searchOptions = {
            hitsPerPage: 20,
            attributesToRetrieve: [
              'objectID',
              'fullName',
              'businessName',
              'profileImage',
              'portfolioImages',
              'category',
              'craft',
              'address',
              'rating',
              'publicId',
              'services',
              'skills',
              'tagline',
              'bio',
              'verifications',
              'badges',
              '_geoloc'
            ],
            attributesToHighlight: ['fullName', 'businessName', 'category', 'craft', 'services', 'tagline', 'bio']
          };

          // Build filters
          const filterArray = [];
          if (filters.category) {
            filterArray.push(`category:"${filters.category}"`);
          }
          if (filters.minRating > 0) {
            filterArray.push(`rating.average >= ${filters.minRating}`);
          }
          if (filters.verifiedOnly) {
            filterArray.push('verifications.email.verified:true');
          }

          if (filterArray.length > 0) {
            searchOptions.filters = filterArray.join(' AND ');
          }

          // Geo search if user location available
          if (userLocation) {
            searchOptions.aroundLatLng = `${userLocation.lat}, ${userLocation.lng}`;
            searchOptions.aroundRadius = filters.maxDistance * 1000; // Convert to meters
          }

          // Sorting
          if (sortBy === 'rating') {
            searchOptions.customRanking = ['desc(rating.average)'];
          } else if (sortBy === 'distance' && userLocation) {
            // Distance sorting is automatic with aroundLatLng
            searchOptions.aroundLatLngViaIP = false;
          }

          const results = await index.search(query || category || '', searchOptions);
          setArtisans(results.hits || []);
        } else {
          // Fallback to API search
          const params = new URLSearchParams();
          if (query) params.set('q', query);
          if (category) params.set('category', category);
          if (location) params.set('city', location);
          if (userLocation) {
            params.set('lat', userLocation.lat);
            params.set('lng', userLocation.lng);
          }
          if (filters.category) params.set('category', filters.category);
          if (filters.minRating > 0) params.set('minRating', filters.minRating);

          const response = await axios.get(`${API_CONFIG.BASE_URL}/api/search?${params.toString()}`);
          
          if (response.data?.success) {
            setArtisans(response.data.artisans || []);
          } else {
            setArtisans([]);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        setArtisans([]);
      } finally {
        setLoading(false);
      }
    };

    searchArtisans();
  }, [query, category, location, filters, sortBy, userLocation]);

  // Calculate distance using Haversine formula
  const calculateDistance = (artisanLat, artisanLng) => {
    if (!userLocation) return null;
    
    const R = 6371; // Earth radius in km
    const dLat = (artisanLat - userLocation.lat) * Math.PI / 180;
    const dLon = (artisanLng - userLocation.lng) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(artisanLat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance.toFixed(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams(searchParams);
    if (newFilters.category) params.set('category', newFilters.category);
    else params.delete('category');
    if (newFilters.minRating > 0) params.set('minRating', newFilters.minRating);
    else params.delete('minRating');
    if (newFilters.verifiedOnly) params.set('verified', 'true');
    else params.delete('verified');
    setSearchParams(params);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${category ? `${category} Artisans` : query ? `Search Results for "${query}"` : 'Search Artisans'} | KalaSetu`}
        description={`Find skilled artisans${category ? ` in ${category}` : ''}${location ? ` near ${location}` : ''}`}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category ? `${category} Artisans` : query ? `Search Results for "${query}"` : 'All Artisans'}
          </h1>
          <p className="text-gray-600">
            Found {artisans.length} artisan{artisans.length !== 1 ? 's' : ''}
            {userLocation && ' near you'}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                >
                  <option value="">All Categories</option>
                  <option value="Pottery">Pottery</option>
                  <option value="Weaving">Weaving</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Woodwork">Woodwork</option>
                  <option value="Painting">Painting</option>
                  <option value="Sculpture">Sculpture</option>
                  <option value="Textiles & Weaving">Textiles & Weaving</option>
                  <option value="Pottery & Ceramics">Pottery & Ceramics</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <div className="space-y-2">
                  {[4, 3, 2, 1, 0].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.minRating === rating}
                        onChange={() => handleFilterChange({ ...filters, minRating: rating })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex items-center gap-1">
                        {rating > 0 ? (
                          <>
                            <span className="text-sm font-medium">{rating}+</span>
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </>
                        ) : (
                          <span className="text-sm">All Ratings</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Distance Filter */}
              {userLocation && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance: {filters.maxDistance} km
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={filters.maxDistance}
                    onChange={(e) => handleFilterChange({ ...filters, maxDistance: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5 km</span>
                    <span>100 km</span>
                  </div>
                </div>
              )}

              {/* Verified Only */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) => handleFilterChange({ ...filters, verifiedOnly: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Verified Only
                  </span>
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  const clearedFilters = { category: '', minRating: 0, maxDistance: 100, verifiedOnly: false };
                  handleFilterChange(clearedFilters);
                }}
                className="w-full px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {artisans.length} results
              </span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              >
                <option value="relevance">Most Relevant</option>
                {userLocation && <option value="distance">Nearest First</option>}
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Artisan Cards */}
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="flex gap-6">
                      <div className="w-48 h-48 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : artisans.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No artisans found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search term
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {artisans.map((artisan) => {
                  const distance = artisan._geoloc && userLocation 
                    ? calculateDistance(artisan._geoloc.lat, artisan._geoloc.lng)
                    : null;
                  const artisanId = artisan.publicId || artisan.objectID;
                  const artisanName = artisan.fullName || artisan.businessName || 'Unknown Artisan';
                  const artisanImage = artisan.profileImage || artisan.portfolioImages?.[0] || '/default-avatar.png';

                  return (
                    <div
                      key={artisan.objectID || artisanId}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/artisan/${artisanId}`)}
                    >
                      <div className="flex flex-col md:flex-row gap-6 p-6">
                        {/* Large Portfolio Image */}
                        <div className="w-full md:w-64 flex-shrink-0">
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={optimizeImage(artisanImage, { width: 400, height: 400 })}
                              alt={artisanName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                            {artisan.badges && artisan.badges.length > 0 && (
                              <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded-full">
                                  ⭐ {artisan.badges[0]}
                                </span>
                              </div>
                            )}
                            {artisan.verifications?.email?.verified && (
                              <div className="absolute top-2 left-2">
                                <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                                  ✓ Verified
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Additional Portfolio Images */}
                          {artisan.portfolioImages && artisan.portfolioImages.length > 1 && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {artisan.portfolioImages.slice(1, 4).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={optimizeImage(img, { width: 100, height: 100 })}
                                  alt={`Portfolio ${idx + 1}`}
                                  className="w-full h-20 object-cover rounded"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Artisan Info */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h2 className="text-2xl font-bold text-gray-900 truncate">
                                {artisanName}
                              </h2>
                              {artisan.businessName && artisan.businessName !== artisanName && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {artisan.businessName}
                                </p>
                              )}
                              <p className="text-gray-600 mt-1">
                                {artisan.category || artisan.craft || 'Artisan'}
                              </p>
                              {artisan.tagline && (
                                <p className="text-sm text-gray-500 mt-1 italic">
                                  {artisan.tagline}
                                </p>
                              )}
                            </div>

                            {/* Rating */}
                            {artisan.rating?.average > 0 && (
                              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full flex-shrink-0">
                                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-semibold text-gray-900">
                                  {artisan.rating.average.toFixed(1)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  ({artisan.rating.count || 0})
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Location & Distance */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{artisan.address?.city || artisan.address?.state || 'India'}</span>
                            </div>
                            {distance && (
                              <div className="flex items-center gap-1 text-indigo-600 font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <span>{distance} km away</span>
                              </div>
                            )}
                          </div>

                          {/* Bio */}
                          {artisan.bio && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {artisan.bio}
                            </p>
                          )}

                          {/* Services */}
                          {artisan.services && artisan.services.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Services:</h4>
                              <div className="flex flex-wrap gap-2">
                                {artisan.services.slice(0, 4).map((service, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                  >
                                    {service}
                                  </span>
                                ))}
                                {artisan.services.length > 4 && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                    +{artisan.services.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Skills/Specialties */}
                          {artisan.skills && artisan.skills.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Specializes in:</span> {artisan.skills.slice(0, 3).join(', ')}
                                {artisan.skills.length > 3 && ` +${artisan.skills.length - 3} more`}
                              </p>
                            </div>
                          )}

                          {/* Contact Info */}
                          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 flex-wrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/artisan/${artisanId}`);
                              }}
                              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm md:text-base"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to messages or contact
                                navigate(`/artisan/${artisanId}?tab=contact`);
                              }}
                              className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-sm md:text-base"
                            >
                              Contact
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
