import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios.js';
import { optimizeImage } from '../utils/cloudinary.js';

const EMPTY_SUGGESTIONS = {
  categories: [],
  services: [],
  artisans: [],
};

const SearchBar = ({ className = '', showLocationSearch: _showLocationSearch = true, initialQuery = '', onSearch, userLocation }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery || '');
  const [suggestions, setSuggestions] = useState(EMPTY_SUGGESTIONS);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  // Debounced suggestions fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions(EMPTY_SUGGESTIONS);
      setShowDropdown(false);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/api/search/suggestions', {
          params: { q: query.trim() },
          signal: controller.signal,
        });
        setSuggestions(response.data?.suggestions || EMPTY_SUGGESTIONS);
        setShowDropdown(true);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Suggestion fetch error:', err);
        setError(err);
        setSuggestions(EMPTY_SUGGESTIONS);
        setShowDropdown(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  // Sync with initialQuery prop
  useEffect(() => {
    if (initialQuery !== undefined && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed);
    } else {
      const params = new URLSearchParams({ q: trimmed });
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
        if (userLocation.city) {
          params.append('city', userLocation.city);
        }
      }
      navigate(`/search?${params.toString()}`);
    }
    setShowDropdown(false);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/search?category=${encodeURIComponent(categoryName)}`);
    setShowDropdown(false);
    setQuery('');
  };

  const handleServiceClick = (serviceName) => {
    navigate(`/search?service=${encodeURIComponent(serviceName)}`);
    setShowDropdown(false);
    setQuery('');
  };

  const handleArtisanClick = (artisan) => {
    const targetId = artisan.publicId || artisan._id;
    if (targetId) {
      navigate(`/${targetId}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(artisan.fullName)}`);
    }
    setShowDropdown(false);
    setQuery('');
  };

  const hasAnySuggestions = useMemo(() => {
    return (
      suggestions.categories.length > 0 ||
      suggestions.services.length > 0 ||
      suggestions.artisans.length > 0
    );
  }, [suggestions]);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
            placeholder="Search artisans, services, categories..."
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg !bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base !text-black placeholder-gray-400"
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
        <div className="absolute z-50 w-full mt-2 !bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
              <p className="mt-2 text-sm text-gray-500">Searching...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">Unable to fetch suggestions right now. Try again momentarily.</div>
          ) : (
            <>
              {/* Category Suggestions */}
              {suggestions.categories.length > 0 && (
                <div className="border-b border-gray-200">
                  <div className="px-4 py-2 !bg-white text-xs font-semibold !text-black uppercase tracking-wide">
                    Categories
                  </div>
                  <div className="p-2 flex flex-wrap gap-2">
                    {suggestions.categories.map((category) => (
                      <button
                        key={category.slug || category.name}
                        onClick={() => handleCategoryClick(category.name)}
                        className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-200 transition-colors"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Suggestions */}
              {suggestions.services.length > 0 && (
                <div className="border-b border-gray-200">
                  <div className="px-4 py-2 !bg-white text-xs font-semibold !text-black uppercase tracking-wide">
                    Services
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {suggestions.services.map((service) => (
                      <li key={`${service.categoryName || 'service'}-${service.name}`}>
                        <button
                          onClick={() => handleServiceClick(service.name)}
                          className="w-full px-4 py-3 text-left !bg-white hover:bg-indigo-50 transition-colors"
                        >
                          <div className="font-medium !text-black">{service.name}</div>
                          {service.categoryName && (
                            <div className="text-xs text-gray-500">{service.categoryName}</div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Artisan Suggestions */}
              {suggestions.artisans.length > 0 && (
                <div className="border-b border-gray-200">
                  <div className="px-4 py-2 !bg-white text-xs font-semibold !text-black uppercase tracking-wide">
                    Artisans
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {suggestions.artisans.map((artisan) => (
                      <li key={artisan.publicId || artisan._id}>
                        <button
                          onClick={() => handleArtisanClick(artisan)}
                          className="w-full flex items-center gap-3 px-4 py-3 !bg-white hover:bg-indigo-50 transition-colors text-left"
                        >
                          <img
                            src={optimizeImage(artisan.profileImage || artisan.profileImageUrl || '/default-avatar.png', { width: 48, height: 48 })}
                            alt={artisan.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = '/default-avatar.png';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium !text-black truncate">{artisan.fullName}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {artisan.craft || artisan.businessName || 'Artisan'}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* No Results */}
              {!hasAnySuggestions && (
                <div className="p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">
                    No suggestions for "<span className="font-medium">{query}</span>" yet.
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Try another keyword or press Enter to search everything.
                  </p>
                </div>
              )}

              {/* View All Results */}
              {hasAnySuggestions && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams({ q: query.trim() });
                    if (userLocation) {
                      params.append('lat', userLocation.lat);
                      params.append('lng', userLocation.lng);
                      if (userLocation.city) {
                        params.append('city', userLocation.city);
                      }
                    }
                    navigate(`/search?${params.toString()}`);
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
