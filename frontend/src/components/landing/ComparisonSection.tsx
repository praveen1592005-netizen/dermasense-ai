import React from 'react';
import { Sparkles, Activity, Check, ArrowRight, ShieldAlert, HeartHandshake } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const ComparisonSection: React.FC = () => {
  const skincareFeatures = [
    { title: 'Skin Type Assessment', desc: 'Identify oily, dry, normal, combination, or sensitive skin' },
    { title: 'Targeted Skin Concerns', desc: 'Focus on acne, aging, texture, hyperpigmentation, or pores' },
    { title: 'Custom Daily Routine', desc: 'Step-by-step Morning & Night AM/PM regimens' },
    { title: 'Product & Ingredient Matching', desc: 'Active ingredient suitability and routine compatibility' },
    { title: 'Food & Nutrition Guidance', desc: 'Hydration and skin-barrier supportive foods' },
    { title: 'Lifestyle & Habit Coaching', desc: 'Sleep, sun exposure, and stress impact insights' },
  ];

  const diseaseFeatures = [
    { title: 'High-Resolution Lesion Image', desc: 'Capture detailed photo of the affected skin area' },
    { title: 'Structured Symptom Intake', desc: 'Log itching, pain, redness, swelling, and timeline' },
    { title: 'AI Condition Screening (Future)', desc: 'Machine learning classification and pattern comparison' },
    { title: 'Urgency & Risk Indication', desc: 'Informational triage guidance to aid decision making' },
    { title: 'Dermatologist Matchmaking', desc: 'Direct pathway to connect with clinical specialists' },
    { title: 'Telehealth Consultation (Future)', desc: 'Secure video and digital review with certified doctors' },
  ];

  return (
    <section id="comparison" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigoBrand-500/10 text-indigoBrand-600 dark:text-indigoBrand-400 text-xs font-bold mb-3">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Dual Workflow Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Skincare Wellness vs. Skin Condition Analysis
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            DermaSense AI provides two clearly segregated, specialized pipelines tailored for daily cosmetic skincare vs. clinical condition triage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Left: Skincare Analysis Workflow Card */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-brand-500/5 via-white dark:via-darkBg-850 to-transparent border-2 border-brand-500/30 dark:border-brand-500/40 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Skincare Analysis
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cosmetic & Daily Wellness Protocol
                    </p>
                  </div>
                </div>
                <Badge variant="brand" size="md">
                  Wellness Track
                </Badge>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Designed for individuals looking to enhance skin vitality, optimize product efficacy, and establish a scientific skincare regimen.
              </p>

              <div className="space-y-3.5 mb-8">
                {skincareFeatures.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-brand-50/40 dark:bg-darkBg-900/40 border border-brand-100/60 dark:border-slate-800">
                    <div className="p-1 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-800 dark:text-brand-300 font-medium">
              💡 Outcome: Tailored AM/PM routine, active ingredient guidance, and daily habit roadmap.
            </div>
          </div>

          {/* Right: Skin Disease Analysis Workflow Card */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-rose-500/5 via-white dark:via-darkBg-850 to-transparent border-2 border-rose-500/30 dark:border-rose-500/40 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Skin Disease Analysis
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Medical Symptom & Lesion Intake
                    </p>
                  </div>
                </div>
                <Badge variant="danger" size="md">
                  Clinical Triage
                </Badge>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Engineered for structured lesion documentation, symptom tracking, and preparing information for professional dermatology consultations.
              </p>

              <div className="space-y-3.5 mb-8">
                {diseaseFeatures.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-rose-50/40 dark:bg-darkBg-900/40 border border-rose-100/60 dark:border-slate-800">
                    <div className="p-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 font-medium">
              ⚠️ Medical Notice: Not a replacement for emergency or human medical diagnosis. Connects to certified doctors.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
