import React, { useState, useCallback, useRef, useEffect } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

const LocationSearch = ({ onLocationSelect, initialLocation = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || { lat: 18.5204, lng: 73.8567 });
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      const map = new window.google.maps.Map(document.createElement('div'));
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowPredictions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 && autocompleteService.current) {
        fetchPredictions();
      } else {
        setPredictions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPredictions = () => {
    autocompleteService.current.getPlacePredictions(
      { input: searchQuery, componentRestrictions: { country: 'in' }, types: ['geocode'] },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setShowPredictions(true);
        }
      }
    );
  };

  const handlePredictionSelect = (placeId) => {
    if (!placesService.current) return;
    placesService.current.getDetails(
      { 
        placeId, 
        fields: ['geometry', 'formatted_address', 'name', 'address_components'] 
      },
      (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            // Extract address components
            const addressComponents = place.address_components || [];
            const city = addressComponents.find(c => 
              c.types.includes('locality') || c.types.includes('administrative_area_level_2')
            )?.long_name || '';
            const state = addressComponents.find(c => 
              c.types.includes('administrative_area_level_1')
            )?.long_name || '';
            const country = addressComponents.find(c => 
              c.types.includes('country')
            )?.long_name || '';
            
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address,
              name: place.name,
              city,
              state,
              country
            };
            
            setSelectedLocation(location);
            setSearchQuery(place.formatted_address);
            setShowPredictions(false);
            
            if (onLocationSelect) {
              onLocationSelect(location);
            }
            // Track with PostHog
            if (window.posthog) {
              window.posthog.capture('location_selected', {
                has_coordinates: true,
                source: 'search'
              });
            }
          }
      }
    );
  };

  const handleMapClick = useCallback((event) => {
    const location = {
      lat: event.detail.latLng.lat,
      lng: event.detail.latLng.lng
    };
    
    setSelectedLocation(location);
    
    // Reverse geocode to get address
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          location.address = results[0].formatted_address;
          setSearchQuery(results[0].formatted_address);
          
          if (onLocationSelect) {
            onLocationSelect(location);
          }
        }
      });
    }
    // Track with PostHog
    if (window.posthog) {
      window.posthog.capture('location_selected', {
        has_coordinates: true,
        source: 'map_click'
      });
    }
  }, [onLocationSelect]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setSelectedLocation(location);
          // Reverse geocode
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location }, (results, status) => {
              if (status === 'OK' && results[0]) {
                location.address = results[0].formatted_address;
                setSearchQuery(results[0].formatted_address);
                
                if (onLocationSelect) {
                  onLocationSelect(location);
                }
              }
            });
          }
          // Track with PostHog
          if (window.posthog) {
            window.posthog.capture('location_selected', {
              has_coordinates: true,
              source: 'current_location'
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enable location access or search manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="space-y-4">
      <div ref={searchRef} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => predictions.length > 0 && setShowPredictions(true)}
            placeholder="Search for a location..."
            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
          
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        {/* Predictions Dropdown */}
        {showPredictions && predictions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                onClick={() => handlePredictionSelect(prediction.place_id)}
                className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-start space-x-3"
              >
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="text-xs text-gray-500">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Location Button */}
      <button
        onClick={handleUseCurrentLocation}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
        <span>Use My Current Location</span>
      </button>

      {/* Map */}
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <div className="h-80 rounded-lg overflow-hidden border-2 border-gray-200">
          <Map
            center={selectedLocation}
            zoom={13}
            onClick={handleMapClick}
            mapId="location-picker-map"
          >
            <Marker position={selectedLocation} />
          </Map>
        </div>
      </APIProvider>

      {/* Selected Location Info */}
      {searchQuery && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-orange-900">Selected Location</p>
              <p className="text-sm text-orange-700">{searchQuery}</p>
              <p className="text-xs text-orange-600 mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;


