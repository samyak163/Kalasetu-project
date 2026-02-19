import { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios.js';
import SEO from '../components/SEO.jsx';
import { optimizeImage } from '../utils/cloudinary.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';

// Design system components
import {
  ImageCarousel, TabBar, StickyBottomCTA,
  Skeleton, Button, Alert,
} from '../components/ui/index.js';

// Profile sub-components
import ProfileHeader from '../components/artisan/ProfileHeader.jsx';
import ServicesTab from '../components/artisan/ServicesTab.jsx';
import ReviewsTab from '../components/artisan/ReviewsTab.jsx';
import AboutTab from '../components/artisan/AboutTab.jsx';

// Booking flow components (Phase 5 — Swiggy/UC BottomSheet checkout)
import ServiceSummarySheet from '../components/booking/ServiceSummarySheet.jsx';
import PaymentSheet from '../components/booking/PaymentSheet.jsx';
import BookingConfirmation from '../components/booking/BookingConfirmation.jsx';

/**
 * Rebuilt ArtisanProfilePage — UC/Zomato/Swiggy inspired.
 *
 * Layout:
 *  1. Portfolio Hero Carousel (full-width ImageCarousel)
 *  2. ProfileHeader (avatar, name, stats, actions)
 *  3. Sticky TabBar (Services / Reviews / About)
 *     — Products and Custom tabs will be added by the offering redesign plan
 *  4. Tab content area
 *  5. StickyBottomCTA (mobile "Book Now" bar)
 *  6. Multi-step booking flow:
 *     Step 1: ServiceSummarySheet (date/time, notes)
 *     Step 2: PaymentSheet (price breakdown, SlideToConfirm, Razorpay)
 *     Step 3: BookingConfirmation (full-screen celebration)
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

  // Multi-step booking flow state
  // step: null | 'summary' | 'payment' | 'confirmation'
  const [bookingStep, setBookingStep] = useState(null);
  const [bookingService, setBookingService] = useState(null);
  const [bookingData, setBookingData] = useState(null); // { date, time, notes }
  const [bookingResult, setBookingResult] = useState(null); // { bookingId, paymentId, bookingStatus }

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
        // Handle both cached ({ cached: true, data: {...} }) and direct responses
        const artisanData = artisanRes.data?.cached ? artisanRes.data.data : artisanRes.data;
        setArtisan(artisanData);
        const servicesRaw = servicesRes.data?.cached ? servicesRes.data.data : servicesRes.data;
        setServices(servicesRaw?.data || servicesRaw || []);

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
    return imgs;
  }, [artisan]);

  // Build dynamic tabs based on available content
  // Products and Custom tabs will be added by the offering redesign plan
  // (see docs/plans/2026-02-18-artisan-offering-redesign-plan.md)
  const tabs = useMemo(() => {
    const t = [];
    if (services.length > 0) t.push({ key: 'services', label: 'Services', count: services.length });
    t.push({ key: 'reviews', label: 'Reviews', count: artisan?.totalReviews || undefined });
    t.push({ key: 'about', label: 'About' });
    return t;
  }, [services, artisan?.totalReviews]);

  // Default to first tab with content when tab list changes
  // eslint-disable-next-line react-hooks/exhaustive-deps -- activeTab read inside but shouldn't trigger re-run
  useEffect(() => {
    if (!loading && tabs.length > 0 && !tabs.find(t => t.key === activeTab)) {
      setActiveTab(tabs[0].key);
    }
  }, [loading, tabs]); // activeTab intentionally excluded to avoid extra render cycle

  // ---------- Action handlers ----------

  const handleChat = useCallback(() => {
    if (!user) { showToast('Please log in to chat with artisans', 'error'); navigate('/login'); return; }
    if (userType !== 'user') { showToast('Please log in as a customer to chat', 'error'); return; }
    navigate(`/messages?artisan=${artisan._id}`);
  }, [user, userType, artisan, navigate, showToast]);

  // Opens Step 1 of the booking flow
  const handleBook = useCallback((service = null) => {
    if (!user) { showToast('Please log in to book services', 'error'); navigate('/login'); return; }
    if (userType !== 'user') { showToast('Please log in as a customer to book', 'error'); return; }
    const selectedService = service || services[0] || null;
    if (!selectedService) { showToast('No services available to book', 'error'); return; }
    setBookingService(selectedService);
    setBookingData(null);
    setBookingResult(null);
    setBookingStep('summary');
  }, [user, userType, services, navigate, showToast]);

  // Step 1 → Step 2: ServiceSummarySheet "Continue" pressed
  const handleSummaryContinue = useCallback((data) => {
    setBookingData(data);
    setBookingStep('payment');
  }, []);

  // Step 2 → Step 3: Payment verified, booking created
  const handlePaymentSuccess = useCallback((result) => {
    setBookingResult(result);
    setBookingStep('confirmation');
  }, []);

  // Reset booking flow
  const handleBookingClose = useCallback(() => {
    setBookingStep(null);
    setBookingService(null);
    setBookingData(null);
    setBookingResult(null);
  }, []);

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
        {/* 1. Portfolio Hero Carousel — or brand-colored fallback if no images */}
        {heroImages.length > 0 ? (
          <ImageCarousel images={heroImages} aspectRatio="12/5" className="w-full" />
        ) : (
          <div className="w-full bg-brand-500" style={{ aspectRatio: '12/5' }}>
            <div className="h-full flex items-center justify-center">
              <span className="text-white/60 text-lg font-display">KalaSetu</span>
            </div>
          </div>
        )}

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
              <ServicesTab services={services} artisan={artisan} onBook={handleBook} />
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

        {/* 6. Multi-step Booking Flow */}

        {/* Step 1: Service Summary + Date/Time
            key forces remount when service changes, resetting local date/time state */}
        <ServiceSummarySheet
          key={bookingService?._id}
          service={bookingService}
          artisan={artisan}
          open={bookingStep === 'summary'}
          onClose={handleBookingClose}
          onContinue={handleSummaryContinue}
        />

        {/* Step 2: Payment Confirmation */}
        <PaymentSheet
          service={bookingService}
          artisan={artisan}
          bookingData={bookingData}
          open={bookingStep === 'payment'}
          onClose={() => setBookingStep('summary')} // back to Step 1
          onSuccess={handlePaymentSuccess}
          onError={(msg) => showToast(msg, 'error')}
        />

        {/* Step 3: Booking Confirmation (full-screen) */}
        {bookingStep === 'confirmation' && (
          <BookingConfirmation
            service={bookingService}
            artisan={artisan}
            bookingData={bookingData}
            bookingId={bookingResult?.bookingId}
            bookingStatus={bookingResult?.bookingStatus}
            onClose={handleBookingClose}
          />
        )}
      </div>
    </>
  );
};

export default ArtisanProfilePage;
