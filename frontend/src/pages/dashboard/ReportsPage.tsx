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
  const { user } = useAuth();
  const { showSuccess } = useNotification();

  const userId = user?.id || 'usr_guest';
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [repList, summary] = await Promise.all([
          reportService.getReports(userId, typeFilter, dateFilter, searchQuery),
          reportService.getSummaryStats(userId),
        ]);
        setReports(repList);
        setStats(summary);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId, typeFilter, dateFilter, searchQuery]);

  const handleDeleteReport = async (id: string) => {
    await reportService.deleteReport(id);
    const [updatedList, updatedStats] = await Promise.all([
      reportService.getReports(userId, typeFilter, dateFilter, searchQuery),
      reportService.getSummaryStats(userId),
    ]);
    setReports(updatedList);
    setStats(updatedStats);
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

      {/* Summary Counters Dashboard (Section 2) */}
      <ReportSummaryCards stats={stats} />

      {/* Filter and Search Bar */}
      <ReportFiltersBar
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Reports Grid / Empty State */}
      {reports.length === 0 ? (
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
