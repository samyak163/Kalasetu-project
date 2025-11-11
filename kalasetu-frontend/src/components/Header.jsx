import React, { useContext, useState, useEffect, useRef } from 'react';
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
import LocationSearch from './LocationSearch.jsx';

const Header = () => {
  const { auth, logout } = useContext(AuthContext);
  const { notifications, unreadCount } = useNotifications();
  const [showArtisanInfo, setShowArtisanInfo] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [headerLocation, setHeaderLocation] = useState(null);
  const [showHeaderLocationSearch, setShowHeaderLocationSearch] = useState(false);
  const locationRef = useRef(null);

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

  // Close location dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowHeaderLocationSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenProfile = () => {
    // Only artisans use this handler (users open modal from ProfileDropdown directly)
    if (auth.userType === 'artisan') {
      globalThis.location.href = '/artisan/dashboard/account';
    }
  };

  const renderAuthLinks = () => {
    // Case 1: No one is logged in
    if (!auth.user) {
      return (
        <>
          <Link to="/user/login" className="text-sm font-semibold !text-black hover:text-[#A55233] transition-colors">Sign In</Link>
          <Link to="/register" className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#A55233] hover:bg-[#8e462b] transition-colors">Sign Up</Link>
        </>
      );
    }

    // Case 2: User or Artisan is logged in - use ProfileDropdown
    return (
      <ProfileDropdown 
        user={auth.user}
        userType={auth.userType}
        onLogout={logout}
        onOpenProfile={handleOpenProfile}
      />
    );
  };

  return (
    <header className="!bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 !text-black" aria-label="Top">
        <div className="w-full py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center flex-1 min-w-0">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-[#A55233] flex-shrink-0">
              Kala<span className="!text-black">Setu</span>
            </Link>
            {/* Main Nav */}
            <div className="hidden ml-10 space-x-8 lg:block">
              <Link to="/services" className="text-sm font-semibold !text-black hover:text-[#A55233] transition-colors">Services</Link>
              <button type="button" onClick={() => setShowHowItWorks(true)} className="text-sm font-semibold !text-black hover:text-[#A55233] transition-colors">How It Works</button>
              <button type="button" onClick={() => setShowArtisanInfo(true)} className="text-sm font-semibold !text-black hover:text-[#A55233] transition-colors">For Artisans</button>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8 min-w-0">
            <div className="flex gap-2 w-full">
              {/* Location Dropdown */}
              <div className="relative flex-shrink-0" ref={locationRef}>
                <button
                  onClick={() => setShowHeaderLocationSearch(!showHeaderLocationSearch)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg !bg-white hover:!bg-gray-50 transition-colors whitespace-nowrap text-sm"
                >
                  <svg className="w-4 h-4 !text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm !text-black truncate max-w-24">
                    {headerLocation ? headerLocation.city || headerLocation.address : 'Location'}
                  </span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${showHeaderLocationSearch ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showHeaderLocationSearch && (
                  <div className="absolute top-full left-0 mt-2 z-50 !bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold !text-black text-sm">Set Your Location</h3>
                      <button
                        onClick={() => setShowHeaderLocationSearch(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <LocationSearch
                      onLocationSelect={(location) => {
                        setHeaderLocation(location);
                        setShowHeaderLocationSearch(false);
                        // Store in localStorage for persistence
                        localStorage.setItem('userLocation', JSON.stringify(location));
                      }}
                      defaultValue={headerLocation?.address || ''}
                      showMap={false}
                    />
                    {/* Current Location Button */}
                    <button
                      onClick={() => {
                        if ('geolocation' in navigator) {
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
                                  const location = {
                                    lat: latitude,
                                    lng: longitude,
                                    address: data.results[0].formatted_address,
                                    city: addressComponents.find(c => 
                                      c.types.includes('locality') || 
                                      c.types.includes('administrative_area_level_2')
                                    )?.long_name || ''
                                  };
                                  setHeaderLocation(location);
                                  setShowHeaderLocationSearch(false);
                                  localStorage.setItem('userLocation', JSON.stringify(location));
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
                        } else {
                          alert('Geolocation is not supported by your browser.');
                        }
                      }}
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
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
              {/* Search Bar */}
              <SearchBar className="flex-1 min-w-0" showLocationSearch={false} userLocation={headerLocation} />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 flex-shrink-0">
            <button onClick={() => setShowNotifications(true)} aria-label="Notifications" className="relative text-gray-700 hover:text-[#A55233]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-3 px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
            </button>
            {/* Chat & Call buttons - for both users and artisans */}
            {auth.user && (
              <>
                <Link
                  to={auth.userType === 'artisan' ? '/artisan/chat' : '/messages'}
                  className="relative p-2 text-gray-700 hover:text-[#A55233] transition-colors"
                  aria-label="Chat"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>
                <Link
                  to={auth.userType === 'artisan' ? '/artisan/calls' : '/video-call'}
                  className="relative p-2 text-gray-700 hover:text-[#A55233] transition-colors"
                  aria-label="Calls"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </Link>
              </>
            )}
            {/* Auth Links (Dynamic) */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
              {renderAuthLinks()}
            </div>
          </div>
        </div>
        
        {/* Mobile Search - Below header */}
        <div className="lg:hidden w-full pb-3">
          <div className="flex gap-2">
            <div className="relative flex-shrink-0" ref={locationRef}>
              <button
                onClick={() => setShowHeaderLocationSearch(!showHeaderLocationSearch)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap text-sm"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-sm text-gray-700">
                  {headerLocation ? headerLocation.city || headerLocation.address : 'Set Location'}
                </span>
              </button>
              {showHeaderLocationSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm">Set Your Location</h3>
                    <button
                      onClick={() => setShowHeaderLocationSearch(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <LocationSearch
                    onLocationSelect={(location) => {
                      setHeaderLocation(location);
                      setShowHeaderLocationSearch(false);
                      localStorage.setItem('userLocation', JSON.stringify(location));
                    }}
                    defaultValue={headerLocation?.address || ''}
                    showMap={false}
                  />
                  {/* Current Location Button */}
                  <button
                    onClick={() => {
                      if ('geolocation' in navigator) {
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
                                const location = {
                                  lat: latitude,
                                  lng: longitude,
                                  address: data.results[0].formatted_address,
                                  city: addressComponents.find(c => 
                                    c.types.includes('locality') || 
                                    c.types.includes('administrative_area_level_2')
                                  )?.long_name || ''
                                };
                                setHeaderLocation(location);
                                setShowHeaderLocationSearch(false);
                                localStorage.setItem('userLocation', JSON.stringify(location));
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
                      } else {
                        alert('Geolocation is not supported by your browser.');
                      }
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
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

