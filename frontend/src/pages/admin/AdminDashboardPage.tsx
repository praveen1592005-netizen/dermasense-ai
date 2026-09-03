import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Users,
  FileText,
  UserCheck,
  Settings,
  AlertTriangle,
  Server,
  Flag,
  Lock,
  Clock,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { adminAnalyticsService, AdminStats } from '../../services/adminAnalyticsService';
import { auditLoggerService, SecurityAuditEvent } from '../../services/auditLoggerService';
import { featureFlagsService, FeatureFlags } from '../../config/featureFlags';
import { AdminStatsCards } from '../../components/admin/AdminStatsCards';
import { SystemHealthMonitor } from '../../components/admin/SystemHealthMonitor';
import { FeatureFlagManager } from '../../components/admin/FeatureFlagManager';
import { useNotification } from '../../context/NotificationContext';

type AdminTab = 'overview' | 'system' | 'flags' | 'audit';

const TAB_DEFS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'system', label: 'System Health', icon: Server },
  { id: 'flags', label: 'Feature Flags', icon: Flag },
  { id: 'audit', label: 'Audit Log', icon: Lock },
];

const EVENT_TYPE_CONFIG: Record<string, { variant: 'success' | 'brand' | 'warning' | 'danger' | 'neutral'; label: string }> = {
  AUTH_SIGNIN: { variant: 'success', label: 'Sign In' },
  AUTH_SIGNOUT: { variant: 'neutral', label: 'Sign Out' },
  AUTH_PASSWORD_RESET: { variant: 'warning', label: 'Password Reset' },
  PROFILE_UPDATE: { variant: 'brand', label: 'Profile Update' },
  REPORT_SHARED: { variant: 'brand', label: 'Report Shared' },
  REPORT_REVOKED: { variant: 'warning', label: 'Access Revoked' },
  APPOINTMENT_BOOKED: { variant: 'success', label: 'Appointment Booked' },
  APPOINTMENT_CANCELLED: { variant: 'danger', label: 'Appointment Cancelled' },
  PAYMENT_SUCCESS: { variant: 'success', label: 'Payment Success' },
  MEMBERSHIP_UPGRADE: { variant: 'success', label: 'Membership Upgraded' },
};

export const AdminDashboardPage: React.FC = () => {
  const { showSuccess } = useNotification();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditEvent[]>([]);
  const [flags, setFlags] = useState<FeatureFlags>(featureFlagsService.getFlags());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [s, logs] = await Promise.all([
          adminAnalyticsService.getStats(),
          Promise.resolve(auditLoggerService.getAuditLogs()),
        ]);
        setStats(s);
        setAuditLogs(logs);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleFlagChange = (key: keyof FeatureFlags, value: boolean) => {
    featureFlagsService.setFlag(key, value);
    setFlags(featureFlagsService.getFlags());
    showSuccess(
      'Feature Flag Updated',
      `${key} has been ${value ? 'enabled' : 'disabled'}.`
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn pb-16">
      <PageHeader
        title="Admin Control Center"
        subtitle="System monitoring, feature management, and security audit logs. Authorized administrators only."
        actions={
          <Badge variant="danger" size="sm">
            Admin Access
          </Badge>
        }
      />

      {/* Admin Role Security Notice */}
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Protected Administrator Area.</strong> This dashboard is restricted to authorized DermaSense AI administrators.
          Backend authorization enforces role-based access. Unauthorized access attempts are logged and audited.
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        {TAB_DEFS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          <AdminStatsCards stats={stats} isLoading={isLoading} />

          {/* Membership Breakdown */}
          {stats && (
            <Card variant="default" className="p-6 rounded-3xl border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Membership Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Free Plan', count: stats.membership.free, total: stats.users.total, color: 'bg-slate-300' },
                  { label: 'Premium (₹499/mo)', count: stats.membership.premium, total: stats.users.total, color: 'bg-brand-500' },
                  { label: 'Professional (₹1,499/mo)', count: stats.membership.professional, total: stats.users.total, color: 'bg-tealBrand-500' },
                ].map((tier) => (
                  <div key={tier.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{tier.label}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{tier.count.toLocaleString()} users ({Math.round((tier.count / tier.total) * 100)}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-darkBg-800">
                      <div
                        className={`h-2 rounded-full ${tier.color} transition-all duration-500`}
                        style={{ width: `${Math.round((tier.count / tier.total) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SYSTEM HEALTH TAB */}
      {activeTab === 'system' && (
        <div className="animate-fadeIn">
          <SystemHealthMonitor />
        </div>
      )}

      {/* FEATURE FLAGS TAB */}
      {activeTab === 'flags' && (
        <div className="animate-fadeIn space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Feature flags control production capabilities. Changes take immediate effect. High-impact flags marked with caution warnings.</span>
          </div>
          <FeatureFlagManager flags={flags} onFlagChange={handleFlagChange} />
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-3 animate-fadeIn">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Security events are logged without sensitive medical data, passwords, or personal tokens.
          </p>
          {auditLogs.map((log) => {
            const cfg = EVENT_TYPE_CONFIG[log.eventType] || { variant: 'neutral' as const, label: log.eventType };
            return (
              <div
                key={log.id}
                className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                    <span className="text-slate-500 font-mono">{log.userEmailMasked}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{log.details}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()} • IP: {log.ipAddressMasked}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
