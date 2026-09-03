import { HospitalResult } from '../types/disease';
import { apiClient } from './apiClient';

export const hospitalService = {
  /**
   * Search for nearby dermatology hospitals by user coordinates.
   * Used for HIGH and UNCERTAIN risk results.
   */
  async getNearbyHospitals(
    latitude: number,
    longitude: number,
    radiusKm: number = 10.0
  ): Promise<HospitalResult[]> {
    try {
      const response = await apiClient.get(
        `/hospitals/nearby?latitude=${latitude}&longitude=${longitude}&radius_km=${radiusKm}`
      );
      if (Array.isArray(response)) {
        return response;
      }
      return response?.data ?? [];
    } catch (e) {
      console.error('Failed to fetch nearby hospitals:', e);
      return [];
    }
  },

  /**
   * Text search for dermatology hospitals by location name or keyword.
   * Used when GPS/location permission is denied.
   */
  async searchHospitals(
    query: string,
    latitude?: number,
    longitude?: number
  ): Promise<HospitalResult[]> {
    try {
      let url = `/hospitals/search?query=${encodeURIComponent(query)}`;
      if (latitude !== undefined && longitude !== undefined) {
        url += `&latitude=${latitude}&longitude=${longitude}`;
      }
      const response = await apiClient.get(url);
      if (Array.isArray(response)) {
        return response;
      }
      return response?.data ?? [];
    } catch (e) {
      console.error('Failed to search hospitals:', e);
      return [];
    }
  },

  /**
   * Open Google Maps directions to a hospital in the browser.
   */
  openDirections(hospital: HospitalResult): void {
    if (hospital.maps_url) {
      window.open(hospital.maps_url, '_blank', 'noopener,noreferrer');
    } else {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  },
};
