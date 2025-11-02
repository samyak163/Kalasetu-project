import { GOOGLE_MAPS_CONFIG } from '../config/env.config.js';

/**
 * Check if Google Maps is enabled
 * @returns {boolean}
 */
export const isGoogleMapsEnabled = () => {
  return !!(GOOGLE_MAPS_CONFIG?.enabled && GOOGLE_MAPS_CONFIG?.apiKey);
};

/**
 * Get Google Maps API key
 * @returns {string|null}
 */
export const getGoogleMapsApiKey = () => {
  if (!isGoogleMapsEnabled()) {
    console.warn('Google Maps is not enabled');
    return null;
  }
  return GOOGLE_MAPS_CONFIG.apiKey;
};

/**
 * Geocode address to coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise<Object|null>} Coordinates {lat, lng, formattedAddress}
 */
export const geocodeAddress = async (address) => {
  if (!isGoogleMapsEnabled() || !window.google?.maps) return null;

  try {
    const geocoder = new window.google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: results[0].formatted_address,
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Failed to geocode address:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object|null>} Address data
 */
export const reverseGeocode = async (lat, lng) => {
  if (!isGoogleMapsEnabled() || !window.google?.maps) return null;

  try {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          resolve({
            formattedAddress: results[0].formatted_address,
            addressComponents: results[0].address_components,
          });
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Failed to reverse geocode:', error);
    return null;
  }
};

/**
 * Calculate distance between two points using Distance Matrix API
 * @param {Object} origin - {lat, lng}
 * @param {Object} destination - {lat, lng}
 * @returns {Promise<Object|null>} Distance data
 */
export const calculateDistance = async (origin, destination) => {
  if (!isGoogleMapsEnabled() || !window.google?.maps) return null;

  try {
    const service = new window.google.maps.DistanceMatrixService();

    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: 'DRIVING',
        },
        (response, status) => {
          if (status === 'OK') {
            const result = response.rows?.[0]?.elements?.[0];
            if (result?.status === 'OK') {
              resolve({
                distance: result.distance.text,
                distanceValue: result.distance.value,
                duration: result.duration.text,
                durationValue: result.duration.value,
              });
            } else {
              reject(new Error('Route not found'));
            }
          } else {
            reject(new Error(`Distance calculation failed: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Failed to calculate distance:', error);
    return null;
  }
};

/**
 * Get current location
 * @returns {Promise<Object|null>} Current position {lat, lng, accuracy}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

export default {
  isGoogleMapsEnabled,
  getGoogleMapsApiKey,
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  getCurrentLocation,
};
