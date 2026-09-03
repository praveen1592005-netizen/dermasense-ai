import React, { useState, useEffect } from 'react';
import {
  Shield,
  Download,
  Trash2,
  RefreshCw,
  Info,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { privacyService } from '../../services/privacyService';
import { useNotification } from '../../context/NotificationContext';
import { PrivacyPreferences } from '../../types/settings';

interface PrivacySettingsProps {
  onDeleteAccountClick: () => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ onDeleteAccountClick }) => {
  const { showSuccess, showInfo } = useNotification();
  const [privacy, setPrivacy] = useState<PrivacyPreferences | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      const p = await privacyService.getPreferences();
      setPrivacy(p);
    };
    fetchPrefs();
  }, []);

  const handleToggle = async (key: keyof PrivacyPreferences) => {
    if (!privacy) return;
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    await privacyService.updatePreferences(updated);
    showSuccess('Privacy Preference Updated', 'Your data choices have been recorded.');
  };

  const handleExportData = () => {
    privacyService.exportUserData();
    showSuccess('Data Export Generated', 'Your profile and settings archive has been downloaded.');
  };

  const handleClearLocal = () => {
    privacyService.clearLocalPreferences();
    showInfo('Preferences Reset', 'Local device cache cleared.');
  };

  if (!privacy) return null;

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          Privacy & Data Controls
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage how your skin intake submissions and analytics are utilized.
        </p>
      </div>

      {/* Data Preferences */}
      <div className="space-y-3">
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
          Personalization & Analytics
        </h4>

        <div className="space-y-2">
          {[
            {
              key: 'personalizedExperience' as const,
              title: 'Personalized AI Guidance',
              desc: 'Use your completed skin characteristics to tailor skincare routine suggestions.',
            },
            {
              key: 'recommendationPersonalization' as const,
              title: 'Product Recommendation Personalization',
              desc: 'Filter skincare ingredients based on your stated allergies and sensitivity level.',
            },
            {
              key: 'usageAnalytics' as const,
              title: 'Anonymous Usage Analytics',
              desc: 'Allow aggregated, non-identifiable usage statistics to improve application stability.',
            },
            {
              key: 'storeAnalysisHistory' as const,
              title: 'Retain Intake Draft History',
              desc: 'Keep analysis submissions in your local history for doctor review and reporting.',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800"
            >
              <div className="min-w-0 pr-4">
                <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h5>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.desc}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={privacy[item.key]}
                  onChange={() => handleToggle(item.key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Data Controls & Export */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
          Data Portability & Management
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">
                Download Account Archive
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Export a machine-readable JSON copy of your profile, settings, and intake records.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export JSON Archive
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">
                Clear Local Preferences
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Reset stored theme, language, and notification cache on this browser.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearLocal}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Reset Browser Cache
            </Button>
          </div>
        </div>
      </div>

      {/* Clear Privacy Information Notice (Section 16) */}
      <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>How DermaSense AI Uses Your Information</span>
        </div>
        <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90">
          Your photos and questionnaire inputs are used exclusively for personal skincare guidance and clinical preparation. We never sell your personal data or photographic records to third-party advertising networks.
        </p>
      </div>
    </Card>
  );
};
