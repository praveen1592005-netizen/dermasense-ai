import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Phone,
  Building,
  AlertTriangle,
  Navigation,
  RefreshCw,
  WifiOff,
  ShieldOff,
  AlertCircle,
  Search,
} from 'lucide-react';
import { HospitalResult } from '../../types/disease';
import {
  hospitalService,
  HospitalServiceError,
  type HospitalError,
} from '../../services/hospitalService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

// ─────────────────────────────────────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────────────────────────────────────
type SearchState =
  | { kind: 'idle' }
  | { kind: 'locating' }
  | { kind: 'searching'; latitude: number; longitude: number }
  | { kind: 'results'; hospitals: HospitalResult[]; latitude: number; longitude: number }
  | { kind: 'empty'; latitude: number; longitude: number }
  | { kind: 'error'; errorType: HospitalError; message: string };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function errorIcon(type: HospitalError) {
  if (type === 'location_denied' || type === 'unsupported') return <ShieldOff className="w-8 h-8 text-amber-400 mx-auto mb-3" />;
  if (type === 'backend_unavailable') return <WifiOff className="w-8 h-8 text-slate-400 mx-auto mb-3" />;
  return <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />;
}

function errorHeading(type: HospitalError): string {
  switch (type) {
    case 'location_denied':   return 'Location Access Denied';
    case 'location_unavailable': return 'Location Unavailable';
    case 'location_timeout':  return 'Location Request Timed Out';
    case 'unsupported':       return 'Geolocation Not Supported';
    case 'backend_unavailable': return 'Search Service Offline';
    case 'not_configured':    return 'Search Not Configured';
    default:                  return 'Search Failed';
  }
}

function errorDetail(type: HospitalError, message: string): string {
  switch (type) {
    case 'location_denied':
      return 'Location permission was denied. Enable it in your browser settings, or search by city name below.';
    case 'location_unavailable':
      return 'Your device could not determine your location. Try again, or search by city name.';
    case 'location_timeout':
      return 'Location request timed out. Move to an area with better signal, or search by city name.';
    case 'unsupported':
      return 'Your browser does not support GPS location. Please search by city name.';
    case 'backend_unavailable':
      return 'The DermaSense backend server is not running. Start it with start-backend.bat, or search by city name using the form below.';
    case 'not_configured':
      return 'Hospital search is not configured on the server (missing API key). Search by city name is also unavailable.';
    default:
      return message || 'An unexpected error occurred. Please try again.';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export const HospitalRecommendationSection: React.FC = () => {
  const [state, setState] = useState<SearchState>({ kind: 'idle' });
  const [cityInput, setCityInput] = useState('');
  const isLoadingRef = useRef(false); // prevents duplicate requests

  // Auto-start on mount
  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    if (isLoadingRef.current) return; // prevent duplicate
    isLoadingRef.current = true;

    try {
      // Stage 1: get location
      setState({ kind: 'locating' });
      const { latitude, longitude } = await hospitalService.getCoordinates();

      // Stage 2: search hospitals
      setState({ kind: 'searching', latitude, longitude });
      const results = await hospitalService.getNearbyHospitals(latitude, longitude, 15);

      if (results.length === 0) {
        setState({ kind: 'empty', latitude, longitude });
      } else {
        setState({ kind: 'results', hospitals: results, latitude, longitude });
      }
    } catch (err) {
      if (err instanceof HospitalServiceError) {
        setState({ kind: 'error', errorType: err.type, message: err.message });
      } else {
        setState({
          kind: 'error',
          errorType: 'api_error',
          message: err instanceof Error ? err.message : 'An unexpected error occurred.',
        });
      }
    } finally {
      isLoadingRef.current = false;
    }
  };

  const handleCitySearch = async () => {
    const city = cityInput.trim();
    if (!city || isLoadingRef.current) return;
    isLoadingRef.current = true;

    const lat = state.kind === 'results' || state.kind === 'empty' || state.kind === 'searching'
      ? (state as any).latitude
      : undefined;
    const lng = state.kind === 'results' || state.kind === 'empty' || state.kind === 'searching'
      ? (state as any).longitude
      : undefined;

    setState({ kind: 'searching', latitude: lat ?? 0, longitude: lng ?? 0 });
    try {
      const results = await hospitalService.searchHospitals(city, lat, lng);
      if (results.length === 0) {
        setState({ kind: 'empty', latitude: lat ?? 0, longitude: lng ?? 0 });
      } else {
        setState({ kind: 'results', hospitals: results, latitude: lat ?? 0, longitude: lng ?? 0 });
      }
    } catch (err) {
      if (err instanceof HospitalServiceError) {
        setState({ kind: 'error', errorType: err.type, message: err.message });
      } else {
        setState({
          kind: 'error',
          errorType: 'api_error',
          message: err instanceof Error ? err.message : 'Search failed.',
        });
      }
    } finally {
      isLoadingRef.current = false;
    }
  };

  const openInMaps = (hospital: HospitalResult) => {
    hospitalService.openDirections(hospital);
  };

  const isLoading = state.kind === 'locating' || state.kind === 'searching';
  const loadingLabel = state.kind === 'locating' ? 'Getting your location...' : 'Finding nearby providers...';

  // City search form — shown in error/empty states
  const CitySearchForm = (
    <div className="flex w-full gap-0 mt-3 max-w-sm mx-auto sm:mx-0">
      <input
        type="text"
        placeholder="Enter city name..."
        value={cityInput}
        onChange={(e) => setCityInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCitySearch(); }}
        className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-l-xl dark:bg-darkBg-800 dark:text-white flex-1 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      />
      <Button
        variant="primary"
        size="sm"
        className="rounded-l-none"
        onClick={handleCitySearch}
        isLoading={isLoading}
        leftIcon={<Search className="w-3.5 h-3.5" />}
      >
        Search
      </Button>
    </div>
  );

  return (
    <Card className="mt-8 overflow-hidden border-rose-200 dark:border-rose-900/50">
      {/* Header */}
      <div className="bg-rose-50 dark:bg-rose-950/20 p-5 sm:p-6 border-b border-rose-100 dark:border-rose-900/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Professional Evaluation Recommended
              <Badge variant="danger" size="sm">High Risk</Badge>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Your screening result indicates a potentially serious condition. We strongly advise visiting a
              specialized dermatology hospital for a proper clinical diagnosis.
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6">
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-500" />
            Nearby Dermatology Hospitals
          </h4>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            disabled={isLoading}
          >
            {isLoading ? loadingLabel : 'Refresh Location'}
          </Button>
        </div>

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {isLoading && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center animate-pulse">{loadingLabel}</p>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse flex gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl"
              >
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {!isLoading && state.kind === 'error' && (
          <div className="text-center p-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-darkBg-900">
            {errorIcon(state.errorType)}
            <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
              {errorHeading(state.errorType)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {errorDetail(state.errorType, state.message)}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
              {state.errorType !== 'not_configured' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Retry GPS
                </Button>
              )}
              {/* Open Google Maps as fallback always */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open('https://maps.google.com/?q=dermatology+hospital+near+me', '_blank')
                }
                leftIcon={<MapPin className="w-3.5 h-3.5" />}
              >
                Search on Google Maps
              </Button>
            </div>

            {/* City search — available for all errors except not_configured (server-side key issue) */}
            {state.errorType !== 'not_configured' && (
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-1">Or search by city name:</p>
                {CitySearchForm}
              </div>
            )}
          </div>
        )}

        {/* ── Idle (should not normally be visible) ───────────────────────── */}
        {!isLoading && state.kind === 'idle' && (
          <div className="text-center p-6 text-slate-400 text-sm">
            <MapPin className="w-6 h-6 mx-auto mb-2 opacity-40" />
            Click "Refresh Location" to find nearby dermatology hospitals.
          </div>
        )}

        {/* ── Empty result (real 0 results from API) ───────────────────────── */}
        {!isLoading && state.kind === 'empty' && (
          <div className="text-center p-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-darkBg-900">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">
              No dermatology providers found within 15 km
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Try increasing the search area or search by city name.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open('https://maps.google.com/?q=dermatology+hospital+near+me', '_blank')
                }
                leftIcon={<MapPin className="w-3.5 h-3.5" />}
              >
                Search on Google Maps
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-400 mb-1">Or search by city name:</p>
              {CitySearchForm}
            </div>
          </div>
        )}

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {!isLoading && state.kind === 'results' && (
          <div className="grid gap-4">
            {state.hospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/30 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex flex-shrink-0 items-center justify-center text-brand-600 dark:text-brand-400">
                  <Building className="w-6 h-6" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-slate-900 dark:text-white truncate text-base">
                    {hospital.name}
                  </h5>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {hospital.address}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs">
                    {hospital.distance_km !== null && hospital.distance_km !== undefined && (
                      <div className="flex items-center text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {hospital.distance_km} km away
                      </div>
                    )}

                    {hospital.opening_hours && (
                      <div className="flex items-center text-slate-500 dark:text-slate-400">
                        🕐 {hospital.opening_hours}
                      </div>
                    )}

                    {hospital.phone && (
                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 mr-1" />
                        {hospital.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 sm:self-center mt-2 sm:mt-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => openInMaps(hospital)}
                    leftIcon={<Navigation className="w-4 h-4" />}
                  >
                    Navigate
                  </Button>

                  {hospital.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => window.open('tel:' + hospital.phone)}
                      leftIcon={<Phone className="w-4 h-4" />}
                    >
                      Call
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Search by city for expanding results */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 mb-1.5">Search different city:</p>
              {CitySearchForm}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
