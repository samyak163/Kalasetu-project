# TASK: Fix Header.jsx Duplicate Code

## Priority: MEDIUM (Code Quality)

## Problem
Header.jsx (330+ lines) has the same location dropdown code copy-pasted twice:
- Desktop version: lines ~97-188
- Mobile version: lines ~234-320

This violates DRY (Don't Repeat Yourself) and makes maintenance hard.

## File to Fix
`kalasetu-frontend/src/components/Header.jsx`

## Solution: Extract LocationDropdown Component

### Step 1: Create LocationDropdown Component

Create `kalasetu-frontend/src/components/LocationDropdown.jsx`:

```jsx
import { useState, useRef, useEffect } from 'react';
import LocationSearch from './LocationSearch';

/**
 * Reusable location dropdown with search and current location button
 */
export default function LocationDropdown({
  location,
  onLocationChange,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (newLocation) => {
    onLocationChange(newLocation);
    setIsOpen(false);
    // Store in localStorage
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
  };

  const handleGetCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          if (data.results[0]) {
            const addressComponents = data.results[0].address_components || [];
            const newLocation = {
              lat: latitude,
              lng: longitude,
              address: data.results[0].formatted_address,
              city: addressComponents.find(c =>
                c.types.includes('locality') ||
                c.types.includes('administrative_area_level_2')
              )?.long_name || ''
            };
            handleLocationSelect(newLocation);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          alert('Failed to get location. Please enter manually.');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to access your location. Please enter manually.');
      }
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors whitespace-nowrap text-sm"
      >
        {/* Location Icon */}
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>

        {/* Location Text */}
        <span className="text-sm text-gray-700 truncate max-w-24">
          {location ? location.city || location.address : 'Location'}
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Set Your Location</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Location Search Input */}
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            defaultValue={location?.address || ''}
            showMap={false}
          />

          {/* Current Location Button */}
          <button
            onClick={handleGetCurrentLocation}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#A55233] text-[#A55233] rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
            </svg>
            Use Current Location
          </button>
        </div>
      )}
    </div>
  );
}
```

### Step 2: Update Header.jsx

Replace the duplicate code with the new component:

```jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import ArtisanInfoModal from './ArtisanInfoModal.jsx';
import HowItWorksModal from './HowItWorksModal.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import ProfileDropdown from './common/ProfileDropdown.jsx';
import ProfileModal from './profile/ProfileModal.jsx';
import SearchBar from './SearchBar.jsx';
import LocationDropdown from './LocationDropdown.jsx';  // NEW IMPORT

const Header = () => {
  const { auth, logout } = useContext(AuthContext);
  const { notifications, unreadCount } = useNotifications();
  const [showArtisanInfo, setShowArtisanInfo] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [headerLocation, setHeaderLocation] = useState(null);

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        setHeaderLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error('Error loading saved location:', error);
      }
    }
  }, []);

  // ... rest of the component (renderAuthLinks, etc.)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full py-4 flex items-center justify-between flex-wrap gap-4">
          {/* Logo and Nav */}
          <div className="flex items-center flex-1 min-w-0">
            <Link to="/" className="text-2xl font-bold text-[#A55233] flex-shrink-0">
              Kala<span className="text-black">Setu</span>
            </Link>
            <div className="hidden ml-10 space-x-8 lg:block">
              {/* Nav links */}
            </div>
          </div>

          {/* Desktop Search with Location - SIMPLIFIED */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8 min-w-0">
            <div className="flex gap-2 w-full">
              <LocationDropdown
                location={headerLocation}
                onLocationChange={setHeaderLocation}
              />
              <SearchBar className="flex-1 min-w-0" showLocationSearch={false} userLocation={headerLocation} />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* ... notifications, chat, profile buttons ... */}
          </div>
        </div>

        {/* Mobile Search - SIMPLIFIED */}
        <div className="lg:hidden w-full pb-3">
          <div className="flex gap-2">
            <LocationDropdown
              location={headerLocation}
              onLocationChange={setHeaderLocation}
            />
            <SearchBar className="flex-1" showLocationSearch={false} userLocation={headerLocation} />
          </div>
        </div>
      </nav>

      {/* Modals */}
      <ArtisanInfoModal isOpen={showArtisanInfo} onClose={() => setShowArtisanInfo(false)} />
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} />
      <ProfileModal />
    </header>
  );
};

export default Header;
```

## Benefits

| Before | After |
|--------|-------|
| 330+ lines | ~150 lines |
| Duplicate code | Single source of truth |
| Hard to maintain | Easy to update |
| Inconsistent behavior risk | Guaranteed consistency |

## Steps

1. Create `LocationDropdown.jsx` component
2. Test it works in isolation
3. Update `Header.jsx` to import and use it
4. Remove the old duplicate code
5. Test both desktop and mobile views
6. Verify location selection works

## Testing

1. Desktop: Click location button, search, select
2. Mobile: Same test
3. "Use Current Location" button works
4. Location persists on page reload (localStorage)
5. Search uses the selected location

## Success Criteria
- Header.jsx is under 200 lines
- No duplicate location dropdown code
- Both desktop and mobile views work
- Location functionality unchanged
- Code is more maintainable
