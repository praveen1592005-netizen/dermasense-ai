import React from 'react';
import { ShieldCheck, Mail, Calendar, Key, AlertTriangle, Trash2, Smartphone } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

interface AccountInfoCardProps {
  user: any;
  onChangeEmailClick: () => void;
  onDeleteAccountClick: () => void;
}

export const AccountInfoCard: React.FC<AccountInfoCardProps> = ({
  user,
  onChangeEmailClick,
  onDeleteAccountClick,
}) => {
  const profile = user?.profile || {};
  const creationDate = user?.createdAt ? formatDate(user.createdAt) : 'August 2026';

  return (
    <Card variant="glass" className="p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-500" />
          Account & Authentication Security
        </h3>
        <Badge variant="success" size="sm">
          {profile.accountStatus || 'Active Account'}
        </Badge>
      </div>

      <div className="space-y-3 text-xs sm:text-sm">
        {/* Email & Change Email */}
        <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[11px] text-slate-400 block mb-0.5">Registered Email</span>
            <span className="font-bold text-slate-900 dark:text-white truncate block">
              {user?.email}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onChangeEmailClick}>
            Change Email
          </Button>
        </div>

        {/* Auth Provider & Last Sign-In */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Auth Provider</span>
            <span className="font-bold text-slate-900 dark:text-white capitalize">
              {user?.authProvider || 'Standard Email'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Account Created</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {creationDate}
            </span>
          </div>
        </div>

        {/* Danger Zone: Delete Account */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
              Delete Account
            </span>
            <span className="text-[11px] text-slate-400">
              Permanently remove profile data and local records
            </span>
          </div>
          <Button variant="danger" size="sm" onClick={onDeleteAccountClick} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
            Delete Account
          </Button>
        </div>
      </div>
    </Card>
  );
};
