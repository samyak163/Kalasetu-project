import { useState, useCallback, useRef, useEffect } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { getGoogleMapsApiKey } from '../lib/googleMaps.js';

const LocationSearch = ({ onLocationSelect, className = '', defaultValue = '', showMap = false }) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: getGoogleMapsApiKey(),
    libraries: ['places']
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (defaultValue && defaultValue !== inputValue) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);

  const onLoad = useCallback((autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  }, []);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place.geometry) {
        const addressComponents = place.address_components || [];
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
          city: addressComponents.find(c => 
            c.types.includes('locality') || 
            c.types.includes('administrative_area_level_2')
          )?.long_name || '',
          state: addressComponents.find(c => 
            c.types.includes('administrative_area_level_1')
          )?.long_name || '',
          country: addressComponents.find(c => 
            c.types.includes('country')
          )?.long_name || 'India'
        };
        
        setInputValue(place.formatted_address);
        setShowDropdown(false);
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      }
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode using Google Maps API
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === 'OK' && results[0]) {
                  const addressComponents = results[0].address_components || [];
                  const location = {
                    lat: latitude,
                    lng: longitude,
                    address: results[0].formatted_address,
                    city: addressComponents.find(c => 
                      c.types.includes('locality') || 
                      c.types.includes('administrative_area_level_2')
                    )?.long_name || '',
                    state: addressComponents.find(c => 
                      c.types.includes('administrative_area_level_1')
                    )?.long_name || '',
                    country: addressComponents.find(c => 
                      c.types.includes('country')
                    )?.long_name || 'India'
                  };
                  setInputValue(results[0].formatted_address);
                  setShowDropdown(false);
                  if (onLocationSelect) {
                    onLocationSelect(location);
                  }
                }
              }
            );
          } else {
            // Fallback: just use coordinates
            const location = { lat: latitude, lng: longitude, address: `${latitude}, ${longitude}` };
            setInputValue(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            if (onLocationSelect) {
              onLocationSelect(location);
            }
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  if (loadError) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error loading maps. Please check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      <div className="relative">
        {isLoaded ? (
          <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            restrictions={{ country: 'in' }}
            options={{
              types: ['(cities)'],
              componentRestrictions: { country: 'in' }
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => inputValue.length > 0 && setShowDropdown(true)}
              placeholder="Enter city or location..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
            />
          </Autocomplete>
        ) : (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter city or location..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
          />
        )}
        
        {/* Location Icon */}
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        
        {/* Clear Button */}
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              if (onLocationSelect) {
                onLocationSelect(null);
              }
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Helper text */}
      <p className="mt-1 text-xs text-gray-500">
        Start typing to see suggestions
      </p>

      {/* Use Current Location Button (optional, can be shown in dropdown) */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <button
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm md:text-base"
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
};

export default LocationSearch;
