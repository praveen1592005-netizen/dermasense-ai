import React from 'react';
import { User, ShieldCheck, Edit3, KeyRound, Calendar, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProfileAvatar } from './ProfileAvatar';
import { formatDate } from '../../utils/formatters';

interface ProfileHeaderProps {
  user: any;
  onEditClick: () => void;
  onChangePasswordClick: () => void;
  onAvatarChange: (newUrl: string | null) => Promise<void>;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditClick,
  onChangePasswordClick,
  onAvatarChange,
}) => {
  const profile = user?.profile || {};
  const creationDate = user?.createdAt ? formatDate(user.createdAt) : 'August 2026';

  return (
    <Card
      variant="glass"
      className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Avatar & Identity Summary */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <ProfileAvatar
            avatarUrl={profile.avatarUrl}
            userName={user?.fullName}
            onAvatarChange={onAvatarChange}
            size="lg"
          />

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {user?.fullName || 'User Profile'}
              </h2>
              <Badge variant="success" size="sm" dot>
                {profile.accountStatus || 'Active'}
              </Badge>
              <Badge variant="brand" size="sm">
                Free Starter Tier
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
              {user?.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Member since {creationDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-tealBrand-500" />
                Auth: <strong className="capitalize text-slate-700 dark:text-slate-300">{user?.authProvider || 'Email'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start lg:justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          <Button
            variant="primary"
            size="md"
            onClick={onEditClick}
            leftIcon={<Edit3 className="w-4 h-4" />}
          >
            Edit Profile
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={onChangePasswordClick}
            leftIcon={<KeyRound className="w-4 h-4" />}
          >
            Change Password
          </Button>
        </div>
      </div>
    </Card>
  );
};
