import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../config/env.config.js';
import { captureException } from '../../lib/sentry.js';

export default function AdvancedFilters({ value, onChange }) {
  const [facets, setFacets] = useState({ crafts: [], cities: [], states: [] });

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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-2">City</label>
          <select value={local.city} onChange={(e) => update({ city: e.target.value })} className="w-full border rounded px-3 py-2">
            <option value="">Any</option>
            {facets.cities.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">State</label>
          <select value={local.state} onChange={(e) => update({ state: e.target.value })} className="w-full border rounded px-3 py-2">
            <option value="">Any</option>
            {facets.states.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
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


