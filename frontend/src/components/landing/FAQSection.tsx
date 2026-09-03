import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What is DermaSense AI?',
      answer:
        'DermaSense AI is an AI-powered platform designed to support personalized skincare and skin-health guidance.',
    },
    {
      question: 'Can DermaSense AI diagnose skin diseases?',
      answer:
        'The platform is designed for future AI-assisted analysis, but AI output should not be treated as a confirmed medical diagnosis.',
    },
    {
      question: 'Can I upload a skin image?',
      answer:
        'The interface will support secure image upload and camera capture for future analysis.',
    },
    {
      question: 'Can I consult a doctor?',
      answer:
        'Doctor consultation functionality will be integrated in a future phase.',
    },
    {
      question: 'Is my account secure?',
      answer:
        'DermaSense AI uses an authentication architecture designed to protect user accounts and sessions.',
    },
  ];

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Find answers regarding our platform, safety policies, and roadmap.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={cn(
                  'rounded-2xl border transition-all duration-200 overflow-hidden',
                  isOpen
                    ? 'bg-white dark:bg-darkBg-850 border-brand-500/40 dark:border-brand-500/40 shadow-md'
                    : 'bg-white/60 dark:bg-darkBg-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={cn(
                      'p-1.5 rounded-lg transition-transform duration-200 text-slate-400',
                      isOpen
                        ? 'transform rotate-180 text-brand-500 bg-brand-500/10'
                        : 'bg-slate-100 dark:bg-darkBg-800'
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4 animate-fadeIn">
                    {faq.answer}
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
