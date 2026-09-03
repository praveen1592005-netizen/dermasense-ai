import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Activity,
  Scan,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="home"
      className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden mesh-gradient-light dark:mesh-gradient-dark"
    >
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-tealBrand-500/10 dark:bg-tealBrand-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, Subtitle, Actions */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 dark:bg-brand-400/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-6 animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Digital Dermatology Platform</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
              AI-Powered Skin Health &{' '}
              <span className="bg-gradient-to-r from-brand-600 via-tealBrand-500 to-indigoBrand-500 bg-clip-text text-transparent">
                Personalized Care
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-8">
              Understand your skin, build better skincare habits, and receive personalized recommendations with intelligent AI-powered skin analysis.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full justify-center shadow-lg shadow-brand-500/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Get Started Free
                </Button>
              </Link>
              <Link to="/signin" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full justify-center"
                >
                  Sign In to Workspace
                </Button>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 w-full">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-tealBrand-500 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Privacy-First Design
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Dual Analysis Workflows
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigoBrand-500 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Protected User Sessions
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium AI Skin Scanning & Facial Analysis Interactive Visual */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Glowing Outer Card */}
              <div className="relative rounded-3xl p-6 sm:p-8 glass-panel border border-brand-500/20 shadow-2xl overflow-hidden">
                {/* AI Facial Scanner Silhouette & Grid */}
                <div className="relative aspect-square rounded-2xl bg-gradient-to-b from-slate-900 to-darkBg-950 border border-slate-700/60 overflow-hidden flex items-center justify-center p-4">
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 scanner-grid opacity-30" />

                  {/* Scanning Laser Beam */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-glow-md animate-scan z-20" />

                  {/* SVG AI Facial Node Topology */}
                  <div className="relative z-10 flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
                    <svg viewBox="0 0 200 200" className="w-full h-full text-brand-400">
                      <defs>
                        <linearGradient id="faceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0EA5E9" />
                          <stop offset="50%" stopColor="#14B8A6" />
                          <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                      </defs>

                      {/* Rotating Radar Crosshairs */}
                      <circle
                        cx="100"
                        cy="100"
                        r="85"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        className="opacity-40 animate-spin-slow origin-center"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeDasharray="8 4"
                        className="opacity-60"
                      />

                      {/* Geometric Face Contour */}
                      <polygon
                        points="100,25 145,55 160,105 140,155 100,178 60,155 40,105 55,55"
                        fill="none"
                        stroke="url(#faceGrad)"
                        strokeWidth="2"
                        className="opacity-70"
                      />

                      {/* Facial Feature Triangles & Node Network */}
                      <line x1="100" y1="25" x2="100" y2="178" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
                      <line x1="40" y1="105" x2="160" y2="105" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />

                      {/* Forehead / Eye / Cheek / Chin Sensors */}
                      <circle cx="100" cy="50" r="3.5" fill="#38BDF8" className="animate-ping" />
                      <circle cx="100" cy="50" r="3.5" fill="#38BDF8" />
                      <circle cx="75" cy="85" r="3" fill="#2DD4BF" />
                      <circle cx="125" cy="85" r="3" fill="#2DD4BF" />
                      <circle cx="100" cy="115" r="3" fill="#38BDF8" />
                      <circle cx="68" cy="130" r="3.5" fill="#818CF8" />
                      <circle cx="132" cy="130" r="3.5" fill="#818CF8" />
                      <circle cx="100" cy="155" r="3" fill="#2DD4BF" />

                      {/* Connector Lines */}
                      <polygon
                        points="75,85 100,50 125,85 100,115"
                        fill="rgba(14, 165, 233, 0.12)"
                        stroke="#38BDF8"
                        strokeWidth="1"
                        opacity="0.8"
                      />
                      <polygon
                        points="75,85 68,130 100,155 100,115"
                        fill="rgba(20, 184, 166, 0.1)"
                        stroke="#2DD4BF"
                        strokeWidth="1"
                        opacity="0.7"
                      />
                      <polygon
                        points="125,85 132,130 100,155 100,115"
                        fill="rgba(99, 102, 241, 0.1)"
                        stroke="#818CF8"
                        strokeWidth="1"
                        opacity="0.7"
                      />
                    </svg>
                  </div>

                  {/* Corner Targets */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-brand-400" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-brand-400" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-brand-400" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-brand-400" />

                  {/* Top Status Bar */}
                  <div className="absolute top-3 inset-x-8 flex items-center justify-between text-[10px] font-mono text-brand-300">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      AI SENSOR READY
                    </span>
                    <span>HD 1080P</span>
                  </div>
                </div>

                {/* Floating Metric Badge 1: Skincare Analysis */}
                <div className="absolute -bottom-3 -left-3 p-3.5 rounded-2xl glass-panel border border-brand-500/30 shadow-xl flex items-center gap-3 animate-float">
                  <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Skincare Routine
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Personalized Matching
                    </p>
                  </div>
                </div>

                {/* Floating Metric Badge 2: Disease Workflow */}
                <div className="absolute -top-3 -right-3 p-3.5 rounded-2xl glass-panel border border-tealBrand-500/30 shadow-xl flex items-center gap-3 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="p-2 rounded-xl bg-tealBrand-500/20 text-tealBrand-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Symptom Intake
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Structured Protocol
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
