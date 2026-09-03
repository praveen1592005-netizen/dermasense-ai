import React, { useState } from 'react';
import { Share2, Copy, Check, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { Report } from '../../types/report';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { reportService } from '../../services/reportService';
import { useNotification } from '../../context/NotificationContext';

interface ReportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
}

export const ReportShareModal: React.FC<ReportShareModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const { showSuccess } = useNotification();
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const link = await reportService.generateShareLink(report.id);
      setShareLink(link);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    showSuccess('Link Copied', 'Secure temporary report link copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Clinical Report Sharing"
      description="Reports are private by default. Generate a temporary, encrypted link or share with a verified dermatologist."
      size="md"
    >
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-900 dark:text-white">
              Private Account Encryption Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Report ID: {report.id} • Title: {report.title}
          </p>
        </div>

        {/* Share Link Generation */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white block">
            Temporary Secure Link (Expires in 48 hours)
          </label>

          {shareLink ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-darkBg-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono select-all"
              />
              <Button
                variant={copied ? 'teal' : 'primary'}
                size="sm"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateLink}
              isLoading={isGenerating}
              leftIcon={<Share2 className="w-3.5 h-3.5" />}
            >
              Generate Temporary Link
            </Button>
          )}
        </div>

        {/* Doctor Consultation Share Preview */}
        <div className="p-3.5 rounded-2xl bg-tealBrand-50/60 dark:bg-tealBrand-950/30 border border-tealBrand-200/60 dark:border-tealBrand-900/40 text-xs text-tealBrand-900 dark:text-tealBrand-200 space-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-tealBrand-500" />
            Doctor Direct Consultation Access
          </span>
          <p className="text-[11px] text-tealBrand-800/90 dark:text-tealBrand-300/90">
            Secure sharing will be automatically available when scheduling an appointment with a verified dermatologist in the Doctor Consultation module.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
