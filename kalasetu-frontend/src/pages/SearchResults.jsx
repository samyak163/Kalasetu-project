import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdvancedFilters from '../components/search/AdvancedFilters.jsx';
import { API_CONFIG } from '../config/env.config.js';
import SEO from '../components/SEO.jsx';

const SearchResults = () => {
  const params = new URLSearchParams(location.search);
  const [filters, setFilters] = useState({
    q: params.get('q') || '',
    craft: params.get('craft') || '',
    city: params.get('city') || '',
    state: params.get('state') || '',
    minRating: Number(params.get('minRating') || 0),
    aroundLatLng: params.get('aroundLatLng') || '',
    aroundRadius: params.get('aroundRadius') || '',
  });
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.q) p.set('q', filters.q);
    const composedFilters = [];
    if (filters.craft) composedFilters.push(`craft:"${filters.craft}"`);
    if (filters.city) composedFilters.push(`location.city:"${filters.city}"`);
    if (filters.state) composedFilters.push(`location.state:"${filters.state}"`);
    if (filters.minRating > 0) composedFilters.push(`rating >= ${filters.minRating}`);
    if (composedFilters.length) p.set('filters', composedFilters.join(' AND '));
    if (filters.aroundLatLng) p.set('aroundLatLng', filters.aroundLatLng);
    if (filters.aroundRadius) p.set('aroundRadius', filters.aroundRadius);
    return p.toString();
  }, [filters]);

  useEffect(() => {
    const url = `${API_CONFIG.BASE_URL}/api/search/artisans?${queryString}`;
    const href = `/search?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(queryString)) }).toString()}`;
    window.history.replaceState({}, '', href);
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(url);
        setHits(res.data?.hits || []);
      } catch (_) {
        setHits([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [queryString]);

  return (
    <div className="py-8">
      <SEO
        title="Search Artisans | KalaSetu"
        description="Browse artisans by craft, skills, and location."
        url="https://kalasetu.com/search"
        type="website"
      />
      <h1 className="text-2xl font-bold text-center mb-6">Search Results</h1>
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <AdvancedFilters value={filters} onChange={setFilters} />
        <div>
          {loading && <div className="p-6 text-gray-600">Loading...</div>}
          {!loading && hits.length === 0 && <div className="p-6 text-gray-600">No results</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hits.map(h => (
              <div key={h.objectID || h.publicId} className="border rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-100">
                  {h.profileImage && <img src={h.profileImage} alt={h.fullName} loading="lazy" className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <div className="font-semibold">{h.fullName}</div>
                  <div className="text-sm text-gray-600">{h.craft}</div>
                  {typeof h.rating === 'number' && <div className="text-sm mt-1">★ {h.rating} ({h.reviewCount || 0})</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;


