import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';
import LocationSearch from './LocationSearch.jsx';

const HeroSearch = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  return (
    <section className="relative text-white py-20 md:py-32 px-4 sm:px-8">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop" 
          className="w-full h-full object-cover" 
          alt="Artisan marketplace" 
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>
      <div className="relative container mx-auto text-center z-10 max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Find Local Artisans in Your City</h2>
        <p className="text-md md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
          Discover and connect with the best local talent, from handmade crafts to essential home services.
          {selectedLocation && (
            <span className="block mt-2 text-indigo-200">
              📍 Near {selectedLocation.city || selectedLocation.address}
            </span>
          )}
        </p>
        
        {/* Combined Search & Location */}
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Location Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowLocationSearch(!showLocationSearch)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto whitespace-nowrap"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700 text-sm md:text-base">
                  {selectedLocation ? selectedLocation.city || selectedLocation.address : 'Location'}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Location Search Dropdown */}
              {showLocationSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 md:w-96">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">Select Location</h3>
                    <button
                      onClick={() => setShowLocationSearch(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <LocationSearch
                    onLocationSelect={(location) => {
                      setSelectedLocation(location);
                      setShowLocationSearch(false);
                    }}
                    defaultValue={selectedLocation?.address || ''}
                    showMap={false}
                  />
                </div>
              )}
            </div>
            
            {/* Main Search Bar */}
            <div className="flex-1">
              <SearchBar 
                showLocationSearch={false}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Quick Category Buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {['Pottery', 'Weaving', 'Jewelry', 'Woodwork', 'Painting'].map((category) => (
            <button
              key={category}
              onClick={() => navigate(`/search?category=${encodeURIComponent(category)}`)}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full font-medium transition-colors backdrop-blur-sm text-sm md:text-base"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
