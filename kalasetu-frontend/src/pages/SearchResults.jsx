import { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import api from '../lib/axios.js';
import SEO from '../components/SEO.jsx';
import { optimizeImage } from '../utils/cloudinary.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { TabBar, FilterChips, ArtisanCard, BottomSheet, EmptyState, Badge } from '../components/ui/index.js';
import SearchOverlay from '../components/search/SearchOverlay.jsx';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'artisans', label: 'Artisans' },
  { key: 'services', label: 'Services' },
];

const RATING_OPTIONS = [
  { value: 0, label: 'All Ratings' },
  { value: 4.5, label: '4.5+ Stars' },
  { value: 4, label: '4+ Stars' },
  { value: 3, label: '3+ Stars' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
];

/**
 * Rebuilt SearchResults page with:
 * - TabBar (All / Artisans / Services)
 * - FilterChips (Sort, Rating, Verified)
 * - BottomSheet for sort/rating selection
 * - Design system ArtisanCard grid for artisan results
 * - SearchOverlay for re-searching from this page
 */
const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { showToast } = useContext(ToastContext);

  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const serviceParam = searchParams.get('service') || '';

  const [results, setResults] = useState({ mode: 'artisan', category: null, services: [], artisans: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingTarget, setBookingTarget] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Filter state
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // BottomSheet states
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [ratingSheetOpen, setRatingSheetOpen] = useState(false);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Fetch results
  useEffect(() => {
    const controller = new AbortController();
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (categoryParam) params.set('category', categoryParam);
        if (serviceParam) params.set('service', serviceParam);
        if (minRating > 0) params.set('minRating', minRating);

        const { data } = await api.get(`/api/search?${params.toString()}`, { signal: controller.signal });
        if (controller.signal.aborted) return;
        if (data?.success) {
          setResults({
            mode: data.mode || 'artisan',
            category: data.category || null,
            services: data.services || [],
            artisans: data.artisans || [],
          });
        } else {
          setResults({ mode: 'artisan', category: null, services: [], artisans: [] });
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err);
        setResults({ mode: 'artisan', category: null, services: [], artisans: [] });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchResults();
    return () => controller.abort();
  }, [query, categoryParam, serviceParam, minRating]);

  // Heading
  const heading = useMemo(() => {
    if (results.mode === 'category' && results.category) return `${results.category.name} Services`;
    if (results.mode === 'service' && results.services[0]?.name) return `${results.services[0].name} Providers`;
    if (categoryParam) return `${categoryParam} Artisans`;
    if (query) return `Results for "${query}"`;
    return 'Browse Artisans';
  }, [results, categoryParam, query]);

  // Filtered + sorted artisans
  const filteredArtisans = useMemo(() => {
    let list = [...results.artisans];
    if (verifiedOnly) list = list.filter((a) => a.verified);
    if (minRating > 0) list = list.filter((a) => (a.averageRating || 0) >= minRating);
    if (sortBy === 'rating') list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [results.artisans, verifiedOnly, minRating, sortBy]);

  // Filtered services
  const filteredServices = useMemo(() => {
    let list = results.mode === 'category'
      ? results.services.flatMap((s) => (s.offerings || []).map((o) => ({ ...o, groupName: s.name })))
      : [...results.services];
    if (verifiedOnly) list = list.filter((s) => s.artisan?.verified);
    if (sortBy === 'rating') list.sort((a, b) => (b.artisan?.averageRating || 0) - (a.artisan?.averageRating || 0));
    return list;
  }, [results.services, results.mode, verifiedOnly, sortBy]);

  // Tab counts
  const tabsWithCounts = useMemo(() => TABS.map((tab) => {
    if (tab.key === 'all') return { ...tab, count: filteredArtisans.length + filteredServices.length };
    if (tab.key === 'artisans') return { ...tab, count: filteredArtisans.length };
    if (tab.key === 'services') return { ...tab, count: filteredServices.length };
    return tab;
  }), [filteredArtisans.length, filteredServices.length]);

  // Filter chips
  const filterChips = useMemo(() => [
    {
      key: 'sort',
      label: `Sort: ${SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Relevance'}`,
      active: sortBy !== 'relevance',
      onClick: () => setSortSheetOpen(true),
    },
    {
      key: 'rating',
      label: minRating > 0 ? `${minRating}+ Stars` : 'Rating',
      active: minRating > 0,
      onClick: () => setRatingSheetOpen(true),
    },
    {
      key: 'verified',
      label: 'Verified',
      active: verifiedOnly,
      onClick: () => setVerifiedOnly((v) => !v),
    },
  ], [sortBy, minRating, verifiedOnly]);

  const handleBook = useCallback((artisan, service = null) => {
    if (userType !== 'user') {
      showToast('Please log in as a customer to book services', 'error');
      return;
    }
    setBookingTarget({ artisan, service });
  }, [userType, showToast]);

  const showArtisans = activeTab === 'all' || activeTab === 'artisans';
  const showServices = activeTab === 'all' || activeTab === 'services';

  return (
    <div className="min-h-screen bg-surface-muted">
      <SEO title={`${heading} | KalaSetu`} description={`Find artisans and services for ${heading}`} />

      {/* Tappable search header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-100 rounded-card text-left text-sm text-gray-500 hover:bg-gray-200 transition-colors max-w-container mx-auto"
        >
          <Search className="h-4 w-4 text-gray-400" />
          {query || 'Search for artisans, services...'}
        </button>
      </div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />

      {/* Tabs */}
      <TabBar tabs={tabsWithCounts} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Filter chips */}
      <div className="px-4 py-2 max-w-container mx-auto">
        <FilterChips chips={filterChips} />
      </div>

      {/* Header */}
      <div className="px-4 max-w-container mx-auto">
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-lg font-display font-bold text-gray-900">{heading}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading ? 'Searching...' : `${filteredArtisans.length + filteredServices.length} results`}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-card border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
            Something went wrong. Please try again.
          </div>
        )}
      </div>

      {/* Results */}
      <main className="px-4 pb-8 max-w-container mx-auto">
        {loading ? (
          <SkeletonGrid />
        ) : (
          <>
            {/* Artisan results */}
            {showArtisans && filteredArtisans.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Artisans</h2>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {filteredArtisans.map((artisan) => (
                    <ArtisanCard key={artisan.publicId || artisan._id} artisan={artisan} />
                  ))}
                </div>
              </section>
            )}

            {/* Service results */}
            {showServices && filteredServices.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Services</h2>
                )}
                <div className="space-y-3">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.serviceId || `${service.name}-${service.artisan?._id}`}
                      service={service}
                      onBook={handleBook}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {!loading && filteredArtisans.length === 0 && filteredServices.length === 0 && (
              <EmptyState
                icon={<Search className="h-12 w-12" />}
                title="No results found"
                description={query ? `We couldn't find anything for "${query}". Try different keywords.` : 'Try searching for an artisan or service.'}
                action={
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="px-4 py-2 bg-brand-500 text-white rounded-card text-sm font-medium hover:bg-brand-600 transition-colors"
                  >
                    Search Again
                  </button>
                }
              />
            )}
          </>
        )}
      </main>

      {/* Sort BottomSheet */}
      <BottomSheet open={sortSheetOpen} onClose={() => setSortSheetOpen(false)} title="Sort By">
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSortBy(opt.value); setSortSheetOpen(false); }}
              className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${
                sortBy === opt.value ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Rating BottomSheet */}
      <BottomSheet open={ratingSheetOpen} onClose={() => setRatingSheetOpen(false)} title="Minimum Rating">
        <div className="space-y-1">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setMinRating(opt.value); setRatingSheetOpen(false); }}
              className={`w-full text-left px-3 py-3 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                minRating === opt.value ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt.value > 0 && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
              {opt.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Booking modal */}
      {bookingTarget && (
        <BookServiceModal
          target={bookingTarget}
          onClose={() => setBookingTarget(null)}
          userType={userType}
          showToast={showToast}
        />
      )}
    </div>
  );
};

/* ─── Skeleton loading grid ─── */
const SkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="rounded-card bg-white shadow-card overflow-hidden animate-pulse">
        <div className="aspect-[4/3] bg-gray-200" />
        <div className="p-3 space-y-2">
          <div className="h-3.5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

/* ─── Service result card ─── */
const ServiceCard = ({ service, onBook }) => {
  const navigate = useNavigate();
  const artisan = service.artisan || {};
  const serviceName = service.name || service.serviceName;

  return (
    <div className="bg-white rounded-card shadow-card p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start gap-3">
        <img
          src={optimizeImage(artisan.profileImage || artisan.profileImageUrl || '/default-avatar.png', { width: 64, height: 64 })}
          alt={artisan.fullName}
          className="w-14 h-14 rounded-card object-cover shrink-0"
          onError={(e) => { e.target.src = '/default-avatar.png'; }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{serviceName}</h3>
          <p className="text-xs text-gray-500">
            by <span className="font-medium text-gray-700">{artisan.fullName}</span>
          </p>
          {artisan.averageRating > 0 && (
            <div className="mt-1">
              <Badge variant="rating" rating={artisan.averageRating} count={artisan.totalReviews} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="text-sm">
          <span className="font-semibold text-gray-900">&#8377;{service.price || 0}</span>
          <span className="text-gray-400 ml-1 text-xs">{service.durationMinutes || 60} min</span>
        </div>
        <div className="flex gap-2">
          {artisan.publicId && (
            <button
              type="button"
              onClick={() => navigate(`/${artisan.publicId}`)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-card hover:bg-gray-200 transition-colors"
            >
              Profile
            </button>
          )}
          <button
            type="button"
            onClick={() => onBook(artisan, service)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-brand-500 rounded-card hover:bg-brand-600 transition-colors"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Booking modal (preserved from original) ─── */
const BookServiceModal = ({ target, onClose, userType, showToast }) => {
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const service = target?.service;
  const artisan = target?.artisan;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime) {
      showToast?.('Please pick a start time for your booking.', 'error');
      return;
    }
    if (userType !== 'user') {
      showToast?.('Please log in as a customer to book a service.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const start = new Date(startTime);
      await api.post('/api/bookings', {
        artisan: artisan._id || artisan.id,
        serviceId: service?.serviceId || service?._id,
        start,
        notes,
        price: service?.price || 0,
      });
      showToast?.('Booking request sent to the artisan!', 'success');
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create booking. Please try again.';
      showToast?.(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet open={true} onClose={onClose} title={`Book ${service?.name || 'Service'}`}>
      <p className="text-sm text-gray-500 mb-4">With {artisan?.fullName}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Preferred start time {service && `(${service.durationMinutes || 60} min)`}
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-card border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-card border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="Share any specifics, venue details, or questions."
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-card hover:bg-gray-200 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-card hover:bg-brand-600 transition-colors disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Sending...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};

export default SearchResults;
