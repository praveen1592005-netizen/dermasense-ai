import React from 'react';
import { ShieldCheck, Lock, UserCheck, Server, AlertTriangle } from 'lucide-react';
import { Card } from '../common/Card';
import { MEDICAL_DISCLAIMER_TEXT } from '../../utils/constants';

export const SecuritySection: React.FC = () => {
  const securityPoints = [
    {
      icon: Lock,
      title: 'Secure Authentication',
      desc: 'Encrypted credentials, persistent secure tokens, and defensive session management.',
    },
    {
      icon: UserCheck,
      title: 'Protected User Sessions',
      desc: 'Route protection barriers ensuring private data is only accessible to verified accounts.',
    },
    {
      icon: ShieldCheck,
      title: 'Controlled Profile Access',
      desc: 'Strict isolation of user images, skin profiles, and historical questionnaire logs.',
    },
    {
      icon: Server,
      title: 'Privacy-Focused Architecture',
      desc: 'No storage of unnecessary government identification documents or sensitive personal identifiers in Phase 1.',
    },
  ];

  return (
    <section
      id="security"
      className="py-20 sm:py-28 bg-slate-900 text-white relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-tealBrand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold mb-3 border border-brand-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security & Ethical AI Compliance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Built on Privacy & Safety Standards
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Your skin health is private. Our architecture is engineered to safeguard your images, routine data, and consultation records.
          </p>
        </div>

        {/* Security Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {securityPoints.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-4 border border-brand-500/30">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Official Medical Disclaimer Banner Box */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-800/90 via-slate-850 to-slate-800/90 border border-amber-500/30 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                Official Medical Safety Disclaimer
              </h4>
              <blockquote className="text-sm text-slate-200 leading-relaxed font-medium">
                "{MEDICAL_DISCLAIMER_TEXT}"
              </blockquote>
              <p className="text-xs text-slate-400 mt-2">
                Always seek the advice of a qualified dermatologist or medical practitioner for persistent lesions, painful symptoms, or suspicious mole changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
