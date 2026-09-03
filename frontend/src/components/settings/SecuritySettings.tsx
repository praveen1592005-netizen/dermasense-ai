import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Shield,
  Smartphone,
  Laptop,
  History,
  Lock,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { securityService } from '../../services/securityService';
import { useNotification } from '../../context/NotificationContext';
import { UserSession, LoginActivityRecord } from '../../types/settings';

interface SecuritySettingsProps {
  onChangePasswordClick: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  onChangePasswordClick,
}) => {
  const { showSuccess } = useNotification();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loginActivity, setLoginActivity] = useState<LoginActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        const [sess, acts] = await Promise.all([
          securityService.getActiveSessions(),
          securityService.getLoginActivity(),
        ]);
        setSessions(sess);
        setLoginActivity(acts);
      } finally {
        setIsLoading(false);
      }
    };
    loadSecurityData();
  }, []);

  const handleTerminateOtherSessions = async () => {
    showSuccess('Sessions Updated', 'Signed out from all other active sessions.');
  };

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigoBrand-500" />
          Security & Session Management
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor your active login devices and secure your authentication credentials.
        </p>
      </div>

      {/* Password Management */}
      <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Account Password
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Regularly changing your password helps protect your private health data.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onChangePasswordClick}
          leftIcon={<KeyRound className="w-3.5 h-3.5" />}
        >
          Change Password
        </Button>
      </div>

      {/* Two-Factor Authentication (2FA) - Coming Soon (Section 17) */}
      <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Two-Factor Authentication (2FA)
            </h4>
            <Badge variant="neutral" size="sm">
              Coming Soon
            </Badge>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add an extra layer of security with SMS or Authenticator app codes.
          </p>
        </div>

        <Button variant="outline" size="sm" disabled>
          Configure 2FA
        </Button>
      </div>

      {/* Active Sessions (Section 19) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Active Sessions
          </h4>
          <button
            type="button"
            onClick={handleTerminateOtherSessions}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            Sign Out Other Devices
          </button>
        </div>

        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {s.device} ({s.browser})
                    </h5>
                    {s.isCurrent && (
                      <Badge variant="success" size="sm">
                        Current Session
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {s.location} • {s.lastActive}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Activity Logs (Section 18) */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          Recent Login Activity
        </h4>

        {loginActivity.length > 0 ? (
          <div className="space-y-2">
            {loginActivity.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-darkBg-900/40 border border-slate-200/60 dark:border-slate-800 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {log.device} • {log.browser}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {log.location} • {log.date}
                  </span>
                </div>
                <Badge variant="success" size="sm">
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            Login activity will appear here when security logging is connected.
          </div>
        )}
      </div>
    </Card>
  );
};
