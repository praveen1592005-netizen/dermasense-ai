import React from 'react';
import { Cpu, Sparkles, Shield, Stethoscope } from 'lucide-react';
import { Card } from '../common/Card';

export const TrustSection: React.FC = () => {
  const trustPillars = [
    {
      icon: Cpu,
      title: 'AI-Powered Analysis',
      description: 'Structured algorithms designed to process skin characteristics and symptom markers efficiently.',
      color: 'text-brand-500 bg-brand-500/10 border-brand-500/20',
    },
    {
      icon: Sparkles,
      title: 'Personalized Recommendations',
      description: 'Tailored skincare routines, ingredient matching, food suggestions, and habit coaching.',
      color: 'text-tealBrand-500 bg-tealBrand-500/10 border-tealBrand-500/20',
    },
    {
      icon: Shield,
      title: 'Secure User Experience',
      description: 'Session isolation, privacy-conscious data handling, and protected account credentials.',
      color: 'text-indigoBrand-500 bg-indigoBrand-500/10 border-indigoBrand-500/20',
    },
    {
      icon: Stethoscope,
      title: 'Future Doctor Consultation',
      description: 'Architecture ready to connect certified dermatologists for professional human clinical care.',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-darkBg-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
            Trusted Platform Foundations
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Designed for smarter skin-health decisions
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            A digital healthcare architecture combining machine intelligence with user-centered skin wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={idx}
                variant="glass"
                hoverEffect
                className="flex flex-col p-6 rounded-2xl border-slate-200/80 dark:border-slate-800"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${pillar.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
