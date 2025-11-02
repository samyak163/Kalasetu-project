import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import { getGoogleMapsApiKey, getCurrentLocation, reverseGeocode } from '../../lib/googleMaps';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

export default function LocationPicker({ onLocationSelect, initialLocation }) {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(initialLocation || null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: getGoogleMapsApiKey(),
    libraries: ['places'],
  });

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMarker({ lat, lng });

    // Reverse geocode to get address
    setLoading(true);
    try {
      const result = await reverseGeocode(lat, lng);
      if (result) {
        setAddress(result.formattedAddress);
        onLocationSelect?.({
          lat,
          lng,
          address: result.formattedAddress,
          addressComponents: result.addressComponents,
        });
      }
    } catch (error) {
      console.error('Failed to get address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const position = await getCurrentLocation();
      setMarker(position);
      map?.panTo(position);
      map?.setZoom(15);

      const result = await reverseGeocode(position.lat, position.lng);
      if (result) {
        setAddress(result.formattedAddress);
        onLocationSelect?.({
          ...position,
          address: result.formattedAddress,
          addressComponents: result.addressComponents,
        });
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
      alert('Failed to get your location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  if (loadError) {
    return <div className="text-red-600">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {loading ? 'Getting location...' : 'Use Current Location'}
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker || defaultCenter}
        zoom={marker ? 15 : 5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>

      {address && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Selected Location:</p>
          <p className="text-gray-900">{address}</p>
        </div>
      )}

      <p className="mt-2 text-sm text-gray-500">
        Click on the map to select a location
      </p>
    </div>
  );
}

LocationPicker.propTypes = {
  onLocationSelect: PropTypes.func.isRequired,
  initialLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};
