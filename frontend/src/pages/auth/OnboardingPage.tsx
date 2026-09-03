import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { COMMON_SKIN_CONCERNS, SUPPORTED_LANGUAGES } from '../../utils/constants';
import { SkinGoal } from '../../types/user';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { showSuccess } = useNotification();

  const [age, setAge] = useState<string>('28');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('en');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([
    'Hyperpigmentation & Dark Spots',
    'Uneven Texture',
  ]);
  const [mainGoal, setMainGoal] = useState<SkinGoal>('better_skincare_routine');
  const [isSaving, setIsSaving] = useState(false);

  const goals: { id: SkinGoal; title: string; desc: string }[] = [
    {
      id: 'better_skincare_routine',
      title: 'Build a better skincare routine',
      desc: 'Get science-backed morning & evening product regimens',
    },
    {
      id: 'understand_my_skin',
      title: 'Understand my skin characteristics',
      desc: 'Learn about your skin type, barrier health, and sensitivities',
    },
    {
      id: 'track_skin_progress',
      title: 'Track skin progress over time',
      desc: 'Log photos and symptom changes to observe improvements',
    },
    {
      id: 'explore_skin_health_guidance',
      title: 'Explore skin-health guidance',
      desc: 'Receive lifestyle, food, and environmental adaptation tips',
    },
  ];

  const toggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter((c) => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        age: parseInt(age) || undefined,
        preferredLanguage,
        skinConcerns: selectedConcerns,
        mainGoal,
        onboardingCompleted: true,
        isProfileCompleted: true,
      });

      showSuccess('Profile Configured!', 'Your personalized workspace is ready.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      navigate('/dashboard', { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        onboardingCompleted: true,
      });
      navigate('/dashboard', { replace: true });
    } catch {
      navigate('/dashboard', { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-darkBg-950 text-slate-900 dark:text-slate-100 mesh-gradient-light dark:mesh-gradient-dark">
      <div className="w-full max-w-2xl">
        <Card
          variant="glass"
          className="p-6 sm:p-10 rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-2xl animate-scaleUp"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalization Wizard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome to DermaSense AI
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Let's tailor your skin-health assistance experience.
            </p>
          </div>

          <div className="space-y-6">
            {/* Age & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Age (Years)"
                type="number"
                min="13"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 28"
              />

              <Select
                label="Preferred Language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                options={SUPPORTED_LANGUAGES.map((l) => ({
                  value: l.code,
                  label: l.name,
                }))}
              />
            </div>

            {/* Primary Skin Concerns */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide block mb-2">
                Primary Skin Concerns (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKIN_CONCERNS.map((concern) => {
                  const isSelected = selectedConcerns.includes(concern);
                  return (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => toggleConcern(concern)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-white dark:bg-darkBg-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand-500/50'
                      }`}
                    >
                      {concern}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Goal Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide block mb-2">
                What is your primary goal with DermaSense AI?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.map((g) => {
                  const isSelected = mainGoal === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setMainGoal(g.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-brand-50/50 dark:bg-brand-950/30 border-brand-500 ring-2 ring-brand-500/20'
                          : 'bg-white/60 dark:bg-darkBg-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border mt-0.5 flex-shrink-0 ${
                          isSelected
                            ? 'bg-brand-500 text-white border-brand-500'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {g.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {g.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Skip for now
            </button>

            <Button
              variant="gradient"
              size="lg"
              onClick={handleComplete}
              isLoading={isSaving}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Save & Continue to Workspace
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
