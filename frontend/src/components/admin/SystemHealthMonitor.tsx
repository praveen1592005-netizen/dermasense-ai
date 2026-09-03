import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Shield,
  Server,
  Cpu,
  Database,
  Video,
  ShoppingBag,
  UserCheck,
  CreditCard,
} from 'lucide-react';
import { systemHealthService, SubsystemHealth, ServiceStatus } from '../../services/systemHealthService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

const STATUS_CONFIG: Record<ServiceStatus, { icon: React.ElementType; color: string; badgeVariant: 'success' | 'warning' | 'danger'; label: string }> = {
  operational: { icon: CheckCircle2, color: 'text-emerald-500', badgeVariant: 'success', label: 'Operational' },
  degraded: { icon: AlertTriangle, color: 'text-amber-500', badgeVariant: 'warning', label: 'Degraded' },
  offline: { icon: XCircle, color: 'text-rose-500', badgeVariant: 'danger', label: 'Offline' },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  core: Shield,
  ai: Cpu,
  commerce: ShoppingBag,
  telehealth: Video,
  infrastructure: Database,
};

const ServiceCard: React.FC<{ service: SubsystemHealth }> = ({ service }) => {
  const cfg = STATUS_CONFIG[service.status];
  const Icon = cfg.icon;
  const CategoryIcon = CATEGORY_ICONS[service.category] || Server;

  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 hover:shadow-sm transition-all">
      <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-darkBg-800 flex-shrink-0 ${cfg.color}`}>
        <CategoryIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{service.name}</h4>
          <Badge variant={cfg.badgeVariant} size="sm">{cfg.label}</Badge>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{service.message}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {service.latencyMs}ms latency
          </span>
          <span>Last checked: {new Date(service.lastChecked).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export const SystemHealthMonitor: React.FC = () => {
  const [report, setReport] = useState<Awaited<ReturnType<typeof systemHealthService.checkSystemHealth>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runCheck = async () => {
    setIsLoading(true);
    try {
      const result = await systemHealthService.checkSystemHealth();
      setReport(result);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { runCheck(); }, []);

  const overallCfg = report ? STATUS_CONFIG[report.overallStatus] : null;

  return (
    <div className="space-y-5">
      {/* Overall Status Banner */}
      {report && overallCfg && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          report.overallStatus === 'operational'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
            : report.overallStatus === 'degraded'
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
        }`}>
          <div className="flex items-center gap-3">
            <overallCfg.icon className={`w-6 h-6 ${overallCfg.color}`} />
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {report.overallStatus === 'operational'
                  ? 'All Systems Operational'
                  : report.overallStatus === 'degraded'
                  ? 'Some Services Degraded'
                  : 'Critical Service Outage'}
              </p>
              <p className="text-[11px] text-slate-500">Last updated: {new Date(report.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={runCheck} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      )}

      {/* Services Grid */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.services.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      )}
    </div>
  );
};
