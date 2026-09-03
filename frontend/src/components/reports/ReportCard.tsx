import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Activity,
  TrendingUp,
  UserCheck,
  Download,
  Share2,
  Trash2,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Report } from '../../types/report';
import { formatDate } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ReportShareModal } from './ReportShareModal';
import { ReportDeleteModal } from './ReportDeleteModal';
import { pdfReportService } from '../../services/pdfReportService';
import { useNotification } from '../../context/NotificationContext';

interface ReportCardProps {
  report: Report;
  onDelete: (id: string) => Promise<void>;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onDelete }) => {
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const getReportIcon = () => {
    switch (report.type) {
      case 'skincare':
        return <Sparkles className="w-4 h-4 text-tealBrand-500" />;
      case 'disease':
        return <Activity className="w-4 h-4 text-amber-500" />;
      case 'progress':
        return <TrendingUp className="w-4 h-4 text-indigoBrand-500" />;
      default:
        return <UserCheck className="w-4 h-4 text-brand-500" />;
    }
  };

  const getTypeBadge = () => {
    switch (report.type) {
      case 'skincare':
        return <Badge variant="brand" size="sm">Skincare</Badge>;
      case 'disease':
        return <Badge variant="warning" size="sm">Disease Intake</Badge>;
      case 'progress':
        return <Badge variant="teal" size="sm">Progress</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Consultation</Badge>;
    }
  };

  const handleDownload = () => {
    pdfReportService.downloadJsonSummary(report);
    showSuccess('Report Exported', 'Downloaded structured JSON clinical summary.');
  };

  return (
    <>
      <Card
        variant="default"
        className="p-5 rounded-3xl border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg transition-all duration-200"
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-darkBg-800 border border-slate-200/60 dark:border-slate-700">
                {getReportIcon()}
              </div>
              {getTypeBadge()}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {formatDate(report.date)}
            </span>
          </div>

          {/* Title & Summary */}
          <div>
            <h4
              onClick={() => navigate(`/dashboard/reports/${report.id}`)}
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-brand-600 cursor-pointer"
            >
              {report.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {report.summary}
            </p>
          </div>

          {/* Observations Tag */}
          {report.observations && report.observations.length > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-900 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <span className="font-bold block text-[10px] uppercase text-slate-400">
                Key Observation:
              </span>
              <p className="truncate">{report.observations[0]}</p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
              title="Download summary"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
              title="Secure share link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Delete report"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/dashboard/reports/${report.id}`)}
            rightIcon={<Eye className="w-3.5 h-3.5" />}
          >
            View
          </Button>
        </div>
      </Card>

      {/* Share Modal */}
      <ReportShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        report={report}
      />

      {/* Delete Modal */}
      <ReportDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        reportId={report.id}
        reportTitle={report.title}
        onConfirm={onDelete}
      />
    </>
  );
};
