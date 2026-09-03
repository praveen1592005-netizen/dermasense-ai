import React from 'react';
import { Phone, MapPin, Building, Flag, MailCheck, Edit2 } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ContactInfoCardProps {
  user: any;
  onEditClick: () => void;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ user, onEditClick }) => {
  const profile = user?.profile || {};
  const addr = profile.addressStructured || {};
  const phone = profile.phone || 'Not provided';
  const country = addr.country || 'India';

  const fullAddress = [
    addr.streetAddress,
    addr.city,
    addr.state ? `${addr.state} - ${addr.postalCode || ''}` : addr.postalCode,
    country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card variant="glass" className="p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Phone className="w-4 h-4 text-tealBrand-500" />
          Contact & Location Details
        </h3>
        <button
          type="button"
          onClick={onEditClick}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          <Edit2 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone Number */}
        <div className="p-3 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            Mobile Number
          </span>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {phone}
            </span>
            {phone !== 'Not provided' && (
              <Badge variant="teal" size="sm">
                Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Country */}
        <div className="p-3 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            Country / Region
          </span>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            <Flag className="w-3.5 h-3.5 text-slate-400" />
            <span>{country}</span>
          </div>
        </div>
      </div>

      {/* Structured Address */}
      <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
          Structured Address
        </span>
        <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>{fullAddress || profile.address || 'Not provided'}</span>
        </div>
      </div>
    </Card>
  );
};
