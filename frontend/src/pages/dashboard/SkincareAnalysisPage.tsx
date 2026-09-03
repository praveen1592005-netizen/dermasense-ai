import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  History,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { skincareAnalysisService } from '../../services/skincareAnalysisService';
import { analysisHistoryService } from '../../services/analysisHistoryService';
import { pdfReportService } from '../../services/pdfReportService';
import {
  SkincareAnalysisInput,
  DetailedSkincareAnalysis,
  ImageQualityReport,
} from '../../types/analysis';

// Reusable Components
import { AnalysisStepper } from '../../components/skincare/AnalysisStepper';
import { SkinImageUploader } from '../../components/skincare/SkinImageUploader';
import { SkinConcernSelector } from '../../components/skincare/SkinConcernSelector';
import { CurrentRoutineForm } from '../../components/skincare/CurrentRoutineForm';
import { LifestyleDietForm } from '../../components/skincare/LifestyleDietForm';
import { AnalysisReviewCard } from '../../components/skincare/AnalysisReviewCard';
import { AnalysisLoadingScreen } from '../../components/skincare/AnalysisLoadingScreen';
import { AnalysisUnavailableCard } from '../../components/skincare/AnalysisUnavailableCard';
import { RoutineScheduleCard } from '../../components/skincare/RoutineScheduleCard';
import { LifestyleGuidanceCard } from '../../components/skincare/LifestyleGuidanceCard';
import { NutritionGuidanceCard } from '../../components/skincare/NutritionGuidanceCard';
import { ProductCategoriesCard } from '../../components/skincare/ProductCategoriesCard';
import { AnalysisDisclaimer } from '../../components/skincare/AnalysisDisclaimer';
import { AnalysisHistoryList } from '../../components/skincare/AnalysisHistoryList';

export const SkincareAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  // Mode: 'intake' | 'history'
  const [viewMode, setViewMode] = useState<'intake' | 'history'>('intake');
  const [historyList, setHistoryList] = useState<DetailedSkincareAnalysis[]>([]);

  // Stepper: 1 (Image), 2 (Skin Info), 3 (Review), 4 (Loading), 5 (Results)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loadingStage, setLoadingStage] = useState<string>('Validating image resolution and lighting...');
  const [analysisResult, setAnalysisResult] = useState<DetailedSkincareAnalysis | null>(null);

  // Form Data with profile pre-fill (Phase 2 integration)
  const [formData, setFormData] = useState<SkincareAnalysisInput>({
    imageFile: null,
    imagePreview: null,
    imageQuality: null,
    skinType: user?.profile?.skinProfile?.skinType || user?.profile?.skinType || 'combination',
    primaryConcerns:
      user?.profile?.skinProfile?.primaryConcerns ||
      user?.profile?.skinConcerns ||
      ['Hyperpigmentation & Dark Spots'],
    structuredRoutine: {
      hasNoRoutine: false,
      cleanser: { productName: 'Gentle Hydrating Cleanser', frequency: 'Daily' },
      moisturizer: { productName: 'Ceramide Barrier Lotion', frequency: 'Daily' },
      sunscreen: { productName: 'Broad-Spectrum SPF 50', frequency: 'Daily' },
      serum: { productName: 'Niacinamide 5% Serum', frequency: 'Few times a week' },
    },
    lifestyleDiet: {
      waterIntakeLiters: '2.0',
      sleepHours: '7-8',
      exerciseFrequency: '3-5 days/week',
      sunExposure: 'Moderate',
      stressLevel: 'Moderate',
      dietType: 'Mixed',
    },
  });

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        const past = await analysisHistoryService.getUserAnalyses(user.id);
        setHistoryList(past);
      }
    };
    loadHistory();
  }, [user]);

  const handleImageChange = (
    file: File | null,
    previewUrl: string | null,
    quality: ImageQualityReport | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: previewUrl,
      imageQuality: quality,
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.imagePreview) {
        showError('Photo Required', 'Please upload or capture a facial skin photo to proceed.');
        return;
      }
      if (formData.imageQuality && !formData.imageQuality.isUsable) {
        showError('Image Quality Issue', formData.imageQuality.message);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (formData.primaryConcerns.length === 0) {
        showError('Select Concerns', 'Please select at least one skin concern.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleStartAnalysis();
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStartAnalysis = async () => {
    setCurrentStep(4);
    try {
      const result = await skincareAnalysisService.submitAnalysis(
        formData,
        (stage) => setLoadingStage(stage)
      );
      setAnalysisResult(result);
      setCurrentStep(5);
      showSuccess('Analysis Prepared', 'Your skincare protocol and guidance are ready.');
      if (user) {
        const updated = await analysisHistoryService.getUserAnalyses(user.id);
        setHistoryList(updated);
      }
    } catch (err: any) {
      setCurrentStep(3);
      showError('Analysis Error', err.message || 'Failed to complete analysis.');
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setAnalysisResult(null);
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
      imageQuality: null,
    }));
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await analysisHistoryService.deleteAnalysis(id);
    if (user) {
      const updated = await analysisHistoryService.getUserAnalyses(user.id);
      setHistoryList(updated);
    }
    showSuccess('Record Deleted', 'Analysis removed from your history.');
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;
    
    const reportData = {
      id: analysisResult.id,
      userId: analysisResult.userId,
      date: analysisResult.createdAt,
      type: 'skincare' as const,
      status: 'ready' as const,
      title: 'Skincare Analysis Protocol',
      summary: `Your personalized skincare protocol based on your observed ${analysisResult.detectedSkinType} skin profile.`,
      skinType: analysisResult.detectedSkinType,
      observations: analysisResult.observations,
      morningRoutine: analysisResult.morningRoutine,
      eveningRoutine: analysisResult.eveningRoutine,
      productCategories: analysisResult.productCategories,
      lifestyleGuidance: analysisResult.lifestyleGuidance,
      nutritionGuidance: analysisResult.nutritionGuidance,
      imagePreview: analysisResult.imagePreview,
    };
    
    pdfReportService.downloadPDF(reportData);
    showSuccess('Report Generated', 'Your analysis report has been opened for saving/printing.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="AI Skincare Analysis"
          subtitle="Understand your skin and build a personalized skincare routine."
        />

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant={viewMode === 'intake' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('intake')}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            New Intake
          </Button>

          <Button
            variant={viewMode === 'history' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('history')}
            leftIcon={<History className="w-3.5 h-3.5" />}
          >
            History ({historyList.length})
          </Button>
        </div>
      </div>

      {/* VIEW: Analysis History List */}
      {viewMode === 'history' && (
        <AnalysisHistoryList
          analyses={historyList}
          onDeleteAnalysis={handleDeleteHistoryItem}
          onStartNew={() => {
            setViewMode('intake');
            handleReset();
          }}
        />
      )}

      {/* VIEW: Intake Flow */}
      {viewMode === 'intake' && (
        <div className="space-y-6">
          {/* Stepper Progress Bar */}
          <AnalysisStepper
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep || (step === 2 && formData.imagePreview)) {
                setCurrentStep(step);
              }
            }}
            maxStepAllowed={currentStep}
          />

          {/* STEP 1: Image Input & Quality Verification */}
          {currentStep === 1 && (
            <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Step 1: Provide Facial Skin Image
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Capture a live selfie or upload an image for automated lighting and texture validation.
                </p>
              </div>

              <SkinImageUploader
                imageFile={formData.imageFile || null}
                imagePreview={formData.imagePreview || null}
                imageQuality={formData.imageQuality || null}
                onImageChange={handleImageChange}
              />

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleNextStep}
                  disabled={!formData.imagePreview}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Skin Habits
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: Skin Information, Concerns, Routine, Lifestyle & Diet */}
          {currentStep === 2 && (
            <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-8">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Step 2: Skin Profile & Daily Habits
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Specify your primary skin focus, current product routine, and lifestyle factors.
                </p>
              </div>

              {/* Skin Type Selector */}
              <div className="max-w-md">
                <Select
                  label="Observed Skin Type"
                  value={formData.skinType || 'combination'}
                  onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                  options={[
                    { value: 'combination', label: 'Combination (Oily T-zone, Normal/Dry Cheeks)' },
                    { value: 'oily', label: 'Oily (Frequent shine & enlarged pores)' },
                    { value: 'dry', label: 'Dry (Tightness & flaking)' },
                    { value: 'normal', label: 'Normal (Balanced)' },
                    { value: 'sensitive', label: 'Sensitive (Prone to redness/stinging)' },
                    { value: 'unsure', label: 'Unsure / Let AI Assess' },
                  ]}
                />
              </div>

              {/* 12 Concerns Checklist */}
              <SkinConcernSelector
                selectedConcerns={formData.primaryConcerns}
                onChange={(concerns) => setFormData({ ...formData, primaryConcerns: concerns })}
              />

              {/* Current Routine Products Form */}
              <CurrentRoutineForm
                routine={formData.structuredRoutine}
                onChange={(routine) => setFormData({ ...formData, structuredRoutine: routine })}
              />

              {/* Lifestyle & Diet Form */}
              <LifestyleDietForm
                data={formData.lifestyleDiet}
                onChange={(lifestyle) => setFormData({ ...formData, lifestyleDiet: lifestyle })}
              />

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button variant="secondary" size="md" onClick={handleBackStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Photo
                </Button>
                <Button variant="primary" size="lg" onClick={handleNextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Review Submission
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: Review */}
          {currentStep === 3 && (
            <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800">
              <AnalysisReviewCard
                formData={formData}
                onEditStep={(step) => setCurrentStep(step)}
                onSubmit={handleStartAnalysis}
              />
            </Card>
          )}

          {/* STEP 4: AI Analysis Loading */}
          {currentStep === 4 && <AnalysisLoadingScreen currentStage={loadingStage} />}

          {/* STEP 5: Results & Recommendations Dashboard (Section 21) */}
          {currentStep === 5 && analysisResult && (
            <div className="space-y-6 animate-fadeIn">
              {/* AI Unavailable / Integration-Ready Banner (Section 18) */}
              <AnalysisUnavailableCard
                onBack={handleReset}
                onRetry={handleStartAnalysis}
              />

              {/* Top Summary Card: Photo & Detected Skin Type */}
              <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {analysisResult.imagePreview && (
                    <img
                      src={analysisResult.imagePreview}
                      alt="Analyzed Skin"
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-2 border-brand-500/40 shadow-md flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white capitalize">
                        {analysisResult.detectedSkinType} Skin Profile
                      </h3>
                      <Badge variant="brand" size="md">
                        Intake Ready
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Based on your completed facial intake, focus concerns, and barrier parameters.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
                      {formData.primaryConcerns.map((c) => (
                        <Badge key={c} variant="teal" size="sm">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Structured Morning & Evening Routine Schedule */}
              <RoutineScheduleCard
                morningRoutine={analysisResult.morningRoutine}
                eveningRoutine={analysisResult.eveningRoutine}
              />

              {/* Recommended Product Categories */}
              <ProductCategoriesCard categories={analysisResult.productCategories} />

              {/* Lifestyle Guidance */}
              <LifestyleGuidanceCard items={analysisResult.lifestyleGuidance} />

              {/* Nutrition & Diet Guidance */}
              <NutritionGuidanceCard items={analysisResult.nutritionGuidance} />

              {/* Medical Disclaimer */}
              <AnalysisDisclaimer />

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleReset}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Analyze Again
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleDownloadReport}
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Save Report (PDF)
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      showSuccess('Analysis Saved', 'Your skincare protocol has been archived in your profile.');
                      setViewMode('history');
                    }}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save to My History
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
