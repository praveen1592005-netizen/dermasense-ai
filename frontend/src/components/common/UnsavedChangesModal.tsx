import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onStay: () => void;
  onDiscard: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onStay,
  onDiscard,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onStay}
      title={
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <span>Unsaved Changes</span>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          You have unsaved changes. Are you sure you want to leave without saving?
        </p>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onStay}>
            Stay & Keep Editing
          </Button>
          <Button variant="danger" size="md" onClick={onDiscard}>
            Discard Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};
