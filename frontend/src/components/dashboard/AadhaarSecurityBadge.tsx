import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { AadhaarVerificationModal } from '../auth/AadhaarVerificationModal';

export interface AadhaarSecurityBadgeProps {
  className?: string;
  compact?: boolean;
}

export const AadhaarSecurityBadge: React.FC<AadhaarSecurityBadgeProps> = ({
  className = '',
  compact = false,
}) => {
  const { user, isAadhaarVerified, aadhaarMasked, refreshAadhaarStatus } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const userId = user?.id || 'usr_guest';

  if (isAadhaarVerified) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
        <span>Identity Verified ✓</span>
        {aadhaarMasked && !compact && (
          <span className="text-[10px] opacity-75 font-mono">({aadhaarMasked})</span>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`inline-flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs ${className}`}>
        <div className="flex items-center gap-1.5 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>Identity Verification Pending</span>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-xs"
        >
          Verify Now
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <AadhaarVerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          refreshAadhaarStatus?.();
        }}
        userId={userId}
      />
    </>
  );
};
