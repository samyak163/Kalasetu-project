import { useState, useEffect, useMemo, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/axios.js';
import SEO from '../components/SEO.jsx';
import { optimizeImage } from '../utils/cloudinary.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';

const DEFAULT_STATE = {
  mode: 'artisan',
  category: null,
  services: [],
  artisans: [],
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const { userType } = useAuth();
  const { showToast } = useContext(ToastContext);

  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const serviceParam = searchParams.get('service') || '';

  const [results, setResults] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingTarget, setBookingTarget] = useState(null);

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

        const response = await api.get(`/api/search?${params.toString()}`, { signal: controller.signal });
        if (controller.signal.aborted) return;
        if (response.data?.success) {
          setResults({
            mode: response.data.mode || 'artisan',
            category: response.data.category || null,
            services: response.data.services || [],
            artisans: response.data.artisans || [],
          });
        } else {
          setResults(DEFAULT_STATE);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Search error:', err);
        setError(err);
        setResults(DEFAULT_STATE);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchResults();
    return () => controller.abort();
  }, [query, categoryParam, serviceParam]);

  const heading = useMemo(() => {
    if (results.mode === 'category' && results.category) {
      return `${results.category.name} Services`;
    }
    if (results.mode === 'service' && results.services[0]?.name) {
      return `${results.services[0].name} Providers`;
    }
    if (categoryParam) {
      return `${categoryParam} Artisans`;
    }
    if (query) {
      return `Results for "${query}"`;
    }
    return 'Artisans';
  }, [results, categoryParam, query]);

  const totalCount = useMemo(() => {
    if (results.mode === 'artisan') return results.artisans.length;
    if (results.mode === 'service') return results.services.length;
    if (results.mode === 'category') {
      return results.services.reduce((acc, service) => acc + (service.offerings?.length || 0), 0);
    }
    return 0;
  }, [results]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${heading} | KalaSetu`}
        description={`Find artisans and services for ${heading}`}
      />

      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h1>
          <p className="text-gray-600">
            {loading ? 'Fetching live data...' : `Showing ${totalCount} result${totalCount === 1 ? '' : 's'}`}
          </p>
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Something went wrong while fetching results. Please try again.
            </div>
          )}
        </header>

        {loading ? (
          <LoadingState mode={results.mode} />
        ) : (
          <ResultsView
            results={results}
            onBook={(payload) => setBookingTarget(payload)}
          />
        )}
      </div>

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

const LoadingState = ({ mode }) => {
  const placeholderCount = mode === 'artisan' ? 6 : 3;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: placeholderCount }).map((_, index) => (
        <div key={`loading-${index}`} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ResultsView = ({ results, onBook }) => {
  if (results.mode === 'category') {
    if (results.services.length === 0) {
      return <EmptyState message="No services found for this category yet." />;
    }
    return (
      <div className="space-y-8">
        {results.services.map((service) => (
          <section key={service.name}>
            <header className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{service.name}</h2>
                <p className="text-sm text-gray-500">
                  {service.offerings?.length || 0} artisan{service.offerings?.length === 1 ? '' : 's'} available
                </p>
              </div>
            </header>
            <div className="grid gap-6 md:grid-cols-2">
              {service.offerings?.map((offering) => (
                <ServiceCard key={offering.serviceId} service={offering} onBook={onBook} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (results.mode === 'service') {
    if (results.services.length === 0) {
      return <EmptyState message="No artisans currently offer this service." />;
    }
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {results.services.map((service) => (
          <ServiceCard key={service.serviceId} service={service} onBook={onBook} />
        ))}
      </div>
    );
  }

  if (results.artisans.length === 0) {
    return <EmptyState message="No artisans matched your search yet." />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {results.artisans.map((artisan) => (
        <ArtisanCard key={artisan.publicId || artisan._id} artisan={artisan} />
      ))}
    </div>
  );
};

const ServiceCard = ({ service, onBook }) => {
  const artisan = service.artisan || {};
  const serviceName = service.name || service.serviceName;
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <img
          src={optimizeImage(artisan.profileImage || artisan.profileImageUrl || '/default-avatar.png', { width: 72, height: 72 })}
          alt={artisan.fullName}
          className="w-18 h-18 rounded-xl object-cover"
          onError={(e) => { e.target.src = '/default-avatar.png'; }}
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{serviceName}</h3>
          <p className="text-sm text-gray-500">
            by <span className="font-medium text-gray-800">{artisan.fullName}</span>
          </p>
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">{service.description || artisan.bio || 'Trusted local artisan offering professional services.'}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          <div>
            <span className="font-medium text-gray-800">Price:</span> ₹{service.price || 0}
          </div>
          <div>
            <span className="font-medium text-gray-800">Duration:</span> {service.durationMinutes || 60} minutes
          </div>
        </div>
        <button
          type="button"
          onClick={() => onBook({ service, artisan })}
          className="px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors"
        >
          Book
        </button>
      </div>
    </div>
  );
};

const ArtisanCard = ({ artisan }) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    <div className="flex flex-col md:flex-row">
      <div className="md:w-48 bg-gray-100">
        <img
          src={optimizeImage(artisan.profileImage || artisan.profileImageUrl || '/default-avatar.png', { width: 288, height: 288 })}
          alt={artisan.fullName}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = '/default-avatar.png'; }}
        />
      </div>
      <div className="flex-1 p-6 flex flex-col gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{artisan.fullName}</h3>
          <p className="text-sm text-gray-500">{artisan.craft || artisan.businessName}</p>
        </div>
        <p className="text-sm text-gray-600 line-clamp-3">
          {artisan.bio || 'Experienced artisan delivering quality craftsmanship.'}
        </p>
        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
          {artisan.city && <span>📍 {artisan.city}</span>}
          {artisan.averageRating && <span>⭐ {Number(artisan.averageRating).toFixed(1)}</span>}
          {artisan.verified && <span className="text-green-600">✔ Verified</span>}
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
    {message}
  </div>
);

const BookServiceModal = ({ target, onClose, userType, showToast }) => {
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const service = target?.service;
  const artisan = target?.artisan;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime) {
      showToast?.('Please pick a time for your booking.', 'error');
      return;
    }
    if (userType !== 'user') {
      showToast?.('Please log in as a customer to book a service.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + (service.durationMinutes || 60) * 60000);
      await api.post('/api/bookings', {
        artisan: artisan._id || artisan.id,
        serviceId: service.serviceId || service._id,
        start,
        end,
        notes,
        price: service.price || 0,
      });
      showToast?.('Booking request sent to the artisan!', 'success');
      onClose();
    } catch (err) {
      console.error('Booking error:', err);
      const message = err.response?.data?.message || 'Failed to create booking. Please try again.';
      showToast?.(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Book {service?.name}</h3>
            <p className="text-sm text-gray-500">With {artisan?.fullName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </header>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Preferred start time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#A55233] focus:border-[#A55233]"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Notes for the artisan (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#A55233] focus:border-[#A55233]"
              placeholder="Share any specifics, venue details, or questions."
            />
          </div>
          <footer className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Confirm Booking'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default SearchResults;
