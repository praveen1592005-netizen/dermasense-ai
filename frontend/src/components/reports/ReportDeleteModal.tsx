import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ReportDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  onConfirm: (id: string) => Promise<void>;
}

export const ReportDeleteModal: React.FC<ReportDeleteModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(reportId);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete this report?"
      description="This action may permanently remove the report from your account."
      size="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-rose-900 dark:text-rose-200">
            <span className="font-bold block">Permanent Deletion Safeguard</span>
            <p>
              Are you sure you want to permanently delete <strong>"{reportTitle}"</strong>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            Yes, Delete Report
          </Button>
        </div>
      </div>
    </Modal>
  );
};
