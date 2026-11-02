import { useEffect, useState } from 'react';
import { type GeoPosition, TEST_FALLBACK_POSITION, describeGeolocationError } from '@/lib/geolocation';

export function useOwnPosition(enabled: boolean, testMode: boolean) {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) {
      setPosition(null);
      setError('');
      return;
    }
    if (!navigator.geolocation) {
      if (testMode) {
        setPosition(TEST_FALLBACK_POSITION);
        setError('');
      } else {
        setError('Geolocalización no disponible en este dispositivo.');
      }
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setError('');
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        if (testMode) {
          setError('');
          setPosition(TEST_FALLBACK_POSITION);
          return;
        }
        setPosition(null);
        setError(describeGeolocationError(err));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled, testMode]);

  return { position, error };
}
