import React from 'react';
import {
  Sparkles,
  Activity,
  HeartPulse,
  Stethoscope,
  FileText,
  Gift,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'Skincare Analysis',
      description: 'Analyze skin characteristics, hydration, concerns, and receive personalized skincare guidance tailored to your skin type.',
      badge: 'Core Feature',
      badgeVariant: 'brand' as const,
      color: 'text-brand-500 bg-brand-500/10 border-brand-500/20',
    },
    {
      icon: Activity,
      title: 'Skin Disease Analysis',
      description: 'Prepare for AI-assisted skin condition analysis using structured symptom intake and lesion image capture.',
      badge: 'Upcoming AI Model',
      badgeVariant: 'warning' as const,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
    {
      icon: HeartPulse,
      title: 'AI Recommendations',
      description: 'Personalized skincare routines, lifestyle adaptations, dietary suggestions, and daily habit coaching.',
      badge: 'Personalized',
      badgeVariant: 'teal' as const,
      color: 'text-tealBrand-500 bg-tealBrand-500/10 border-tealBrand-500/20',
    },
    {
      icon: Stethoscope,
      title: 'Doctor Consultation',
      description: 'Connect with certified dermatology professionals for clinical reviews, second opinions, and virtual consultations in future phases.',
      badge: 'Future Release',
      badgeVariant: 'neutral' as const,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: FileText,
      title: 'Smart Reports',
      description: 'Generate, track, and maintain comprehensive digital skin-health reports over time to monitor progress.',
      badge: 'Health Log',
      badgeVariant: 'indigo' as const,
      color: 'text-indigoBrand-500 bg-indigoBrand-500/10 border-indigoBrand-500/20',
    },
    {
      icon: Gift,
      title: 'Membership & Offers',
      description: 'Access future premium plans, priority analysis queues, product perks, and personalized skin wellness benefits.',
      badge: 'Tiers & Perks',
      badgeVariant: 'brand' as const,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Advanced Skin Health Architecture
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Everything you need for structured skincare routines and digital skin wellness tracking, engineered for future AI intelligence.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card
                key={idx}
                variant="default"
                hoverEffect
                className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-darkBg-850 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${feat.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant={feat.badgeVariant} size="sm">
                      {feat.badge}
                    </Badge>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2.5">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
