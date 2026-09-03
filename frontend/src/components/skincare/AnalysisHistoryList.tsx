import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Calendar, Trash2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { DetailedSkincareAnalysis } from '../../types/analysis';
import { formatDate } from '../../utils/formatters';

interface AnalysisHistoryListProps {
  analyses: DetailedSkincareAnalysis[];
  onDeleteAnalysis: (id: string) => Promise<void>;
  onStartNew: () => void;
}

export const AnalysisHistoryList: React.FC<AnalysisHistoryListProps> = ({
  analyses,
  onDeleteAnalysis,
  onStartNew,
}) => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await onDeleteAnalysis(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" />
            Previous Skincare Analyses
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Access past assessments and routine recommendations.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={onStartNew} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
          New Analysis
        </Button>
      </div>

      {analyses.length > 0 ? (
        <div className="space-y-3">
          {analyses.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-brand-400"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {item.imagePreview ? (
                  <img
                    src={item.imagePreview}
                    alt="Analysis thumbnail"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.detectedSkinType || 'Combination'} Skin Profile
                    </h4>
                    <Badge variant={item.status === 'completed' ? 'success' : 'brand'} size="sm">
                      {item.status === 'completed' ? 'Analyzed' : 'Intake Ready'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {formatDate(item.createdAt)} • ID: {item.id.slice(-8)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/skincare-analysis/${item.id}`)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  View Details
                </Button>
                <button
                  type="button"
                  onClick={() => setDeleteId(item.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete analysis record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Authentic Empty State (Section 31) */
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-darkBg-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              No skincare analyses yet.
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Complete your first facial intake to receive structured morning/evening routine protocols.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={onStartNew} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
            Start Your First Analysis
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal (Section 35) */}
      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete this analysis?"
        description="Are you sure you want to permanently delete this analysis and its routine protocol from your history?"
      >
        <div className="pt-4 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} isLoading={isDeleting}>
            Yes, Delete Analysis
          </Button>
        </div>
      </Modal>
    </Card>
  );
};
