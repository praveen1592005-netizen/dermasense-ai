import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <span>Delete Account Permanently</span>
        </div>
      }
      size="md"
    >
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200">
          <p className="font-bold mb-1">Warning: Irreversible Action</p>
          Deleting your account will permanently remove:
          <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs text-rose-700 dark:text-rose-300">
            <li>Your personal identity and profile information</li>
            <li>All skincare and skin disease analysis draft entries</li>
            <li>Saved routine recommendations and progress logs</li>
            <li>Membership status and session credentials</li>
          </ul>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            To confirm, please type <strong className="text-rose-600 dark:text-rose-400">DELETE</strong> in the box below:
          </label>
          <Input
            placeholder="Type DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isDeleting}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Permanently Delete Account
          </Button>
        </div>
      </div>
    </Modal>
  );
};
