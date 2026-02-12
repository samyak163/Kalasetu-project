import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../config/env.config.js';
import { captureException } from '../../lib/sentry.js';

export default function AdvancedFilters({ value, onChange }) {
  const [facets, setFacets] = useState({ crafts: [], cities: [], states: [] });
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_CONFIG.BASE_URL}/api/search/facets`);
        const data = res.data?.data || {};
        const crafts = Object.keys(data.craft || {});
        const cities = Object.keys(data['location.city'] || {});
        const states = Object.keys(data['location.state'] || {});
        setFacets({ crafts, cities, states });
      } catch (err) {
        captureException(err, { context: 'search_facets_load', component: 'AdvancedFilters' });
        if (import.meta.env.DEV) console.error('Failed to load search facets:', err);
      }
    })();
  }, []);

  const local = useMemo(() => ({
    q: value?.q || '',
    craft: value?.craft || '',
    city: value?.city || '',
    state: value?.state || '',
    minRating: value?.minRating || 0,
    aroundRadius: value?.aroundRadius || '',
  }), [value]);

  const update = (patch) => onChange({ ...local, ...patch });

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode to get city/state
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          if (data.results[0]) {
            const addressComponents = data.results[0].address_components || [];
            const city = addressComponents.find(c =>
              c.types.includes('locality') ||
              c.types.includes('administrative_area_level_2')
            )?.long_name || '';
            const state = addressComponents.find(c =>
              c.types.includes('administrative_area_level_1')
            )?.long_name || '';

            update({ city, state });
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          alert('Failed to get location details. Please enter manually.');
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to access your location. Please enter manually.');
        setLoadingLocation(false);
      }
    );
  };

  return (
    <aside className="w-full md:w-64 md:shrink-0 md:border-r md:pr-4 space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">Query</label>
        <input value={local.q} onChange={(e) => update({ q: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Search..." />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Craft</label>
        <select value={local.craft} onChange={(e) => update({ craft: e.target.value })} className="w-full border rounded px-3 py-2">
          <option value="">Any</option>
          {facets.crafts.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold">Location</label>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={loadingLocation}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 disabled:opacity-50"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {loadingLocation ? 'Getting location...' : 'Use my location'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">City</label>
            <select value={local.city} onChange={(e) => update({ city: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Any</option>
              {facets.cities.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">State</label>
            <select value={local.state} onChange={(e) => update({ state: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Any</option>
              {facets.states.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Minimum Rating</label>
        <input type="number" min="0" max="5" step="0.5" value={local.minRating} onChange={(e) => update({ minRating: Number(e.target.value) })} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Max Distance (meters)</label>
        <input type="number" min="0" step="100" value={local.aroundRadius} onChange={(e) => update({ aroundRadius: e.target.value })} className="w-full border rounded px-3 py-2" />
      </div>
    </aside>
  );
}


