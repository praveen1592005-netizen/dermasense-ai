import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { securityService } from '../../services/securityService';
import { SettingsSidebarNav, SettingsTab } from '../../components/settings/SettingsSidebarNav';
import { AppearanceSettings } from '../../components/settings/AppearanceSettings';
import { LanguageSettings } from '../../components/settings/LanguageSettings';
import { NotificationSettings } from '../../components/settings/NotificationSettings';
import { PrivacySettings } from '../../components/settings/PrivacySettings';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { AccountSettings } from '../../components/settings/AccountSettings';
import { ChangePasswordModal } from '../../components/profile/ChangePasswordModal';
import { ChangeEmailModal } from '../../components/profile/ChangeEmailModal';
import { DeleteAccountModal } from '../../components/profile/DeleteAccountModal';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateAccount, changePassword, deleteAccount } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  // Modals
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleChangePassword = async (oldPass: string, newPass: string) => {
    try {
      await changePassword(oldPass, newPass);
      showSuccess('Password Updated', 'Your credentials have been securely updated.');
    } catch (err: any) {
      throw err;
    }
  };

  const handleChangeEmail = async (newEmail: string, currentPass?: string) => {
    if (!user) return;
    try {
      await securityService.changeEmail(newEmail, currentPass);
      await updateAccount({ email: newEmail });
      showSuccess('Email Updated', `Primary account email changed to ${newEmail}.`);
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      showInfo('Account Deleted', 'All profile records have been permanently cleared.');
      navigate('/');
    } catch (err: any) {
      showError('Delete Failed', err.message || 'Unable to delete account.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn pb-12">
      <PageHeader
        title="Workspace Preferences & Settings"
        subtitle="Manage appearance themes, international localization, notification channels, security, and data privacy."
      />

      {/* Tabbed Layout: Sidebar on Desktop, Stacked Horizontal Nav on Mobile (Section 29) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 sticky top-24">
          <SettingsSidebarNav activeTab={activeTab} onSelectTab={setActiveTab} />
        </div>

        {/* Content Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'language' && <LanguageSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'privacy' && (
            <PrivacySettings onDeleteAccountClick={() => setDeleteModalOpen(true)} />
          )}
          {activeTab === 'security' && (
            <SecuritySettings
              onChangePasswordClick={() => setPasswordModalOpen(true)}
            />
          )}
          {activeTab === 'account' && (
            <AccountSettings
              user={user}
              onChangeEmailClick={() => setEmailModalOpen(true)}
              onDeleteAccountClick={() => setDeleteModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />

      {/* Change Email Modal */}
      <ChangeEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        currentEmail={user?.email || ''}
        onSubmit={handleChangeEmail}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirmDelete={handleDeleteAccount}
      />
    </div>
  );
};
