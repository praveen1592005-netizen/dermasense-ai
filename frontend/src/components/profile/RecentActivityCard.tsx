import React from 'react';
import { History, Activity, Sparkles, User, FileText, Calendar } from 'lucide-react';
import { Card } from '../common/Card';
import { ActivityItem } from '../../types/activity';

interface RecentActivityCardProps {
  activities?: ActivityItem[];
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities = [] }) => {
  return (
    <Card variant="glass" className="p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-brand-500" />
          Recent Account Activity
        </h3>
        <span className="text-xs text-slate-400">Audit Log</span>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800"
            >
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 flex-shrink-0 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {item.description}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 flex-shrink-0">
                {item.timestamp}
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* Authentic Empty State (Section 22) */
        <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-darkBg-900/40">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No recent activity
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            New actions like analysis submissions and profile updates will be logged here.
          </p>
        </div>
      )}
    </Card>
  );
};
