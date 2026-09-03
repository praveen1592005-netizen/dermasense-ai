import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Activity, UserCheck, FileText, Tag, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Skincare Analysis',
    description: 'Upload a photo and get a personalized AM/PM skincare routine, product categories, and skin type detection.',
    color: 'text-brand-500',
    bg: 'bg-brand-500/10',
    link: '/signup',
  },
  {
    icon: Activity,
    title: 'Skin Disease Screening',
    description: 'Complete a structured symptom profile with your image for AI-assisted screening and doctor referral guidance.',
    color: 'text-tealBrand-500',
    bg: 'bg-tealBrand-500/10',
    link: '/signup',
  },
  {
    icon: UserCheck,
    title: 'Doctor Consultation',
    description: 'Book verified dermatologist appointments — online, video, or in-person — with secure payment.',
    color: 'text-indigoBrand-500',
    bg: 'bg-indigoBrand-500/10',
    link: '/signup',
  },
  {
    icon: FileText,
    title: 'Clinical Reports',
    description: 'Every analysis generates a downloadable PDF report with observations, routines, and dietary guidance.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    link: '/signup',
  },
  {
    icon: Tag,
    title: 'Exclusive Coupons',
    description: 'Access discount coupons on premium plans and partner skincare product categories.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    link: '/signup',
  },
  {
    icon: CreditCard,
    title: 'Flexible Membership',
    description: 'Choose from Free, Premium, or Professional plans. Upgrade anytime as your needs grow.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    link: '/signup',
  },
];

const PLAN_HIGHLIGHTS = [
  { name: 'Free', price: '₹0', features: ['5 Analyses/month', 'Basic Reports', 'Product Browsing'], highlight: false },
  { name: 'Premium', price: '₹499/mo', features: ['25 Analyses/month', 'PDF Reports', 'Product Comparison', 'Coupons'], highlight: true },
  { name: 'Professional', price: '₹1,499/mo', features: ['Unlimited Analyses', 'Priority Booking', 'Family Profiles (4)', 'Dedicated Support'], highlight: false },
];

export const ServicesPreviewSection: React.FC = () => {
  return (
    <>
      {/* Services Grid */}
      <section id="services" className="py-20 bg-white dark:bg-darkBg-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
              Everything You Need for Skin Health
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              From AI analysis to doctor consultations — DermaSense AI covers your complete dermatology journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                to={f.link}
                className="group p-6 rounded-3xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-md transition-all"
              >
                <div className={`w-11 h-11 rounded-2xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {f.description}
                </p>
                <div className="flex items-center gap-1 mt-4 text-[11px] font-semibold text-brand-500 group-hover:gap-2 transition-all">
                  <span>Get started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Preview */}
      <section id="membership" className="py-20 bg-slate-50 dark:bg-darkBg-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
              Flexible Plans for Every User
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PLAN_HIGHLIGHTS.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-3xl border flex flex-col ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-brand-600 to-brand-700 border-brand-500 text-white shadow-xl shadow-brand-500/20'
                    : 'bg-white dark:bg-darkBg-850 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-amber-900 text-[11px] font-bold">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <p className={`text-sm font-bold ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {plan.name}
                  </p>
                  <p className={`text-2xl font-extrabold mt-1 ${plan.highlight ? 'text-white' : 'text-brand-600 dark:text-brand-400'}`}>
                    {plan.price}
                  </p>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlight ? 'text-brand-200' : 'text-emerald-500'}`} />
                      <span className={plan.highlight ? 'text-brand-100' : 'text-slate-600 dark:text-slate-400'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`mt-6 block text-center py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    plan.highlight
                      ? 'bg-white text-brand-600 hover:bg-brand-50'
                      : 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-950/50 border border-brand-200 dark:border-brand-800'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
