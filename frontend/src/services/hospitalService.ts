import { HospitalResult } from '../types/disease';
import { apiClient } from './apiClient';

/** Discriminated error type so callers can show the right UI state. */
export type HospitalError =
  | 'backend_unavailable'   // backend not running / network error
  | 'api_error'             // backend returned non-2xx
  | 'not_configured'        // GOOGLE_PLACES_API_KEY missing in backend
  | 'location_denied'       // browser geolocation permission denied
  | 'location_unavailable'  // GPS/network position unavailable
  | 'location_timeout'      // geolocation timed out
  | 'unsupported';          // browser does not support geolocation

export class HospitalServiceError extends Error {
  constructor(
    public readonly type: HospitalError,
    message: string
  ) {
    super(message);
    this.name = 'HospitalServiceError';
  }
}

export const hospitalService = {
  /**
   * Get current browser coordinates. Throws HospitalServiceError on any failure.
   */
  async getCoordinates(): Promise<{ latitude: number; longitude: number }> {
    if (!('geolocation' in navigator)) {
      throw new HospitalServiceError('unsupported', 'Geolocation is not supported by this browser.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        (err) => {
          if (err.code === 1) {
            reject(new HospitalServiceError('location_denied', 'Location permission was denied.'));
          } else if (err.code === 2) {
            reject(new HospitalServiceError('location_unavailable', 'Location is currently unavailable.'));
          } else {
            reject(new HospitalServiceError('location_timeout', 'Location request timed out.'));
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    });
  },

  /**
   * Search for nearby dermatology hospitals by user coordinates.
   * Throws HospitalServiceError on any failure — never silently returns [].
   */
  async getNearbyHospitals(
    latitude: number,
    longitude: number,
    radiusKm: number = 15
  ): Promise<HospitalResult[]> {
    let response: any;
    try {
      response = await apiClient.get(
        '/hospitals/nearby?latitude=' + latitude + '&longitude=' + longitude + '&radius_km=' + radiusKm
      );
    } catch (e: any) {
      const msg = e?.message || '';
      const isNetwork =
        e instanceof TypeError ||
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('Load failed') ||
        msg.includes('Unable to connect');
      if (isNetwork) {
        throw new HospitalServiceError(
          'backend_unavailable',
          'The DermaSense backend is offline. Start it with start-backend.bat to search for nearby hospitals.'
        );
      }
      // HTTP error (4xx / 5xx from apiClient)
      if (msg.includes('not configured') || msg.includes('API key')) {
        throw new HospitalServiceError('not_configured', msg);
      }
      throw new HospitalServiceError('api_error', msg || 'Hospital search request failed.');
    }

    // Backend returns a JSON array directly for this endpoint
    if (Array.isArray(response)) return response as HospitalResult[];
    // Some FastAPI responses wrap in { data: [...] }
    if (Array.isArray(response?.data)) return response.data as HospitalResult[];
    // Unexpected response shape
    return [];
  },

  /**
   * Text search for dermatology hospitals by city/location name.
   * Throws HospitalServiceError on failure.
   */
  async searchHospitals(
    query: string,
    latitude?: number,
    longitude?: number
  ): Promise<HospitalResult[]> {
    let url = '/hospitals/search?query=' + encodeURIComponent(query);
    if (latitude !== undefined && longitude !== undefined) {
      url += '&latitude=' + latitude + '&longitude=' + longitude;
    }

    let response: any;
    try {
      response = await apiClient.get(url);
    } catch (e: any) {
      const msg = e?.message || '';
      const isNetwork =
        e instanceof TypeError ||
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('Load failed');
      if (isNetwork) {
        throw new HospitalServiceError('backend_unavailable', 'The DermaSense backend is offline.');
      }
      if (msg.includes('not configured') || msg.includes('API key')) {
        throw new HospitalServiceError('not_configured', msg);
      }
      throw new HospitalServiceError('api_error', msg || 'Hospital search request failed.');
    }

    if (Array.isArray(response)) return response as HospitalResult[];
    if (Array.isArray(response?.data)) return response.data as HospitalResult[];
    return [];
  },

  /**
   * Open Google Maps directions to a hospital.
   */
  openDirections(hospital: HospitalResult): void {
    if (hospital.maps_url) {
      window.open(hospital.maps_url, '_blank', 'noopener,noreferrer');
    } else {
      const url = 'https://www.google.com/maps/dir/?api=1&destination=' + hospital.latitude + ',' + hospital.longitude;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  },
};

