import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  Share2,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Calendar,
  User,
  ShieldAlert,
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import { pdfReportService } from '../../services/pdfReportService';
import { Report } from '../../types/report';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Logo } from '../../components/common/Logo';
import { ReportShareModal } from '../../components/reports/ReportShareModal';
import { ReportDeleteModal } from '../../components/reports/ReportDeleteModal';

export const ReportDetailPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!reportId) return;
      setIsLoading(true);
      try {
        const data = await reportService.getReportById(reportId);
        setReport(data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [reportId]);

  const handleDelete = async (id: string) => {
    await reportService.deleteReport(id);
    showSuccess('Report Deleted', 'Report removed from your account.');
    navigate('/dashboard/reports');
  };


  const handlePrintPdf = () => {
    if (report) {
      pdfReportService.downloadPDF(report);
      showSuccess('PDF Report', 'Report opened in new window. Use "Save as PDF" from the print dialog.');
    } else {
      pdfReportService.printReport();
    }
  };

  const handleDownloadJson = () => {
    if (report) {
      pdfReportService.downloadJsonSummary(report);
      showSuccess('Report Exported', 'Downloaded structured JSON clinical summary.');
    }
  };


  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Sparkles className="w-10 h-10 text-brand-500 animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Compiling clinical report view...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <Card variant="glass" className="p-12 text-center max-w-xl mx-auto space-y-4">
        <FileText className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Report Not Found
        </h3>
        <p className="text-xs text-slate-500">
          The requested clinical report does not exist or has been removed from your archive.
        </p>
        <Button variant="primary" onClick={() => navigate('/dashboard/reports')}>
          Back to Reports Center
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-16">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Reports
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJson}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export JSON
          </Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={handlePrintPdf}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Generate PDF / Print
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShareModalOpen(true)}
            leftIcon={<Share2 className="w-3.5 h-3.5" />}
          >
            Share
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* CLINICAL HEALTHCARE A4 REPORT DOCUMENT */}
      <Card
        variant="default"
        className="p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkBg-850 space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        {/* Document Header with Logo and Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <Logo size="md" showTagline />
            <p className="text-xs text-slate-400 font-mono mt-1">
              Document ID: {report.id}
            </p>
          </div>

          <div className="space-y-1 text-right sm:text-right">
            <Badge variant="brand" size="md">
              Verified Clinical Record
            </Badge>
            <p className="text-xs text-slate-500 font-medium">
              Generated: {formatDate(report.date)}
            </p>
          </div>
        </div>

        {/* Patient / User Information Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Patient / Client</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {user?.fullName || 'Authenticated User'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Assessment Category</span>
            <span className="font-bold text-slate-900 dark:text-white capitalize">
              {report.type} Protocol
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Model & Version</span>
            <span className="font-bold text-slate-900 dark:text-white truncate" title={`${report.modelName || 'Standard AI'} - ${report.modelVersion || 'v1.0'}`}>
              {report.modelName || 'Standard AI'} ({report.modelVersion || 'v1.0'})
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Completed
            </span>
          </div>
        </div>

        {/* AI Prediction Results (if available) */}
        {(report.prediction || report.confidence) && (
          <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 space-y-4">
            <h3 className="text-sm font-extrabold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider text-[11px]">
              AI Screening Results
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {report.prediction && (
                <div>
                  <span className="text-indigo-400/80 dark:text-indigo-400 block text-[11px]">Top Prediction</span>
                  <span className="font-bold text-indigo-950 dark:text-indigo-100 text-sm">
                    {report.prediction}
                  </span>
                </div>
              )}
              {report.confidence !== undefined && (
                <div>
                  <span className="text-indigo-400/80 dark:text-indigo-400 block text-[11px]">Confidence</span>
                  <span className="font-bold text-indigo-950 dark:text-indigo-100 text-sm">
                    {report.confidence <= 1 ? `${Math.round(report.confidence * 100)}%` : `${report.confidence}%`}
                  </span>
                </div>
              )}
              {report.riskLevel && (
                <div>
                  <span className="text-indigo-400/80 dark:text-indigo-400 block text-[11px]">Risk Level</span>
                  <span className={`font-bold text-sm ${
                    report.riskLevel.toLowerCase() === 'high' ? 'text-rose-600 dark:text-rose-400' :
                    report.riskLevel.toLowerCase() === 'moderate' ? 'text-amber-600 dark:text-amber-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {report.riskLevel.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Primary Observations & Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            1. Clinical Assessment & Summary
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {report.summary}
          </p>

          {report.observations && report.observations.length > 0 && (
            <div className="space-y-1.5 pt-2">
              {report.observations.map((obs, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{obs}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Morning & Evening Regimens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Morning Protocol */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Morning (AM) Protocol
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
              <p><strong>Step 1:</strong> Gentle pH-Balanced Cleanser</p>
              <p><strong>Step 2:</strong> Hydrating Hyaluronic Essence / Serum</p>
              <p><strong>Step 3:</strong> Ceramide Barrier Moisturizer</p>
              <p><strong>Step 4:</strong> Broad-Spectrum Sunscreen SPF 50+</p>
            </div>
          </div>

          {/* Evening Protocol */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigoBrand-500" />
              Evening (PM) Protocol
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
              <p><strong>Step 1:</strong> Double Cleanse (Micellar / Cleanser)</p>
              <p><strong>Step 2:</strong> Targeted Active Treatment</p>
              <p><strong>Step 3:</strong> Restorative Night Moisture Cream</p>
            </div>
          </div>
        </div>

        {/* HIGH RISK WARNING & HOSPITAL LOCATOR */}
        {report.riskLevel?.toLowerCase() === 'high' && (
          <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
                  ⚠️ Urgent Medical Attention Recommended
                </h3>
                <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-300 leading-relaxed">
                  This AI screening result may indicate a condition that requires professional medical evaluation. Please consult a qualified dermatologist or visit a dermatology hospital for proper examination.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <Button 
                variant="gradient" 
                size="sm"
                onClick={() => {
                  /* Logic to show map or redirect to hospital finder */
                  showSuccess("Hospital Map", "Opening Map to Find Nearby Hospitals...");
                }}
              >
                Find Nearby Dermatology Hospitals
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.open('https://maps.google.com/?q=dermatology+hospital+near+me', '_blank');
                }}
              >
                View on Map
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.open('https://maps.google.com/?q=dermatology+hospital+near+me', '_blank');
                }}
              >
                Get Directions
              </Button>
            </div>
          </div>
        )}

        {/* Mandatory Medical Safety Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Important Clinical Safety Notice</span>
          </div>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            DermaSense AI provides AI-assisted informational skincare guidance and is not a clinical medical diagnosis. If you experience persistent redness, pain, suspicious lesion changes, or severe irritation, seek in-person consultation with a qualified dermatologist.
          </p>
        </div>

        {/* Footer Timestamp */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>DermaSense AI Clinical Protocol Engine</span>
          <span>Archived via Authenticated Patient Vault</span>
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
        onConfirm={handleDelete}
      />
    </div>
  );
};
