import React from 'react';
import { Wrench, Clock } from 'lucide-react';
import { Logo } from '../../components/common/Logo';

export const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        <Logo size="lg" showTagline />

        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
          <Wrench className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            DermaSense AI is Under Maintenance
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            We are upgrading our platform to serve you better. Our clinical AI systems and consultation services will be back shortly.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-slate-300 text-xs space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-amber-400">
            <Clock className="w-4 h-4" />
            <span>Estimated Downtime: Under 30 Minutes</span>
          </div>
          <p className="text-slate-400">
            For medical emergencies, please contact your nearest hospital or call emergency services.
          </p>
        </div>
      </div>
    </div>
  );
};
