import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Building, AlertTriangle, ExternalLink, Navigation } from 'lucide-react';
import { HospitalResult } from '../../types/disease';
import { hospitalService } from '../../services/hospitalService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const HospitalRecommendationSection: React.FC = () => {
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    fetchNearbyHospitals();
  }, []);

  const fetchNearbyHospitals = async () => {
    setLoading(true);
    setLocationError(false);

    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const results = await hospitalService.getNearbyHospitals(latitude, longitude, 15);
            setHospitals(results);
            setLoading(false);
          },
          (error) => {
            console.warn('Geolocation error:', error);
            setLocationError(true);
            setLoading(false);
          },
          { timeout: 10000 }
        );
      } else {
        setLocationError(true);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLocationError(true);
      setLoading(false);
    }
  };

  const openInMaps = (hospital: HospitalResult) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="mt-8 overflow-hidden border-rose-200 dark:border-rose-900/50">
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
              Your screening result indicates a potentially serious condition. We strongly advise visiting a specialized dermatology hospital for a proper clinical diagnosis.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-500" />
            Nearby Dermatology Hospitals
          </h4>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchNearbyHospitals}
            isLoading={loading}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Refresh Location
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : locationError ? (
          <div className="text-center p-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-darkBg-900">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">Location Access Required</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">
              Please enable location services or enter your city manually to find recommended hospitals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
              <Button onClick={fetchNearbyHospitals} variant="outline" className="w-full sm:w-auto">
                Retry GPS
              </Button>
              <div className="flex w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Enter city..." 
                  className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-l-xl dark:bg-darkBg-800 dark:text-white flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value;
                      if (val) {
                        setLoading(true);
                        hospitalService.searchHospitals(val).then(res => {
                          setHospitals(res);
                          setLocationError(false);
                          setLoading(false);
                        }).catch(() => {
                          setLoading(false);
                        });
                      }
                    }
                  }}
                />
                <Button 
                  variant="primary" 
                  className="rounded-l-none"
                  onClick={(e) => {
                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                    const val = input?.value;
                    if (val) {
                      setLoading(true);
                      hospitalService.searchHospitals(val).then(res => {
                        setHospitals(res);
                        setLocationError(false);
                        setLoading(false);
                      }).catch(() => {
                        setLoading(false);
                      });
                    }
                  }}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center p-6 text-slate-500">
            No nearby hospitals found. Please search for a dermatologist in your area.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {hospitals.map((hospital) => (
              <div 
                key={hospital.id} 
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/30 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex flex-shrink-0 items-center justify-center text-brand-600 dark:text-brand-400">
                  <Building className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-slate-900 dark:text-white truncate text-base">
                    {hospital.name}
                  </h5>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {hospital.address}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs">
                    <div className="flex items-center text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-md">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {hospital.distance_km} km away
                    </div>
                    
                    {hospital.phone && (
                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 mr-1" />
                        {hospital.phone}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex sm:flex-col gap-2 sm:self-center mt-2 sm:mt-0">
                  <Button 
                    variant="primary"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => openInMaps(hospital)}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate
                  </Button>
                  
                  {hospital.phone && (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none sm:hidden"
                      onClick={() => window.open(`tel:${hospital.phone}`)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
