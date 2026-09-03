import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { validateEmail } from '../../utils/validation';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSubmit: (newEmail: string, currentPassword?: string) => Promise<void>;
}

export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  onSubmit,
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setError('Please enter a new email address.');
      return;
    }

    if (!validateEmail(newEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (newEmail.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setError('New email must be different from current email.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onSubmit(newEmail.trim(), password);
      setNewEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Registered Email"
      description="Update your login email address. Re-authentication may be required."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/60 dark:border-slate-800 text-xs">
          <span className="text-slate-400 block mb-0.5">Current Email:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{currentEmail}</span>
        </div>

        <Input
          label="New Email Address"
          type="email"
          placeholder="new.email@example.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          disabled={isLoading}
        />

        <Input
          label="Current Password (Re-authentication)"
          type="password"
          placeholder="Enter current password"
          isPassword
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          disabled={isLoading}
        />

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Confirm Email Change
          </Button>
        </div>
      </form>
    </Modal>
  );
};
