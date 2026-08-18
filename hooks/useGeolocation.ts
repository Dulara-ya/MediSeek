
import { useState, useEffect } from 'react';
import { GeoLocation } from '../types';
import { DEFAULT_LOCATION } from '../constants';

const useGeolocation = (): { location: GeoLocation | null; error: string | null; loading: boolean } => {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLocation(DEFAULT_LOCATION); // Fallback to default
      setLoading(false);
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setError(null);
      setLoading(false);
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn(`Geolocation Error (${err.code}): ${err.message}`);
      // Set a default location if user denies or error occurs
      setLocation(DEFAULT_LOCATION);
      switch(err.code) {
        case err.PERMISSION_DENIED:
          setError("User denied the request for Geolocation. Showing default location.");
          break;
        case err.POSITION_UNAVAILABLE:
          setError("Location information is unavailable. Showing default location.");
          break;
        case err.TIMEOUT:
          setError("The request to get user location timed out. Showing default location.");
          break;
        default:
          setError("An unknown error occurred with geolocation. Showing default location.");
          break;
      }
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0 // Force fresh location
    });
  }, []);

  return { location, error, loading };
};

export default useGeolocation;
