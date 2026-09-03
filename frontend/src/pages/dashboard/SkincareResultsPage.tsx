import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Download,
  Trash2,
  Share2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { analysisHistoryService } from '../../services/analysisHistoryService';
import { DetailedSkincareAnalysis } from '../../types/analysis';
import { formatDate } from '../../utils/formatters';

// Reusable Results Components
import { RoutineScheduleCard } from '../../components/skincare/RoutineScheduleCard';
import { LifestyleGuidanceCard } from '../../components/skincare/LifestyleGuidanceCard';
import { NutritionGuidanceCard } from '../../components/skincare/NutritionGuidanceCard';
import { ProductCategoriesCard } from '../../components/skincare/ProductCategoriesCard';
import { AnalysisDisclaimer } from '../../components/skincare/AnalysisDisclaimer';

export const SkincareResultsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();

  const [analysis, setAnalysis] = useState<DetailedSkincareAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!analysisId) return;
      setIsLoading(true);
      try {
        const data = await analysisHistoryService.getAnalysisById(analysisId);
        setAnalysis(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [analysisId]);

  const handleDelete = async () => {
    if (!analysisId) return;
    try {
      await analysisHistoryService.deleteAnalysis(analysisId);
      showSuccess('Analysis Deleted', 'The analysis record has been removed.');
      navigate('/dashboard/skincare');
    } catch {
      showError('Error', 'Unable to delete analysis.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Sparkles className="w-10 h-10 text-brand-500 animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Loading analysis details...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <Card variant="glass" className="p-12 text-center max-w-xl mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Analysis Not Found
        </h3>
        <p className="text-xs text-slate-500">
          The requested skincare analysis does not exist or has been removed.
        </p>
        <Button variant="primary" onClick={() => navigate('/dashboard/skincare')}>
          Go to Skincare Analysis
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn pb-12">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Skincare Routine Protocol
            </h1>
            <p className="text-xs text-slate-400">
              Analysis ID: {analysis.id} • {formatDate(analysis.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => showInfo('Report Integration', 'Report generation will be available in a future phase.')}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export PDF
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

      {/* Primary Summary Card */}
      <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {analysis.imagePreview ? (
            <img
              src={analysis.imagePreview}
              alt="Analyzed Skin"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-2 border-brand-500/40 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-10 h-10" />
            </div>
          )}

          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white capitalize">
                {analysis.detectedSkinType || 'Combination'} Skin Profile
              </h2>
              <Badge variant={analysis.status === 'completed' ? 'success' : 'brand'} size="md">
                {analysis.status === 'completed' ? 'Verified Result' : 'Intake Protocol'}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Model: {analysis.modelVersion || 'DermaSense-Protocol-Engine'}
            </p>

            {analysis.observations && analysis.observations.length > 0 && (
              <div className="space-y-1 pt-1 text-xs text-slate-700 dark:text-slate-300">
                {analysis.observations.map((obs, i) => (
                  <p key={i} className="flex items-center gap-1.5 justify-center md:justify-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{obs}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Routine Protocols */}
      <RoutineScheduleCard
        morningRoutine={analysis.morningRoutine}
        eveningRoutine={analysis.eveningRoutine}
      />

      {/* Product Categories */}
      <ProductCategoriesCard categories={analysis.productCategories} />

      {/* Lifestyle & Nutrition */}
      <LifestyleGuidanceCard items={analysis.lifestyleGuidance} />
      <NutritionGuidanceCard items={analysis.nutritionGuidance} />

      {/* Disclaimer */}
      <AnalysisDisclaimer />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete this analysis record?"
        description="Are you sure you want to permanently delete this analysis and routine schedule?"
      >
        <div className="pt-4 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Yes, Delete Analysis
          </Button>
        </div>
      </Modal>
    </div>
  );
};
