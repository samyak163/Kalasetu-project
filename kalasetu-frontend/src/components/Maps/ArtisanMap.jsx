import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import { getGoogleMapsApiKey } from '../../lib/googleMaps';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629, // Center of India
};

export default function ArtisanMap({ artisans, onMarkerClick }) {
  const [, setMap] = useState(null);
  const [selectedArtisan, setSelectedArtisan] = useState(null);

  const safeArtisans = Array.isArray(artisans) ? artisans : [];

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: getGoogleMapsApiKey(),
    libraries: ['places'],
  });

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);

    // Fit bounds to show all markers
    if (safeArtisans.length > 0 && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      safeArtisans.forEach((artisan) => {
        if (artisan?.location?.coordinates?.length === 2) {
          bounds.extend({
            lat: artisan.location.coordinates[1],
            lng: artisan.location.coordinates[0],
          });
        }
      });
      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds);
      }
    }
  }, [artisans]); // eslint-disable-line react-hooks/exhaustive-deps

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (artisan) => {
    setSelectedArtisan(artisan);
    if (onMarkerClick) onMarkerClick(artisan);
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-red-600">Error loading maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={5}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {safeArtisans.map((artisan) => {
        if (!artisan?.location?.coordinates || artisan.location.coordinates.length !== 2) return null;

        const position = {
          lat: artisan.location.coordinates[1],
          lng: artisan.location.coordinates[0],
        };

        return (
          <Marker
            key={artisan._id || artisan.id || artisan.publicId || artisan.objectID}
            position={position}
            onClick={() => handleMarkerClick(artisan)}
            icon={artisan.profileImage ? {
              url: artisan.profileImage,
              scaledSize: new window.google.maps.Size(40, 40),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(20, 20),
            } : undefined}
          />
        );
      })}

      {selectedArtisan && selectedArtisan.location?.coordinates && (
        <InfoWindow
          position={{
            lat: selectedArtisan.location.coordinates[1],
            lng: selectedArtisan.location.coordinates[0],
          }}
          onCloseClick={() => setSelectedArtisan(null)}
        >
          <div className="p-2 max-w-xs">
            <div className="flex items-center gap-3 mb-2">
              {selectedArtisan.profileImage && (
                <img
                  src={selectedArtisan.profileImage}
                  alt={selectedArtisan.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedArtisan.fullName}
                </h3>
                <p className="text-sm text-gray-600">{selectedArtisan.craft}</p>
              </div>
            </div>
            {selectedArtisan.location?.city && (
              <p className="text-sm text-gray-500 mb-2">
                📍 {selectedArtisan.location.city}
                {selectedArtisan.location.state ? `, ${selectedArtisan.location.state}` : ''}
              </p>
            )}
            {selectedArtisan.bio && (
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {selectedArtisan.bio}
              </p>
            )}
            <a
              href={`/${selectedArtisan.publicId}`}
              className="inline-block px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              View Profile
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

ArtisanMap.propTypes = {
  artisans: PropTypes.arrayOf(PropTypes.object).isRequired,
  onMarkerClick: PropTypes.func,
};
