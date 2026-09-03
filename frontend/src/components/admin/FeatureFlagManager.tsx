import React from 'react';
import { FeatureFlags, featureFlagsService } from '../../config/featureFlags';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ShieldAlert } from 'lucide-react';

interface FlagRow {
  key: keyof FeatureFlags;
  label: string;
  description: string;
  dangerous?: boolean;
}

const FLAG_DEFINITIONS: FlagRow[] = [
  { key: 'ENABLE_SKINCARE_AI', label: 'Skincare AI Engine', description: 'AI-powered skin type analysis, barrier assessment, and routine recommendations.' },
  { key: 'ENABLE_DISEASE_AI', label: 'Skin Disease Screening', description: 'Category-based disease pattern recognition, red-flag triage, and safety assessment.' },
  { key: 'ENABLE_TELEHEALTH_VIDEO', label: 'Telehealth Video Suite', description: 'Encrypted WebRTC consultation rooms, in-call chat, and report inspection.' },
  { key: 'ENABLE_MULTI_STORE', label: 'Multi-Store Price Engine', description: 'Live INR pricing comparison across Amazon, Nykaa, Tira, Myntra, and Flipkart.' },
  { key: 'ENABLE_PROMO_COUPONS', label: 'Promo Coupon Engine', description: 'Discount voucher validation and application during membership and appointment checkout.' },
  { key: 'ENABLE_MAINTENANCE_MODE', label: 'Maintenance Mode', description: 'Blocks public access and displays planned downtime notice.', dangerous: true },
  { key: 'ENABLE_ADMIN_DASHBOARD', label: 'Admin Dashboard Access', description: 'Grants admin dashboard access for internal monitoring.', dangerous: true },
];

interface FeatureFlagManagerProps {
  flags: FeatureFlags;
  onFlagChange: (key: keyof FeatureFlags, value: boolean) => void;
}

export const FeatureFlagManager: React.FC<FeatureFlagManagerProps> = ({ flags, onFlagChange }) => {
  return (
    <div className="space-y-3">
      {FLAG_DEFINITIONS.map((def) => (
        <div
          key={def.key}
          className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
            def.dangerous
              ? 'border-rose-200/70 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20'
              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-darkBg-850'
          }`}
        >
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{def.label}</span>
              {def.dangerous && (
                <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                  <ShieldAlert className="w-3 h-3" />
                  High Impact
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{def.description}</p>
            <code className="text-[10px] text-slate-400 font-mono">{def.key}</code>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Badge variant={flags[def.key] ? 'success' : 'neutral'} size="sm">
              {flags[def.key] ? 'Enabled' : 'Disabled'}
            </Badge>
            <button
              type="button"
              onClick={() => onFlagChange(def.key, !flags[def.key])}
              className={`relative w-10 h-5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                flags[def.key] ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                  flags[def.key] ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
