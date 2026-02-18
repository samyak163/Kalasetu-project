import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, ArrowRight, User, Tag, Layers } from 'lucide-react';
import api from '../../lib/axios.js';
import useRecentSearches from '../../hooks/useRecentSearches.js';
import { optimizeImage } from '../../utils/cloudinary.js';

const TRENDING = [
  'Mehndi Artist',
  'Pottery',
  'Block Printing',
  'Carpenter',
  'Tailor',
  'Home Cleaning',
  'Electrician',
  'Plumber',
];

const EMPTY_SUGGESTIONS = { categories: [], services: [], artisans: [] };

/**
 * Full-screen search overlay with three states:
 * 1. Pre-search — recent searches + trending terms
 * 2. Typing — debounced autocomplete from /api/search/suggestions
 * 3. No results — friendly empty state with submit prompt
 *
 * Opened from HomePage search bar tap, closed via X or backdrop.
 */
export default function SearchOverlay({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { searches: recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(EMPTY_SUGGESTIONS);
  const [loading, setLoading] = useState(false);

  // Focus input on open
  useEffect(() => {
    if (open) {
      // Small delay so the overlay transition is visible before focus
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
    // Reset on close
    setQuery('');
    setSuggestions(EMPTY_SUGGESTIONS);
    setLoading(false);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Debounced autocomplete
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions(EMPTY_SUGGESTIONS);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/api/search/suggestions', {
          params: { q: query.trim() },
          signal: controller.signal,
        });
        setSuggestions(data?.suggestions || EMPTY_SUGGESTIONS);
      } catch (err) {
        if (!controller.signal.aborted) {
          setSuggestions(EMPTY_SUGGESTIONS);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const goToSearch = useCallback((term) => {
    const q = term.trim();
    if (!q) return;
    addSearch(q);
    onClose();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }, [addSearch, onClose, navigate]);

  const goToCategory = useCallback((name) => {
    addSearch(name);
    onClose();
    navigate(`/search?category=${encodeURIComponent(name)}`);
  }, [addSearch, onClose, navigate]);

  const goToArtisan = useCallback((artisan) => {
    const id = artisan.publicId || artisan._id;
    addSearch(artisan.fullName);
    onClose();
    navigate(id ? `/${id}` : `/search?q=${encodeURIComponent(artisan.fullName)}`);
  }, [addSearch, onClose, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    goToSearch(query);
  };

  if (!open) return null;

  const hasSuggestions =
    suggestions.categories.length > 0 ||
    suggestions.services.length > 0 ||
    suggestions.artisans.length > 0;

  const isTyping = query.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-modal bg-white flex flex-col animate-fade-in">
      {/* Header with search input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
        <button type="button" onClick={onClose} className="p-1.5 -ml-1.5" aria-label="Close search">
          <X className="h-5 w-5 text-gray-600" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artisans, services..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-card text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        {query.length > 0 && (
          <button type="button" onClick={() => setQuery('')} className="text-xs text-gray-500">
            Clear
          </button>
        )}
      </form>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {isTyping ? (
          /* ─── Typing state: autocomplete results ─── */
          loading ? (
            <div className="p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasSuggestions ? (
            <div>
              {/* Category suggestions */}
              {suggestions.categories.length > 0 && (
                <div className="px-4 pt-4 pb-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Categories</p>
                  {suggestions.categories.map((cat) => (
                    <button
                      key={cat.slug || cat.name}
                      onClick={() => goToCategory(cat.name)}
                      className="flex items-center gap-3 w-full py-2.5 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <Layers className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-900">{cat.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300 ml-auto" />
                    </button>
                  ))}
                </div>
              )}

              {/* Service suggestions */}
              {suggestions.services.length > 0 && (
                <div className="px-4 pt-3 pb-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Services</p>
                  {suggestions.services.map((svc) => (
                    <button
                      key={`${svc.categoryName || 'svc'}-${svc.name}`}
                      onClick={() => goToSearch(svc.name)}
                      className="flex items-center gap-3 w-full py-2.5 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <Tag className="h-4 w-4 text-gray-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-gray-900 block truncate">{svc.name}</span>
                        {svc.categoryName && (
                          <span className="text-xs text-gray-500">{svc.categoryName}</span>
                        )}
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Artisan suggestions */}
              {suggestions.artisans.length > 0 && (
                <div className="px-4 pt-3 pb-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Artisans</p>
                  {suggestions.artisans.map((artisan) => (
                    <button
                      key={artisan.publicId || artisan._id}
                      onClick={() => goToArtisan(artisan)}
                      className="flex items-center gap-3 w-full py-2.5 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <img
                        src={optimizeImage(artisan.profileImage || artisan.profileImageUrl || '/default-avatar.png', { width: 40, height: 40 })}
                        alt={artisan.fullName}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                        onError={(e) => { e.target.src = '/default-avatar.png'; }}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-gray-900 font-medium block truncate">{artisan.fullName}</span>
                        <span className="text-xs text-gray-500 truncate block">
                          {artisan.craft || artisan.businessName || 'Artisan'}
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* View all results */}
              <button
                onClick={() => goToSearch(query)}
                className="w-full px-4 py-3 text-sm font-medium text-brand-600 hover:bg-gray-50 border-t border-gray-100 transition-colors"
              >
                View all results for &ldquo;{query.trim()}&rdquo;
              </button>
            </div>
          ) : (
            /* No autocomplete results */
            <div className="p-8 text-center">
              <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No suggestions for &ldquo;<span className="font-medium">{query}</span>&rdquo;
              </p>
              <p className="text-xs text-gray-400 mt-1">Press Enter to search everything</p>
            </div>
          )
        ) : (
          /* ─── Pre-search state: recent + trending ─── */
          <div>
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent Searches</p>
                  <button onClick={clearSearches} className="text-xs text-brand-500 font-medium">
                    Clear All
                  </button>
                </div>
                {recentSearches.map((term) => (
                  <div key={term} className="flex items-center gap-3 py-2">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    <button
                      onClick={() => goToSearch(term)}
                      className="flex-1 text-sm text-gray-800 text-left truncate hover:text-brand-600 transition-colors"
                    >
                      {term}
                    </button>
                    <button
                      onClick={() => removeSearch(term)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      aria-label={`Remove ${term}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Trending searches */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUp className="h-4 w-4 text-brand-500" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trending</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((term) => (
                  <button
                    key={term}
                    onClick={() => goToSearch(term)}
                    className="px-3 py-1.5 rounded-full text-sm border border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
