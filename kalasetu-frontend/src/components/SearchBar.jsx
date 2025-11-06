import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../config/env.config.js';
import { optimizeImage } from '../utils/cloudinary.js';

const SearchBar = ({ showFilters = false, initialQuery = '', onSearch }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState({ artisans: [], categories: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search with categories
  useEffect(() => {
    if (query.length < 2) {
      setResults({ artisans: [], categories: [] });
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/search`, {
          params: { q: query, limit: 5 }
        });
        
        if (response.data?.success) {
          setResults({
            artisans: response.data.artisans || [],
            categories: response.data.categories || []
          });
          setShowDropdown(true);
        } else {
          // Fallback to suggestions API
          const fallbackResponse = await axios.get(
            `${API_CONFIG.BASE_URL}/api/search/suggestions`,
            { params: { q: query } }
          );
          if (fallbackResponse.data?.success) {
            setResults({
              artisans: fallbackResponse.data.suggestions || [],
              categories: []
            });
            setShowDropdown(true);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        // Try fallback API
        try {
          const fallbackResponse = await axios.get(
            `${API_CONFIG.BASE_URL}/api/search/suggestions`,
            { params: { q: query } }
          );
          if (fallbackResponse.data?.success) {
            setResults({
              artisans: fallbackResponse.data.suggestions || [],
              categories: []
            });
            setShowDropdown(true);
          }
        } catch (fallbackError) {
          console.error('Fallback search error:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
      setShowDropdown(false);
    }
  };

  // Sync with initialQuery prop
  useEffect(() => {
    if (initialQuery !== undefined && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleArtisanClick = (artisan) => {
    const artisanId = artisan.publicId || artisan.id || artisan._id;
    navigate(`/artisan/${artisanId}`);
    setShowDropdown(false);
    setQuery('');
  };

  const handleCategoryClick = (category) => {
    navigate(`/search?category=${encodeURIComponent(category)}`);
    setShowDropdown(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            placeholder="Search for artisans, skills, or crafts..."
            className="w-full px-5 py-3 pl-12 pr-12 text-gray-900 border-2 border-gray-200 rounded-full focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
          />
          
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults({ artisans: [], categories: [] });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button type="submit" className="hidden">Search</button>
      </form>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          ) : (
            <>
              {/* Artisan Results */}
              {results.artisans.length > 0 && (
                <div className="border-b border-gray-200">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Artisans
                  </div>
                  {results.artisans.map((artisan) => {
                    const artisanId = artisan.publicId || artisan.id || artisan._id;
                    const artisanName = artisan.fullName || artisan.businessName || artisan.name;
                    const artisanImage = artisan.profileImage || artisan.profileImageUrl || artisan.profilePicture || artisan.image;
                    return (
                      <button
                        key={artisanId}
                        onClick={() => handleArtisanClick(artisan)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        {artisanImage ? (
                          <img
                            src={optimizeImage(artisanImage, { width: 40, height: 40 })}
                            alt={artisanName}
                            loading="lazy"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-semibold text-sm">
                            {artisanName?.charAt(0) || 'A'}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {artisanName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {artisan.category || artisan.craft} {artisan.city ? `• ${artisan.city}` : ''}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Category Results */}
              {results.categories.length > 0 && (
                <div className="border-b border-gray-200">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Categories
                  </div>
                  {results.categories.map((category, idx) => (
                    <button
                      key={category || idx}
                      onClick={() => handleCategoryClick(category)}
                      className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900">{category}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {results.artisans.length === 0 && results.categories.length === 0 && !loading && (
                <div className="p-4 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              )}

              {/* View All Results */}
              {(results.artisans.length > 0 || results.categories.length > 0) && (
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-[#A55233] hover:bg-orange-50 font-medium transition-colors"
                >
                  View all results for "{query}"
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;


