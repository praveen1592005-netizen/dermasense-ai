import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import {
  DiseaseImage,
  SymptomProfile,
  DiseaseAnalysis,
} from '../../types/disease';
import { diseaseAnalysisService } from '../../services/diseaseAnalysisService';

// Wizard Components
import { MedicalDisclaimerGate } from '../../components/disease/MedicalDisclaimerGate';
import { DiseaseMultiImageUploader } from '../../components/disease/DiseaseMultiImageUploader';
import { DiseaseSymptomForm } from '../../components/disease/DiseaseSymptomForm';
import { AffectedAreaSelector } from '../../components/disease/AffectedAreaSelector';
import { MedicalContextTimelineForm } from '../../components/disease/MedicalContextTimelineForm';
import { RedFlagWarningAlert } from '../../components/disease/RedFlagWarningAlert';
import { DiseaseReviewStep } from '../../components/disease/DiseaseReviewStep';
import { DiseaseAnalysisLoading } from '../../components/disease/DiseaseAnalysisLoading';
import { DiseaseResultDashboard } from '../../components/disease/DiseaseResultDashboard';

export const SkinDiseaseAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const userId = user?.id || 'usr_guest';

  // Workflow Step State
  // 0: Disclaimer Gate, 1: Images, 2: Symptoms, 3: Context & Location, 4: Review, 5: Loading, 6: Results
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [images, setImages] = useState<DiseaseImage[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomProfile>({
    itching: 'none',
    pain: 'none',
    redness: 'none',
    swelling: false,
    discharge: 'no',
    duration: 'under_24h',
    isAreaIncreasing: false,
    hasRecurred: false,
    multipleAreas: false,
    additionalSymptoms: [],
    bodyLocations: ['face'],
    description: '',
    progression: 'stable',
    exposures: [],
    hasRedFlags: false,
    redFlagDetails: [],
  });

  const [analysisResult, setAnalysisResult] = useState<DiseaseAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateSymptomField = (updated: Partial<SymptomProfile>) => {
    setSymptoms((prev) => ({ ...prev, ...updated }));
  };

  const toggleRedFlag = (flagId: string) => {
    const details = symptoms.redFlagDetails || [];
    const list = details.includes(flagId)
      ? details.filter((f) => f !== flagId)
      : [...details, flagId];

    setSymptoms((prev) => ({
      ...prev,
      redFlagDetails: list,
      hasRedFlags: list.length > 0,
    }));
  };

  const handleRunAnalysis = async () => {
    if (images.length === 0) {
      showError('Image Required', 'Please upload or capture at least 1 image.');
      setCurrentStep(1);
      return;
    }

    setCurrentStep(5); // Loading stage
    setIsSubmitting(true);

    try {
      const result = await diseaseAnalysisService.runScreening(userId, images, symptoms);
      setAnalysisResult(result);
      setCurrentStep(6); // Results
      showSuccess('Screening Complete', 'AI clinical screening assessment compiled successfully.');
    } catch (e: any) {
      showError('Analysis Failed', e.message || 'Unable to complete AI screening.');
      setCurrentStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn pb-16">
      {/* Disclaimer Gate */}
      {currentStep === 0 && (
        <MedicalDisclaimerGate onAccept={() => setCurrentStep(1)} />
      )}

      {/* Main Intake Steps (Steps 1 to 4) */}
      {currentStep >= 1 && currentStep <= 4 && (
        <div className="space-y-6">
          <PageHeader
            title="Skin Disease Analysis & Screening"
            subtitle="Follow the clinical intake steps to analyze your skin patterns and receive safety recommendations."
          />

          {/* Stepper Progress Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs">
            {['1. Photos', '2. Symptoms', '3. Context', '4. Review'].map((label, idx) => {
              const stepNumber = idx + 1;
              const isDone = currentStep > stepNumber;
              const isCurrent = currentStep === stepNumber;

              return (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-brand-500 text-white shadow-xs ring-2 ring-brand-500/20'
                        : 'bg-slate-100 dark:bg-darkBg-900 text-slate-400'
                    }`}
                  >
                    {isDone ? '✓' : stepNumber}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step 1: Images */}
          {currentStep === 1 && (
            <DiseaseMultiImageUploader
              images={images}
              onImagesChange={setImages}
            />
          )}

          {/* Step 2: Symptoms */}
          {currentStep === 2 && (
            <DiseaseSymptomForm
              symptoms={symptoms}
              onChange={updateSymptomField}
            />
          )}

          {/* Step 3: Location & Context */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <AffectedAreaSelector
                selectedLocations={symptoms.bodyLocations}
                onChange={(locs) => updateSymptomField({ bodyLocations: locs })}
              />
              <MedicalContextTimelineForm
                symptoms={symptoms}
                onChange={updateSymptomField}
              />
            </div>
          )}

          {/* Step 4: Red Flag Check & Final Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <RedFlagWarningAlert
                hasRedFlags={symptoms.hasRedFlags}
                onToggleRedFlag={toggleRedFlag}
                selectedRedFlags={symptoms.redFlagDetails || []}
              />
              <DiseaseReviewStep
                images={images}
                symptoms={symptoms}
                onEditStep={setCurrentStep}
                onSubmit={handleRunAnalysis}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200/80 dark:border-slate-800">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                variant="gradient"
                size="md"
                onClick={() => {
                  if (currentStep === 1 && images.length === 0) {
                    showError('Image Required', 'Please provide at least 1 clear photo.');
                    return;
                  }
                  setCurrentStep((prev) => prev + 1);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="md"
                onClick={handleRunAnalysis}
                isLoading={isSubmitting}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Submit for AI Screening
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step 5: Loading Stage */}
      {currentStep === 5 && <DiseaseAnalysisLoading />}

      {/* Step 6: Result Dashboard */}
      {currentStep === 6 && analysisResult && (
        <div className="space-y-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setCurrentStep(1);
              setImages([]);
            }}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Start New Screening
          </Button>

          <DiseaseResultDashboard
            analysis={analysisResult}
            onSaveToReports={async () => {
              navigate('/dashboard/reports');
            }}
          />
        </div>
      )}
    </div>
  );
};
