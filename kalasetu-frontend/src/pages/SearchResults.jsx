import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../config/env.config.js';
import SEO from '../components/SEO.jsx';
import SearchBar from '../components/SearchBar.jsx';
import LocationSearch from '../components/LocationSearch.jsx';
import AdvancedFilters from '../components/search/AdvancedFilters.jsx';
import { optimizeImage } from '../utils/cloudinary.js';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  
  const [results, setResults] = useState({ artisans: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filters, setFilters] = useState({
    craft: searchParams.get('craft') || '',
    state: searchParams.get('state') || '',
    minRating: Number(searchParams.get('minRating') || 0),
  });

  useEffect(() => {
    const fetchResults = async () => {
      if (!query && !category && !city && !filters.craft) {
        setResults({ artisans: [], categories: [] });
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (category) params.set('category', category);
        if (city) params.set('city', city);
        if (filters.craft) params.set('category', filters.craft);
        if (selectedLocation) {
          params.set('lat', selectedLocation.lat);
          params.set('lng', selectedLocation.lng);
        }

        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/api/search?${params.toString()}`
        );

        if (response.data?.success) {
          setResults({
            artisans: response.data.artisans || [],
            categories: response.data.categories || [],
          });
        } else {
          // Fallback to old endpoint
          const fallbackResponse = await axios.get(
            `${API_CONFIG.BASE_URL}/api/search/artisans?${params.toString()}`
          );
          setResults({
            artisans: fallbackResponse.data?.hits || [],
            categories: [],
          });
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults({ artisans: [], categories: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category, city, selectedLocation, filters.craft]);

  const handleSearch = (searchQuery) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    const params = new URLSearchParams(searchParams);
    if (location.city) params.set('city', location.city);
    setSearchParams(params);
  };

  const handleArtisanClick = (artisanId) => {
    navigate(`/artisan/${artisanId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${query ? `Search: ${query} | ` : category ? `Category: ${category} | ` : ''}Artisans | KalaSetu`}
        description="Find skilled artisans near you"
      />
      
      {/* Search Header - Sticky */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <SearchBar />
            </div>
            <div className="w-full md:w-80">
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                initialLocation={selectedLocation}
                placeholder="Filter by location..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Header */}
        {(query || category || city) && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {query && `Search Results for "${query}"`}
              {!query && category && `Category: ${category}`}
              {!query && !category && city && `Artisans in ${city}`}
            </h1>
            {results.artisans.length > 0 && !loading && (
              <p className="text-gray-600 mt-2">
                Found {results.artisans.length} artisan{results.artisans.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          {/* Filters Sidebar */}
          <div className="hidden md:block">
            <AdvancedFilters 
              value={{ ...filters, q: query, city }} 
              onChange={(newFilters) => {
                setFilters(newFilters);
                const params = new URLSearchParams(searchParams);
                if (newFilters.craft) params.set('craft', newFilters.craft);
                if (newFilters.city) params.set('city', newFilters.city);
                if (newFilters.state) params.set('state', newFilters.state);
                if (newFilters.minRating) params.set('minRating', newFilters.minRating);
                setSearchParams(params);
              }} 
            />
          </div>

          {/* Results Grid */}
          <div>
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#A55233]"></div>
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            )}

            {!loading && results.artisans.length === 0 && (query || category || city) && (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">No artisans found</p>
                <p className="text-gray-500 mt-2">Try different search terms or location</p>
              </div>
            )}

            {!loading && results.artisans.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.artisans.map((artisan) => {
                  const artisanId = artisan.publicId || artisan.id || artisan._id;
                  const artisanName = artisan.fullName || artisan.businessName;
                  const artisanImage = artisan.profileImage || artisan.profileImageUrl || artisan.profilePicture;
                  return (
                    <div
                      key={artisanId}
                      onClick={() => handleArtisanClick(artisanId)}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                    >
                      <div className="h-48 bg-gray-200 relative">
                        {artisanImage ? (
                          <img
                            src={optimizeImage(artisanImage, { width: 400, height: 300 })}
                            alt={artisanName}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-4xl font-bold">
                            {artisanName?.charAt(0) || 'A'}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {artisanName}
                        </h3>
                        <p className="text-sm text-[#A55233] mt-1 font-medium">
                          {artisan.category || artisan.craft || 'Artisan'}
                        </p>
                        {(artisan.city || artisan.address?.city) && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {artisan.city || artisan.address?.city}
                          </p>
                        )}
                        {artisan.rating && (
                          <div className="mt-2 flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm font-medium">{artisan.rating}</span>
                            {artisan.reviewCount && (
                              <span className="text-sm text-gray-500">
                                ({artisan.reviewCount} reviews)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Categories Section */}
            {results.categories.length > 0 && (
              <div className="mt-8 bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Related Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {results.categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        const params = new URLSearchParams();
                        params.set('category', cat);
                        setSearchParams(params);
                      }}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-[#A55233] hover:text-white hover:border-[#A55233] transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;


