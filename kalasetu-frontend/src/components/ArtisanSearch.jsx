import { useState, useEffect } from 'react';
import { SEARCH_CONFIG } from '../config/env.config.js';
import { searchClient } from '../lib/algolia.js';

export default function ArtisanSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchArtisans = async (searchQuery) => {
    if (!searchClient) {
      setError('Search is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const index = searchClient.initIndex(SEARCH_CONFIG.algolia.indexName);
      const result = await index.search(searchQuery, {
        hitsPerPage: 20,
        attributesToHighlight: ['fullName', 'craft', 'bio']
      });

      setResults(result.hits);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search artisans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.length >= 2) {
      const debounce = setTimeout(() => {
        searchArtisans(query);
      }, 300);

      return () => clearTimeout(debounce);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search artisans by name, craft, or location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {results.map((artisan) => (
          <div
            key={artisan.objectID}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              {artisan.profileImage && (
                <img
                  src={artisan.profileImage}
                  alt={artisan.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h3
                  className="text-lg font-semibold"
                  dangerouslySetInnerHTML={{
                    __html: artisan._highlightResult?.fullName?.value || artisan.fullName
                  }}
                />
                <p
                  className="text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: artisan._highlightResult?.craft?.value || artisan.craft
                  }}
                />
                {artisan._snippetResult?.bio && (
                  <p
                    className="text-sm text-gray-500 mt-2"
                    dangerouslySetInnerHTML={{
                      __html: artisan._snippetResult.bio.value
                    }}
                  />
                )}
                {artisan.location && (
                  <p className="text-sm text-gray-500 mt-1">
                    📍 {artisan.location.city}, {artisan.location.state}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {query && results.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No artisans found for "{query}"
        </div>
      )}
    </div>
  );
}

