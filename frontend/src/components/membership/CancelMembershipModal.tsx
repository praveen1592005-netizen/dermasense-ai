import React, { useState } from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { UserSubscription, MembershipPlan } from '../../types/membership';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface CancelMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  plan: MembershipPlan;
  onConfirmCancel: () => Promise<void>;
}

export const CancelMembershipModal: React.FC<CancelMembershipModalProps> = ({
  isOpen,
  onClose,
  subscription,
  plan,
  onConfirmCancel,
}) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onConfirmCancel();
      onClose();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage & Cancel Membership"
      description="Review your plan benefits and cancellation terms."
      size="md"
    >
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Active Plan Retained Until Period End</span>
          </div>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/90">
            If you cancel today, you will still retain all {plan.name} features and entitlements until{' '}
            <strong>{formatDate(subscription.currentPeriodEnd)}</strong>. You will not be charged for future billing cycles.
          </p>
        </div>

        <div className="space-y-2">
          <h5 className="font-bold text-slate-900 dark:text-white text-xs">
            What happens after {formatDate(subscription.currentPeriodEnd)}:
          </h5>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <li>Your account will seamlessly transition to the complimentary Free plan.</li>
            <li>All your past reports, saved products, and progress photos will remain securely accessible.</li>
            <li>Monthly analysis limit will adjust to 5 per month.</li>
          </ul>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isCancelling}>
            Keep My Plan
          </Button>
          <Button variant="danger" onClick={handleCancel} isLoading={isCancelling}>
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </Modal>
  );
};
