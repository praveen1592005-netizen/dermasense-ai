import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Heart,
  FileText,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MedicalDisclaimerSection: React.FC = () => {
  return (
    <section id="medical-disclaimer" className="py-20 bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Important Medical Disclaimer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Your Safety Is Our Priority
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            DermaSense AI is an informational skin health platform. Please read the following before using any analysis feature.
          </p>
        </div>

        {/* Disclaimer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              icon: ShieldCheck,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
              title: 'Informational Use Only',
              text: 'DermaSense AI provides AI-assisted informational screening and personalized skincare guidance. It does NOT provide a definitive medical diagnosis or replace clinical medical examination.',
            },
            {
              icon: Heart,
              color: 'text-rose-400',
              bg: 'bg-rose-500/10 border-rose-500/20',
              title: 'Consult a Professional',
              text: 'Always consult a qualified, licensed dermatologist or physician for accurate diagnosis, treatment decisions, and before starting any new skincare or medical regimen.',
            },
            {
              icon: AlertTriangle,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10 border-amber-500/20',
              title: 'Emergency Notice',
              text: 'If you experience severe skin reactions, difficulty breathing, rapid swelling, or any life-threatening symptoms — call emergency services (112/911) immediately. Do not wait for AI results.',
            },
            {
              icon: FileText,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10 border-blue-500/20',
              title: 'AI Confidence Limitations',
              text: 'AI analysis results reflect pattern recognition from images and self-reported data. Confidence scores are NOT medical certainty. Low confidence or concerning results should always prompt professional review.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`p-5 rounded-2xl border ${card.bg} space-y-2.5`}
            >
              <div className="flex items-center gap-2">
                <card.icon className={`w-5 h-5 ${card.color} flex-shrink-0`} />
                <h3 className="text-sm font-bold text-white">{card.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>

        {/* Emergency Line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-rose-950/40 border border-rose-900/50">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Medical Emergency?</p>
              <p className="text-xs text-slate-400">
                Call <strong className="text-rose-300">112</strong> (India) or your local emergency services immediately.
              </p>
            </div>
          </div>
          <Link
            to="/signup"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors"
          >
            Get Started Safely <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Footer Disclaimer */}
        <p className="text-center text-[11px] text-slate-600 leading-relaxed max-w-3xl mx-auto">
          By using DermaSense AI, you acknowledge that the platform provides informational AI-assisted guidance only. DermaSense AI, its developers, and affiliated entities are not liable for health decisions made solely on the basis of AI analysis outputs. Medical conditions require evaluation by qualified healthcare professionals.
        </p>
      </div>
    </section>
  );
};
