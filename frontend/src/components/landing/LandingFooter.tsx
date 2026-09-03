import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Modal } from '../common/Modal';
import { MEDICAL_DISCLAIMER_TEXT } from '../../utils/constants';

export const LandingFooter: React.FC = () => {
  const [legalModal, setLegalModal] = useState<{ title: string; content: string } | null>(null);

  const openLegalModal = (title: string, content: string) => {
    setLegalModal({ title, content });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column (Span 2) */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <Logo size="lg" showTagline clickable={false} className="text-white" />
              <p className="mt-4 text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
                DermaSense AI is an advanced digital healthcare platform engineered to provide intelligent skincare routines, symptom intake, and personalized skin health guidance.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-amber-400 block mb-1">
                Medical Notice:
              </span>
              {MEDICAL_DISCLAIMER_TEXT}
            </div>
          </div>

          {/* Column 1: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <Link to="/dashboard/skincare" className="hover:text-white transition-colors">
                  Skincare Analysis
                </Link>
              </li>
              <li>
                <Link to="/dashboard/disease" className="hover:text-white transition-colors">
                  Skin Disease Analysis
                </Link>
              </li>
              <li>
                <Link to="/dashboard/reports" className="hover:text-white transition-colors">
                  Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/dashboard/doctors" className="hover:text-white transition-colors">
                  Doctors (Upcoming)
                </Link>
              </li>
              <li>
                <Link to="/dashboard/membership" className="hover:text-white transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link to="/dashboard/membership" className="hover:text-white transition-colors">
                  Personalized Offers
                </Link>
              </li>
              <li>
                <a href="#comparison" className="hover:text-white transition-colors">
                  Workflow Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Account & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Account & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/dashboard/profile" className="hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/dashboard/settings" className="hover:text-white transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <Link to="/signin" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    openLegalModal(
                      'Privacy Policy',
                      'DermaSense AI is committed to protecting user privacy. In Phase 1, data is processed locally with zero third-party tracking, identity document requests, or data monetization.'
                    )
                  }
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    openLegalModal(
                      'Terms of Service',
                      'By using DermaSense AI, you agree that recommendations are informational and do not constitute formal medical diagnoses. Always consult licensed medical professionals for clinical conditions.'
                    )
                  }
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DermaSense AI. All rights reserved.</p>
          <p className="text-[11px] text-slate-500">
            DermaSense AI v8.0.0 • Complete Platform with AI Analysis, Reports, Doctor Booking & Membership
          </p>

        </div>
      </div>

      {/* Legal Info Modal */}
      {legalModal && (
        <Modal
          isOpen={true}
          onClose={() => setLegalModal(null)}
          title={legalModal.title}
        >
          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
            <p>{legalModal.content}</p>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-darkBg-900 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Medical Disclaimer:
              </span>
              {MEDICAL_DISCLAIMER_TEXT}
            </div>
          </div>
        </Modal>
      )}
    </footer>
  );
};
