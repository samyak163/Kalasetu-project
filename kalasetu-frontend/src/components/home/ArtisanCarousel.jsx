import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios.js';
import { ArtisanCard } from '../ui/index.js';

/**
 * Horizontal scrollable row of ArtisanCard components.
 * Reusable for "Top Artisans Near You" and "Featured Artisans" sections.
 *
 * @param {string} title - Section heading
 * @param {string} endpoint - API endpoint to fetch artisans from
 * @param {object} params - Query params for the API call
 * @param {string} emptyMessage - Message when no artisans found
 */
export default function ArtisanCarousel({
  title,
  endpoint = '/api/artisans/featured',
  params = {},
  emptyMessage = 'No artisans found',
}) {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Stable serialization of params to avoid re-fetching on every render
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    let cancelled = false;
    const parsedParams = JSON.parse(paramsKey);
    const fetchData = async () => {
      try {
        const { data } = await api.get(endpoint, { params: parsedParams });
        if (cancelled) return;
        const list = data.data || data.artisans || data;
        setArtisans(Array.isArray(list) ? list.slice(0, 12) : []);
      } catch {
        // Fallback: try general artisan list
        try {
          const { data } = await api.get('/api/artisans', { params: { limit: 8 } });
          if (cancelled) return;
          const list = data.artisans || data.data || data;
          setArtisans(Array.isArray(list) ? list.slice(0, 8) : []);
        } catch {
          if (!cancelled) setArtisans([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [endpoint, paramsKey]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="py-6">
        <div className="px-4 max-w-container mx-auto">
          <h2 className="text-lg font-display font-bold text-gray-900 mb-4">{title}</h2>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-64 shrink-0 rounded-card bg-gray-200 animate-pulse" style={{ aspectRatio: '4/5' }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (artisans.length === 0) {
    return (
      <section className="py-6">
        <div className="px-4 max-w-container mx-auto">
          <h2 className="text-lg font-display font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 group/carousel">
      <div className="px-4 max-w-container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-gray-900">{title}</h2>
          <Link to="/search" className="text-sm text-brand-500 font-medium hover:underline">
            View All
          </Link>
        </div>
      </div>

      <div className="relative">
        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 snap-x snap-mandatory"
        >
          {artisans.map((artisan) => (
            <div key={artisan._id || artisan.publicId} className="w-64 shrink-0 snap-start">
              <ArtisanCard artisan={artisan} />
            </div>
          ))}
        </div>

        {/* Desktop arrows */}
        {artisans.length > 3 && (
          <>
            <button
              onClick={() => scroll(-1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full shadow-card opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full shadow-card opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
