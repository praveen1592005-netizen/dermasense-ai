import React from 'react';
import { MessageSquareQuote, Users, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';

export const TestimonialPlaceholder: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-darkBg-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Community & Experience</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            User Stories & Clinical Feedback
          </h2>

          <Card
            variant="glass"
            className="p-8 sm:p-12 rounded-3xl border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center mt-8 relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/20 text-brand-500 flex items-center justify-center mb-5">
              <MessageSquareQuote className="w-8 h-8" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Real user experiences will appear here after launch.
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
              We are currently in active development. Verified reviews, community testimonials, and dermatologist case studies will be integrated once patient pilot studies conclude.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-tealBrand-500" />
              <span>Phase 1 Development Preview</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
