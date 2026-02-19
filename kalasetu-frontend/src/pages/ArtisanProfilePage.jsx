import { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios.js';
import SEO from '../components/SEO.jsx';
import { optimizeImage } from '../utils/cloudinary.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';

// Design system components
import {
  ImageCarousel, TabBar, StickyBottomCTA, BottomSheet,
  Skeleton, Button, Input, Alert,
} from '../components/ui/index.js';

// Profile sub-components
import ProfileHeader from '../components/artisan/ProfileHeader.jsx';
import ServicesTab from '../components/artisan/ServicesTab.jsx';
import ReviewsTab from '../components/artisan/ReviewsTab.jsx';
import AboutTab from '../components/artisan/AboutTab.jsx';

/**
 * Rebuilt ArtisanProfilePage — UC/Zomato/Swiggy inspired.
 *
 * Layout:
 *  1. Portfolio Hero Carousel (full-width ImageCarousel)
 *  2. ProfileHeader (avatar, name, stats, actions)
 *  3. Sticky TabBar (Services / Reviews / About)
 *  4. Tab content area
 *  5. StickyBottomCTA (mobile "Book Now" bar)
 *  6. BookingBottomSheet (replaces old modal)
 */
const ArtisanProfilePage = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const { showToast } = useContext(ToastContext);

  const [artisan, setArtisan] = useState(null);
  const [services, setServices] = useState([]);
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('services');
  const [bookingService, setBookingService] = useState(null); // null = closed, object = open BottomSheet

  // Fetch all data in parallel
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [artisanRes, servicesRes] = await Promise.all([
          api.get(`/api/artisans/${publicId}`),
          api.get(`/api/services/artisan/${publicId}`),
        ]);

        if (cancelled) return;
        setArtisan(artisanRes.data);
        setServices(servicesRes.data?.data || servicesRes.data || []);

        // SEO data — non-critical, don't block render
        api.get(`/api/seo/artisan/${publicId}`)
          .then(res => { if (!cancelled && res.data?.success) setSeoData(res.data.seo); })
          .catch(() => { /* SEO data is optional */ });
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load artisan profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [publicId]);

  // Compute min price across services for StickyBottomCTA
  const minPrice = useMemo(() => {
    const prices = services.filter(s => s.price > 0).map(s => s.price);
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [services]);

  // Build portfolio hero images (cover + best portfolio images)
  const heroImages = useMemo(() => {
    if (!artisan) return [];
    const imgs = [];
    if (artisan.coverImageUrl) imgs.push(optimizeImage(artisan.coverImageUrl, { width: 1200, height: 500, crop: 'fill' }));
    const portfolio = artisan.portfolioImageUrls || [];
    portfolio.slice(0, 5).forEach(url => imgs.push(optimizeImage(url, { width: 1200, height: 500, crop: 'fill' })));
    // If only cover or no images, add a placeholder
    if (imgs.length === 0) imgs.push('https://placehold.co/1200x500/A55233/FFFFFF?text=KalaSetu');
    return imgs;
  }, [artisan]);

  // Build dynamic tabs based on available content
  const tabs = useMemo(() => {
    const t = [];
    if (services.length > 0) t.push({ key: 'services', label: 'Services', count: services.length });
    t.push({ key: 'reviews', label: 'Reviews', count: artisan?.totalReviews || undefined });
    t.push({ key: 'about', label: 'About' });
    return t;
  }, [services, artisan?.totalReviews]);

  // Default to first tab with content
  useEffect(() => {
    if (!loading && tabs.length > 0 && !tabs.find(t => t.key === activeTab)) {
      setActiveTab(tabs[0].key);
    }
  }, [loading, tabs, activeTab]);

  // Action handlers
  const handleChat = useCallback(() => {
    if (!user) { showToast('Please log in to chat with artisans', 'error'); navigate('/login'); return; }
    if (userType !== 'user') { showToast('Please log in as a customer to chat', 'error'); return; }
    navigate(`/messages?artisan=${artisan._id}`);
  }, [user, userType, artisan, navigate, showToast]);

  const handleBook = useCallback((service = null) => {
    if (!user) { showToast('Please log in to book services', 'error'); navigate('/login'); return; }
    if (userType !== 'user') { showToast('Please log in as a customer to book', 'error'); return; }
    setBookingService(service || services[0] || null);
  }, [user, userType, services, navigate, showToast]);

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-muted">
        <Skeleton variant="rect" className="w-full" height="320px" />
        <div className="max-w-container mx-auto px-4 -mt-8 space-y-4">
          <Skeleton variant="rect" height="140px" className="rounded-card" />
          <Skeleton variant="rect" height="48px" className="rounded-card" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rect" height="200px" className="rounded-card" />)}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Error state ----------
  if (error || !artisan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert type="error" className="max-w-md">
          <p className="font-medium">{error || 'Artisan not found'}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Alert>
      </div>
    );
  }

  // Augment artisan with computed min price for ProfileHeader
  const artisanWithMeta = { ...artisan, _minPrice: minPrice };

  return (
    <>
      {seoData && (
        <SEO
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          image={seoData.image}
          url={seoData.url}
          type={seoData.type}
          jsonLd={seoData.structuredData}
        />
      )}

      <div className="min-h-screen bg-surface-muted pb-20 md:pb-8">
        {/* 1. Portfolio Hero Carousel */}
        <ImageCarousel images={heroImages} aspectRatio="12/5" className="w-full" />

        <div className="max-w-container mx-auto px-4 -mt-6 relative z-10 space-y-4">
          {/* 2. Profile Header */}
          <ProfileHeader
            artisan={artisanWithMeta}
            serviceCount={services.length}
            onChat={handleChat}
            onBook={() => handleBook()}
          />

          {/* 3. Sticky TabBar */}
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="rounded-card shadow-card"
          />

          {/* 4. Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'services' && (
              <ServicesTab services={services} onBook={handleBook} />
            )}
            {activeTab === 'reviews' && (
              <ReviewsTab
                artisanId={artisan._id}
                averageRating={artisan.averageRating || 0}
                totalReviews={artisan.totalReviews || 0}
              />
            )}
            {activeTab === 'about' && (
              <AboutTab artisan={artisan} />
            )}
          </div>
        </div>

        {/* 5. Sticky Bottom CTA (mobile only) */}
        {services.length > 0 && (
          <StickyBottomCTA>
            <Button variant="primary" className="w-full" onClick={() => handleBook()}>
              {minPrice
                ? `Book Now \u2014 From \u20B9${minPrice.toLocaleString('en-IN')}`
                : 'Book Now'}
            </Button>
          </StickyBottomCTA>
        )}

        {/* 6. Booking BottomSheet */}
        <BookingBottomSheet
          service={bookingService}
          artisan={artisan}
          onClose={() => setBookingService(null)}
          showToast={showToast}
        />
      </div>
    </>
  );
};

// ---------- Booking BottomSheet ----------

function BookingBottomSheet({ service, artisan, onClose, showToast }) {
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form when sheet opens/closes
  useEffect(() => {
    if (service) { setStartTime(''); setNotes(''); }
  }, [service]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime) { showToast('Please pick a date and time', 'error'); return; }

    setSubmitting(true);
    try {
      await api.post('/api/bookings', {
        artisan: artisan._id || artisan.id,
        serviceId: service?._id || service?.serviceId,
        start: new Date(startTime),
        notes,
        price: service?.price || 0,
      });
      showToast('Booking request sent!', 'success');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      open={!!service}
      onClose={onClose}
      title={service ? `Book ${service.name}` : 'Book Service'}
    >
      {service && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service summary */}
          <div className="bg-surface-muted rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-900">{service.name}</p>
            <p className="text-gray-500 mt-0.5">
              With {artisan.fullName}
              {service.price > 0 && ` \u2022 \u20B9${service.price.toLocaleString('en-IN')}`}
              {service.durationMinutes > 0 && ` \u2022 ${service.durationMinutes} min`}
            </p>
          </div>

          {/* Date/time picker */}
          <Input
            label="Preferred date & time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            helperText="End time will be calculated based on service duration"
            required
          />

          {/* Notes */}
          <Input
            as="textarea"
            label="Notes for the artisan (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specifics, venue details, or questions..."
            rows={3}
          />

          {/* CTA */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={submitting}
          >
            {submitting ? 'Sending...' : 'Confirm Booking'}
          </Button>
        </form>
      )}
    </BottomSheet>
  );
}

export default ArtisanProfilePage;
