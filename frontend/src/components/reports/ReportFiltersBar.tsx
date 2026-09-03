import React from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { ReportFilter, ReportDateFilter } from '../../types/report';
import { Select } from '../common/Select';

interface ReportFiltersBarProps {
  typeFilter: ReportFilter;
  onTypeFilterChange: (type: ReportFilter) => void;
  dateFilter: ReportDateFilter;
  onDateFilterChange: (date: ReportDateFilter) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const ReportFiltersBar: React.FC<ReportFiltersBarProps> = ({
  typeFilter,
  onTypeFilterChange,
  dateFilter,
  onDateFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const typeTabs: { id: ReportFilter; label: string }[] = [
    { id: 'all', label: 'All Reports' },
    { id: 'skincare', label: 'Skincare' },
    { id: 'disease', label: 'Skin Disease' },
    { id: 'progress', label: 'Progress' },
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_6_months', label: 'Last 6 Months' },
  ];

  return (
    <div className="p-4 rounded-3xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
      {/* Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {typeTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTypeFilterChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              typeFilter === tab.id
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-darkBg-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-darkBg-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Date Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search reports by title, ID, or clinical parameter..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value as ReportDateFilter)}
            options={dateOptions}
          />
        </div>
      </div>
    </div>
  );
};
