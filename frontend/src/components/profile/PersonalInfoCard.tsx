import React from 'react';
import { User, Mail, Calendar, Globe, Shield, Edit2 } from 'lucide-react';
import { Card } from '../common/Card';
import { formatDate } from '../../utils/formatters';

interface PersonalInfoCardProps {
  user: any;
  onEditClick: () => void;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ user, onEditClick }) => {
  const profile = user?.profile || {};

  const fields = [
    { label: 'Full Name', value: user?.fullName || 'Not provided', icon: User },
    { label: 'Email Address', value: user?.email || 'Not provided', icon: Mail },
    { label: 'Age', value: profile.age ? `${profile.age} years` : 'Not provided', icon: Calendar },
    { label: 'Preferred Language', value: profile.preferredLanguage === 'ta' ? 'Tamil (தமிழ்)' : profile.preferredLanguage === 'hi' ? 'Hindi (हिन्दी)' : 'English (US)', icon: Globe },
    { label: 'Account Status', value: profile.accountStatus || 'Active & Verified', icon: Shield },
    { label: 'Registered Date', value: user?.createdAt ? formatDate(user.createdAt) : 'Not available', icon: Calendar },
  ];

  return (
    <Card variant="glass" className="p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-brand-500" />
          Personal Information
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
        {fields.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="p-3 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                {f.label}
              </span>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{f.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
