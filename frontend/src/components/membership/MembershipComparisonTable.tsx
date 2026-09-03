import React from 'react';
import { Check, X, Sparkles, Layers } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const MembershipComparisonTable: React.FC = () => {
  const comparisonRows = [
    {
      feature: 'Skincare Analyses',
      free: '5 / month',
      premium: '25 / month',
      professional: 'Unlimited',
    },
    {
      feature: 'Smart Reports & Protocols',
      free: 'Standard Summary',
      premium: 'Detailed AM/PM Protocol',
      professional: 'Clinical Triage Export',
    },
    {
      feature: 'Printable A4 PDF Reports',
      free: false,
      premium: true,
      professional: true,
    },
    {
      feature: 'Multi-Store Price Alerts',
      free: 'Standard Browsing',
      premium: 'Live Price Comparison',
      professional: 'Priority Multi-Store Alerts',
    },
    {
      feature: 'Product & Ingredient Comparison',
      free: 'Up to 2 products',
      premium: 'Up to 4 products + Overlap Matrix',
      professional: 'Full Active Compatibility Matrix',
    },
    {
      feature: 'Skin Progress Tracking',
      free: 'Basic (5 photos)',
      premium: 'Unlimited + Split Slider',
      professional: 'Unlimited + Trend Analytics',
    },
    {
      feature: 'Doctor Consultation Discount',
      free: 'None',
      premium: '10% Discount',
      professional: '20% Discount + Priority Slots',
    },
    {
      feature: 'Support Channel',
      free: 'Standard Community',
      premium: 'Priority Email',
      professional: '24/7 Dedicated Priority Support',
    },
  ];

  const renderCell = (val: string | boolean) => {
    if (typeof val === 'boolean') {
      return val ? (
        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
      ) : (
        <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
      );
    }
    return <span className="font-medium text-slate-800 dark:text-slate-200">{val}</span>;
  };

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-500" />
          Detailed Plan Feature Comparison
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review feature entitlements across Free, Premium, and Professional tiers.
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-darkBg-850 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-darkBg-900/60 text-slate-500">
              <th className="p-4 w-1/3 font-bold uppercase text-[10px]">Feature Capability</th>
              <th className="p-4 text-center font-bold text-slate-900 dark:text-white">Free</th>
              <th className="p-4 text-center font-bold text-brand-600 dark:text-brand-400 bg-brand-500/5">
                Premium
              </th>
              <th className="p-4 text-center font-bold text-tealBrand-600 dark:text-tealBrand-400">
                Professional
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {comparisonRows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-darkBg-800/40">
                <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                  {row.feature}
                </td>
                <td className="p-4 text-center">{renderCell(row.free)}</td>
                <td className="p-4 text-center bg-brand-500/5">{renderCell(row.premium)}</td>
                <td className="p-4 text-center">{renderCell(row.professional)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked View */}
      <div className="md:hidden space-y-4">
        {comparisonRows.map((row, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs"
          >
            <h5 className="font-bold text-slate-900 dark:text-white text-xs">{row.feature}</h5>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Free:</span>
                <span className="font-semibold">{typeof row.free === 'boolean' ? (row.free ? 'Yes' : 'No') : row.free}</span>
              </div>
              <div className="text-brand-600 dark:text-brand-400">
                <span className="text-slate-400 block text-[10px]">Premium:</span>
                <span className="font-semibold">{typeof row.premium === 'boolean' ? (row.premium ? 'Yes' : 'No') : row.premium}</span>
              </div>
              <div className="text-tealBrand-600 dark:text-tealBrand-400">
                <span className="text-slate-400 block text-[10px]">Pro:</span>
                <span className="font-semibold">{typeof row.professional === 'boolean' ? (row.professional ? 'Yes' : 'No') : row.professional}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
