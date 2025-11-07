import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import algoliasearch from 'algoliasearch/lite';
import axios from 'axios';
import { SEARCH_CONFIG, API_CONFIG } from '../config/env.config.js';
import { optimizeImage } from '../utils/cloudinary.js';

// Initialize Algolia search client
const searchClient = SEARCH_CONFIG.enabled && SEARCH_CONFIG.algolia.appId && SEARCH_CONFIG.algolia.searchApiKey
  ? algoliasearch(SEARCH_CONFIG.algolia.appId, SEARCH_CONFIG.algolia.searchApiKey)
  : null;

const SearchBar = ({ className = '', showLocationSearch = true, initialQuery = '', onSearch }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery || '');
  const [hits, setHits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Algolia search with API fallback
  useEffect(() => {
    if (query.length < 2) {
      setHits([]);
      setCategories([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (searchClient) {
          // Use Algolia direct search
          const index = searchClient.initIndex(SEARCH_CONFIG.algolia.indexName || 'artisans');
          
          // Multi-query search: artisans + categories
          const [artisanResults, categoryResults] = await Promise.all([
            index.search(query, {
              hitsPerPage: 5,
              attributesToRetrieve: [
                'objectID',
                'fullName',
                'businessName',
                'profileImage',
                'category',
                'craft',
                'address',
                'rating',
                'publicId',
                'services',
                'skills',
                'tagline'
              ],
              attributesToHighlight: ['fullName', 'businessName', 'category', 'craft', 'services', 'tagline']
            }),
            index.searchForFacetValues('category', query, {
              maxFacetHits: 5
            }).catch(() => ({ facetHits: [] }))
          ]);

          setHits(artisanResults.hits || []);
          setCategories(categoryResults.facetHits?.map(f => f.value) || []);
          setShowDropdown(true);
        } else {
          // Fallback to API search
          const response = await axios.get(`${API_CONFIG.BASE_URL}/api/search`, {
            params: { q: query, limit: 5 }
          });
          
          if (response.data?.success) {
            setHits(response.data.artisans || []);
            setCategories(response.data.categories || []);
            setShowDropdown(true);
          } else {
            setHits([]);
            setCategories([]);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to empty results
        setHits([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Sync with initialQuery prop
  useEffect(() => {
    if (initialQuery !== undefined && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
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

  const handleArtisanClick = (artisan) => {
    // If exact name match, go directly to profile
    const isExactMatch = 
      artisan.fullName?.toLowerCase() === query.toLowerCase() ||
      artisan.businessName?.toLowerCase() === query.toLowerCase();
    
    if (isExactMatch) {
      navigate(`/${artisan.publicId || artisan.objectID}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
    
    setShowDropdown(false);
    setQuery('');
  };

  const handleCategoryClick = (category) => {
    navigate(`/search?category=${encodeURIComponent(category)}`);
    setShowDropdown(false);
    setQuery('');
  };

  const highlightText = (text, highlight) => {
    if (!highlight || !text) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            placeholder="Search artisans, services, categories..."
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        {/* Search Button (optional for mobile) */}
        <button
          type="submit"
          className="hidden md:block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm md:text-base"
        >
          Search
        </button>
      </form>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
              <p className="mt-2 text-sm text-gray-500">Searching...</p>
            </div>
          ) : (
            <>
              {/* Artisan Results */}
              {hits.length > 0 && (
                <div className="border-b border-gray-200">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Artisans & Services
                  </div>
                  {hits.map((hit) => {
                    const artisanName = hit.fullName || hit.businessName || 'Unknown';
                    const artisanImage = hit.profileImage || '/default-avatar.png';
                    const artisanId = hit.publicId || hit.objectID;
                    return (
                      <button
                        key={hit.objectID}
                        onClick={() => handleArtisanClick(hit)}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-indigo-50 transition-colors text-left group"
                      >
                        <img
                          src={optimizeImage(artisanImage, { width: 48, height: 48 })}
                          alt={artisanName}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate group-hover:text-indigo-600">
                            {highlightText(artisanName, query)}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {hit.category || hit.craft} • {hit.address?.city || 'India'}
                          </div>
                          {hit.tagline && (
                            <div className="text-xs text-gray-500 truncate mt-1">
                              {hit.tagline}
                            </div>
                          )}
                          {(hit.services && hit.services.length > 0) && (
                            <div className="text-xs text-gray-500 truncate mt-1">
                              {hit.services.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                        {hit.rating?.average > 0 && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">
                              {hit.rating.average.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Category Suggestions */}
              {categories.length > 0 && (
                <div className="border-b border-gray-200">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Categories
                  </div>
                  <div className="p-2 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-200 transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {hits.length === 0 && categories.length === 0 && (
                <div className="p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">
                    No results found for "<span className="font-medium">{query}</span>"
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Try different keywords or browse categories
                  </p>
                </div>
              )}

              {/* View All Results */}
              {(hits.length > 0 || categories.length > 0) && (
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-indigo-600 hover:bg-indigo-50 font-medium transition-colors border-t border-gray-200 text-sm md:text-base"
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
