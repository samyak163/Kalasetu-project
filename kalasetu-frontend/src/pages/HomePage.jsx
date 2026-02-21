import { useState, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import SEO from '../components/SEO.jsx';
import LocationBar from '../components/home/LocationBar.jsx';
import HeroBannerCarousel from '../components/home/HeroBannerCarousel.jsx';
import CategoryChips from '../components/home/CategoryChips.jsx';
import ArtisanCarousel from '../components/home/ArtisanCarousel.jsx';
import HowItWorks from '../components/home/HowItWorks.jsx';
import SearchOverlay from '../components/search/SearchOverlay.jsx';

/**
 * Redesigned homepage — Urban Company / Swiggy inspired layout.
 * LocationBar → Search → Hero → Categories → Artisan Carousels → How It Works
 */
const HomePage = () => {
  const [city, setCity] = useState(() => localStorage.getItem('ks_city') || 'All Cities');
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const topArtisansParams = useMemo(
    () => ({ limit: 12, ...(city !== 'All Cities' ? { city } : {}) }),
    [city]
  );

  return (
    <>
      <SEO
        title="KalaSetu - Discover Local Artisans"
        description="Find and book local artisans for crafts and services near you."
        url="https://kalasetu.com/"
        type="website"
      />

      {/* Sticky location bar */}
      <LocationBar onCityChange={setCity} />

      {/* Search bar — taps open full-screen SearchOverlay */}
      <div className="px-4 py-3 max-w-container mx-auto">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-card text-left text-sm text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <Search className="h-4 w-4 text-gray-400" />
          Search for artisans, services...
        </button>
      </div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />

      {/* Hero banner carousel */}
      <HeroBannerCarousel />

      {/* Category chips — horizontal scroll */}
      <div className="py-4">
        <h2 className="px-4 text-base font-display font-bold text-gray-900 mb-2 max-w-container mx-auto">
          Explore Categories
        </h2>
        <CategoryChips />
      </div>

      {/* Artisan carousels */}
      <ArtisanCarousel
        title={city !== 'All Cities' ? `Top Artisans in ${city}` : 'Top Artisans Near You'}
        endpoint="/api/artisans"
        params={topArtisansParams}
      />

      <ArtisanCarousel
        title="Featured Artisans"
        endpoint="/api/artisans/featured"
        emptyMessage="Featured artisans coming soon"
      />

      {/* How it works */}
      <HowItWorks />
    </>
  );
};

export default HomePage;
