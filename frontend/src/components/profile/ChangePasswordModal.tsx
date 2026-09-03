import React, { useState } from 'react';
import { KeyRound, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { PasswordStrengthMeter } from '../auth/PasswordStrengthMeter';
import { calculatePasswordStrength } from '../../utils/validation';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (oldPass: string, newPass: string) => Promise<void>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please complete all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    const strength = calculatePasswordStrength(newPassword);
    if (strength.score < 2) {
      setError('New password is too weak. Please use uppercase, lowercase, numbers, and symbols.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onSubmit(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Account Password"
      description="Update your password to keep your session and health records secure."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Current Password"
          placeholder="Enter current password"
          isPassword
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          disabled={isLoading}
        />

        <div>
          <Input
            label="New Password"
            placeholder="Create a strong new password"
            isPassword
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4" />}
            disabled={isLoading}
          />
          <PasswordStrengthMeter password={newPassword} />
        </div>

        <Input
          label="Confirm New Password"
          placeholder="Re-enter new password"
          isPassword
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          disabled={isLoading}
        />

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};
