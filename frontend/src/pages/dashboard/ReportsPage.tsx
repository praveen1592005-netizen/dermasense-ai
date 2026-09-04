import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Sparkles,
  Activity,
  Calendar,
  Eye,
  Info,
  Layers,
  Plus,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Report, ReportFilter, ReportDateFilter, ReportSummaryStats } from '../../types/report';

// Reusable Components
import { ReportSummaryCards } from '../../components/reports/ReportSummaryCards';
import { ReportFiltersBar } from '../../components/reports/ReportFiltersBar';
import { ReportCard } from '../../components/reports/ReportCard';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { showSuccess } = useNotification();

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportSummaryStats>({
    totalReports: 0,
    skincareReports: 0,
    diseaseReports: 0,
    progressReports: 0,
  });

  const [typeFilter, setTypeFilter] = useState<ReportFilter>('all');
  const [dateFilter, setDateFilter] = useState<ReportDateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Start true so we never flash "0 reports" while auth is resolving
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadReports = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      // Run both queries in parallel; reportService now queries `analyses` via Supabase directly
      const [repList, summary] = await Promise.all([
        reportService.getReports(user.id, typeFilter, dateFilter, searchQuery),
        reportService.getSummaryStats(user.id),
      ]);
      setReports(repList);
      setStats(summary);
    } catch (err: any) {
      console.error('[DermaSense] Failed to load reports:', err);
      // Distinguish between "no session" and "real DB error"
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('jwt') || msg.toLowerCase().includes('not authenticated')) {
        setFetchError('Your session has expired. Please sign in again to view your reports.');
      } else {
        setFetchError(
          'Unable to load your reports from the database. ' +
          'This may be a temporary connectivity issue. Please try refreshing.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Do NOT fetch until auth has finished loading and we have a real user id.
    if (authLoading) {
      // Keep isLoading=true until auth resolves — no flicker of "0"
      setIsLoading(true);
      return;
    }
    if (!user?.id) {
      // Auth finished but no user — unauthenticated
      setIsLoading(false);
      return;
    }
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading, typeFilter, dateFilter, searchQuery]);

  const handleDeleteReport = async (id: string) => {
    if (!user?.id) return;
    await reportService.deleteReport(id);
    await loadReports();
    showSuccess('Report Deleted', 'The report record has been removed from your archive.');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn pb-16">
      <PageHeader
        title="Smart Reports Center"
        subtitle="Access your verified clinical assessments, routine protocols, and progress archives."
        actions={
          <Button
            variant="gradient"
            size="sm"
            onClick={() => navigate('/dashboard/skincare')}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            New Skincare Analysis
          </Button>
        }
      />

      {/* Summary Counters Dashboard */}
      {/* Show stats only once we have real data (not during loading) */}
      <ReportSummaryCards stats={isLoading ? { totalReports: 0, skincareReports: 0, diseaseReports: 0, progressReports: 0 } : stats} />

      {/* Filter and Search Bar */}
      <ReportFiltersBar
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Reports Grid / Loading / Error / Empty State */}
      {isLoading ? (
        /* Loading skeleton — prevents "0 reports" flash while DB query is in flight */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5 animate-pulse"
              style={{ height: '220px' }}
            />
          ))}
        </div>
      ) : fetchError ? (
        /* Database error — distinguish from "genuinely no reports" */
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Failed to Load Reports</h3>
          <p className="text-gray-400 max-w-md text-sm">{fetchError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadReports}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports match your filter"
          description="Your completed clinical assessments and progress reports will appear here once you initiate an analysis."
          actionLabel="Start Skincare Analysis"
          onAction={() => navigate('/dashboard/skincare')}
          actionIcon={<Sparkles className="w-4 h-4" />}
          secondaryActionLabel="Start Disease Intake"
          onSecondaryAction={() => navigate('/dashboard/disease')}
          badgeText="Archive Ready"
          className="my-8"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={handleDeleteReport}
            />
          ))}
        </div>
      )}
    </div>
  );
};
