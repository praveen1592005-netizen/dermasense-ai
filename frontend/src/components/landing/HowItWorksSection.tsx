import React from 'react';
import { UserPlus, Layers, UploadCloud, FileCheck, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: UserPlus,
      title: 'Create Your Profile',
      description: 'Provide basic information, select your skin concerns, and personalize your skin-health preferences.',
      color: 'bg-brand-500 text-white',
    },
    {
      step: '02',
      icon: Layers,
      title: 'Choose an Analysis',
      description: 'Select between Skincare Routine Analysis or Skin Condition & Symptom Intake based on your current need.',
      color: 'bg-tealBrand-500 text-white',
    },
    {
      step: '03',
      icon: UploadCloud,
      title: 'Upload & Analyze',
      description: 'Capture or upload high-resolution photos and log key symptom duration and lifestyle metrics.',
      color: 'bg-indigoBrand-500 text-white',
    },
    {
      step: '04',
      icon: FileCheck,
      title: 'Get Personalized Guidance',
      description: 'Receive AI-powered recommendations, routine steps, and trackable reports to optimize your skin health.',
      color: 'bg-emerald-500 text-white',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 bg-slate-100/50 dark:bg-darkBg-900/60 border-t border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
            Structured Workflow
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How DermaSense AI Works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            A seamless 4-step path from baseline profile to intelligent personalized guidance.
          </p>
        </div>

        {/* Steps Grid with Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="relative flex flex-col">
                <Card
                  variant="glass"
                  hoverEffect
                  className="flex-1 p-6 sm:p-7 rounded-3xl border-slate-200/80 dark:border-slate-800 relative z-10 flex flex-col justify-between"
                >
                  <div>
                    {/* Step Number & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${s.color}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-extrabold font-mono text-slate-300 dark:text-slate-700">
                        {s.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    <span>Phase Step {idx + 1} of 4</span>
                  </div>
                </Card>

                {/* Connecting Arrow for Desktop (between items) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-darkBg-800 border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-400 shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
