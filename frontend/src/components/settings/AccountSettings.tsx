import React from 'react';
import { User, Mail, Calendar, Shield, Trash2, KeyRound } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

interface AccountSettingsProps {
  user: any;
  onChangeEmailClick: () => void;
  onDeleteAccountClick: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  user,
  onChangeEmailClick,
  onDeleteAccountClick,
}) => {
  const profile = user?.profile || {};
  const creationDate = user?.createdAt ? formatDate(user.createdAt) : 'August 2026';

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-brand-500" />
          Account Details & Credentials
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your core account identity, registered email, and subscription tier.
        </p>
      </div>

      <div className="space-y-4">
        {/* Email Row */}
        <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
              Primary Account Email
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {user?.email}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onChangeEmailClick}>
            Change Email
          </Button>
        </div>

        {/* Account Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Account ID</span>
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
              {user?.id || 'usr_8829'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Registration Date</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {creationDate}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Account Tier</span>
            <div className="flex items-center gap-1.5">
              <Badge variant="brand" size="sm">
                Free Starter
              </Badge>
            </div>
          </div>
        </div>

        {/* Delete Account Section (Section 20) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
              Permanently Delete Account
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Permanently erase all personal data, intake entries, and account credentials.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={onDeleteAccountClick}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </Card>
  );
};
