export interface GeoPosition {
  lat: number;
  lng: number;
}

export const TEST_FALLBACK_POSITION: GeoPosition = { lat: 11.2255, lng: -74.1864 };

const NO_GEOLOCATION_MESSAGE = 'Geolocalización no disponible en este dispositivo.';

export function describeGeolocationError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Permiso de ubicación denegado (PERMISSION_DENIED). Permite el acceso a tu ubicación en el navegador.';
    case error.POSITION_UNAVAILABLE:
      return 'Ubicación no disponible (POSITION_UNAVAILABLE). Revisa que el GPS esté encendido.';
    case error.TIMEOUT:
      return 'Tiempo agotado al obtener tu ubicación (TIMEOUT). Intenta de nuevo.';
    default:
      return 'No se pudo acceder a tu ubicación.';
  }
}

function getPositionOnce(enableHighAccuracy: boolean): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error(NO_GEOLOCATION_MESSAGE));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(describeGeolocationError(err))),
      { enableHighAccuracy, timeout: 15000, maximumAge: 0 },
    );
  });
}

export function readPosition(testMode: boolean): Promise<GeoPosition> {
  return getPositionOnce(true)
    .catch(() => getPositionOnce(false))
    .catch((err: Error) => {
      if (testMode) return TEST_FALLBACK_POSITION;
      throw err;
    });
}
