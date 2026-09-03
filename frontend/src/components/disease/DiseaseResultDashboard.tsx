import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  MessageCircle,
  Cpu,
  HelpCircle,
  ExternalLink,
  Apple,
  Activity,
} from 'lucide-react';
import { DiseaseAnalysis } from '../../types/disease';
import { formatDate } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useNotification } from '../../context/NotificationContext';
import { HospitalRecommendationSection } from './HospitalRecommendationSection';

interface DiseaseResultDashboardProps {
  analysis: DiseaseAnalysis;
  onSaveToReports?: () => Promise<void>;
}

export const DiseaseResultDashboard: React.FC<DiseaseResultDashboardProps> = ({
  analysis,
  onSaveToReports,
}) => {
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const [isSaving, setIsSaving] = useState(false);

  const modelPrediction = analysis.modelPrediction;
  const hasRealPrediction =
    modelPrediction &&
    (modelPrediction.status === 'prediction_available' || modelPrediction.status === 'low_confidence');

  const primaryCondition =
    modelPrediction?.condition ||
    analysis.possibleCategories?.[0]?.categoryName ||
    'Screening Assessment';

  const confidencePct =
    modelPrediction?.confidence_percentage ??
    analysis.possibleCategories?.[0]?.confidencePct ??
    null;

  const confidenceLevel = modelPrediction?.confidence_level || (
    confidencePct ? (confidencePct >= 80 ? 'HIGH' : confidencePct >= 60 ? 'MODERATE' : 'LOW') : 'MODERATE'
  );

  const riskLevel = modelPrediction?.risk_level || (
    analysis.urgencyLevel === 'emergency'
      ? 'HIGH'
      : analysis.urgencyLevel === 'prompt_evaluation'
      ? 'HIGH'
      : analysis.urgencyLevel === 'evaluation_recommended'
      ? 'MODERATE'
      : 'LOW'
  );

  const getUrgencyBadge = () => {
    switch (analysis.urgencyLevel) {
      case 'emergency':
        return <Badge variant="danger" size="md">Emergency Medical Triage</Badge>;
      case 'prompt_evaluation':
        return <Badge variant="warning" size="md">Prompt Evaluation Advised</Badge>;
      case 'evaluation_recommended':
        return <Badge variant="brand" size="md">Professional Evaluation Recommended</Badge>;
      default:
        return <Badge variant="success" size="md">General Informational Guidance</Badge>;
    }
  };

  const getRiskBadge = () => {
    switch (riskLevel) {
      case 'HIGH':
        return <Badge variant="danger" size="sm">High Risk</Badge>;
      case 'MODERATE':
        return <Badge variant="warning" size="sm">Moderate Risk</Badge>;
      case 'LOW':
        return <Badge variant="success" size="sm">Low Risk</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Uncertain Risk</Badge>;
    }
  };

  const getConfidenceBadge = () => {
    switch (confidenceLevel) {
      case 'HIGH':
        return <Badge variant="success" size="sm">High Confidence (&gt;= 80%)</Badge>;
      case 'MODERATE':
        return <Badge variant="warning" size="sm">Moderate Confidence (60-79%)</Badge>;
      default:
        return <Badge variant="danger" size="sm">Low Confidence (&lt; 60%)</Badge>;
    }
  };

  const handleSaveReport = async () => {
    if (onSaveToReports) {
      setIsSaving(true);
      try {
        await onSaveToReports();
        showSuccess('Saved to Reports', 'This clinical screening protocol is archived in Smart Reports.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAskAI = () => {
    navigate('/dashboard/chat', {
      state: {
        analysisContext: {
          condition: primaryCondition,
          confidence_percentage: confidencePct,
          confidence_level: confidenceLevel,
          risk_level: riskLevel,
          symptoms: analysis.symptomProfile?.additionalSymptoms ?? [],
          duration: analysis.symptomProfile?.duration ?? null,
          body_location: analysis.symptomProfile?.bodyLocations?.join(', ') ?? null,
        },
      },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Top Banner / Triage Level */}
      <Card
        variant="glass"
        className={`p-6 sm:p-8 rounded-3xl border ${
          analysis.isEmergencyRedFlag
            ? 'border-rose-500/40 bg-rose-500/5'
            : 'border-brand-500/30'
        } space-y-4`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 font-mono">
                Screening ID: {analysis.id}
              </span>
              {getUrgencyBadge()}
              {getRiskBadge()}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              AI Skin Health Screening Result
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="gradient"
              size="sm"
              onClick={handleAskAI}
              leftIcon={<MessageCircle className="w-4 h-4" />}
            >
              Ask AI About This Result
            </Button>

            {onSaveToReports && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveReport}
                isLoading={isSaving}
                leftIcon={<FileText className="w-4 h-4" />}
              >
                Save to Reports
              </Button>
            )}
          </div>
        </div>

        {/* Urgency Explanation Message */}
        <div className="p-4 rounded-2xl bg-white dark:bg-darkBg-900 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {analysis.urgencyMessage}
        </div>
      </Card>

      {/* Model Status Warning if Model Not Configured */}
      {modelPrediction?.status === 'model_not_configured' && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <Cpu className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>Skin AI Model Integration Note</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            The image AI pipeline is ready. To enable live EfficientNetV2 skin disease predictions, place your trained model file at{' '}
            <code className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 font-mono text-[10px]">backend/models/skin_model.keras</code>.
            Currently displaying symptom-based clinical screening rules.
          </p>
        </div>
      )}

      {/* Primary Detection & Confidence Card */}
      <Card variant="default" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Primary AI Detected Condition Pattern
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              {primaryCondition}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Architecture: {analysis.modelVersion}
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1.5 bg-slate-50 dark:bg-darkBg-900 p-4 md:p-0 rounded-2xl md:bg-transparent">
            {confidencePct !== null && (
              <div className="text-right">
                <span className="text-3xl font-black text-brand-600 dark:text-brand-400">
                  {confidencePct}%
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">Model Confidence</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 justify-end">
              {getConfidenceBadge()}
            </div>
          </div>
        </div>

        {/* Top-K Predictions if available from EfficientNetV2 */}
        {modelPrediction?.top_k && modelPrediction.top_k.length > 1 && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Top Model Predictions (HAM10000 7-Class Classifier):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {modelPrediction.top_k.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border ${
                    idx === 0
                      ? 'bg-brand-50/50 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900/40 font-bold'
                      : 'bg-slate-50 dark:bg-darkBg-900 border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-800 dark:text-slate-200 truncate">{item.condition}</span>
                    <span className="text-brand-600 dark:text-brand-400 font-mono font-bold">
                      {item.confidence_percentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${idx === 0 ? 'bg-brand-500' : 'bg-slate-400'}`}
                      style={{ width: `${item.confidence_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Ollama Local AI Explanation Card */}
      {analysis.aiExplanation && (
        <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-tealBrand-500/30 bg-tealBrand-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Local AI Explanation (Llama 3.1 8B)
                </h3>
                <p className="text-[11px] text-slate-400">Plain-language breakdown of your visual screening</p>
              </div>
            </div>
            <Badge variant="teal" size="sm">Local LLM</Badge>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-darkBg-900 border border-tealBrand-500/20 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {analysis.aiExplanation}
          </div>
        </Card>
      )}

      {/* Screened Possible Categories */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" />
            Possible Condition Categories for Clinical Evaluation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            These are possibilities for healthcare professional evaluation, not confirmed medical diagnoses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {analysis.possibleCategories.map((cat, idx) => (
            <Card
              key={idx}
              variant="default"
              className="p-5 sm:p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {cat.categoryName}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  ~{cat.confidencePct}% match pattern
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {cat.description}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <span className="font-bold text-[10px] uppercase tracking-wider block text-slate-400">
                  Observed Pattern Markers:
                </span>
                {cat.keyIndicators.map((ind, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-brand-500 flex-shrink-0" />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Why This Result & AI Observations */}
      <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-tealBrand-500" />
          Why this Result? (Model-Supported Observations)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
          {analysis.observations.map((obs, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{obs}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* General Supportive Skin Precautions & Lifestyle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="default" className="p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500" />
            Skin Care &amp; Barrier Precautions
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {analysis.precautions.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-brand-500 font-bold">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="default" className="p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Apple className="w-4 h-4 text-tealBrand-500" />
            General Nutrition &amp; Lifestyle Support
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {analysis.lifestyleGuidance.map((l, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-tealBrand-500 font-bold">•</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Mandatory Medical Disclaimer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
        <div className="flex items-center gap-2 font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Clinical Non-Diagnostic Notice</span>
        </div>
        <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
          {analysis.disclaimer}
        </p>
      </div>

      {/* Hospital Recommendation Integration */}
      {analysis.modelPrediction?.hospital_recommended && (
        <HospitalRecommendationSection />
      )}
    </div>
  );
};

