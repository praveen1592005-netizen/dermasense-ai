import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { profileService } from '../../services/profileService';
import { securityService } from '../../services/securityService';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileCompletion } from '../../components/profile/ProfileCompletion';
import { PersonalInfoCard } from '../../components/profile/PersonalInfoCard';
import { ContactInfoCard } from '../../components/profile/ContactInfoCard';
import { SkinProfileCard } from '../../components/profile/SkinProfileCard';

import { ProfileHealthSnapshot } from '../../components/profile/ProfileHealthSnapshot';
import { RecentActivityCard } from '../../components/profile/RecentActivityCard';
import { AccountInfoCard } from '../../components/profile/AccountInfoCard';
import { ProfileEditModal } from '../../components/profile/ProfileEditModal';
import { ChangePasswordModal } from '../../components/profile/ChangePasswordModal';
import { ChangeEmailModal } from '../../components/profile/ChangeEmailModal';
import { DeleteAccountModal } from '../../components/profile/DeleteAccountModal';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, updateAccount, changePassword, deleteAccount } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Dynamic profile completion
  const completionReport = profileService.calculateCompletion(user);

  // Handlers
  const handleSaveProfileData = async (updatedData: any) => {
    if (!user) return;
    try {
      if (updatedData.fullName) {
        await updateAccount({ fullName: updatedData.fullName });
      }
      if (updatedData.profile) {
        await updateProfile(updatedData.profile);
      }
      showSuccess('Profile Saved', 'Your profile information has been updated.');
    } catch (err: any) {
      showError('Save Failed', err.message || 'Unable to update profile.');
      throw err;
    }
  };

  const handleAvatarChange = async (newUrl: string | null) => {
    if (!user) return;
    try {
      await updateProfile({ avatarUrl: newUrl || undefined });
    } catch (err: any) {
      showError('Avatar Error', err.message || 'Failed to update avatar.');
    }
  };

  const handleChangePassword = async (oldPass: string, newPass: string) => {
    try {
      await changePassword(oldPass, newPass);
      showSuccess('Password Updated', 'Your account credentials have been updated.');
    } catch (err: any) {
      throw err;
    }
  };

  const handleChangeEmail = async (newEmail: string, currentPass?: string) => {
    if (!user) return;
    try {
      await securityService.changeEmail(newEmail, currentPass);
      await updateAccount({ email: newEmail });
      showSuccess('Email Updated', `Account email updated to ${newEmail}.`);
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      showInfo('Account Erased', 'Your account and local intake data have been permanently removed.');
      navigate('/');
    } catch (err: any) {
      showError('Delete Failed', err.message || 'Unable to process account deletion.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn pb-12">
      <PageHeader
        title="Personal Profile & Clinical Baseline"
        subtitle="Manage your identity, structured address, skin characteristics, and sensitive data protection."
        badge={
          <Badge variant="brand" size="md">
            Verified Profile
          </Badge>
        }
      />

      {/* Profile Header Card */}
      <ProfileHeader
        user={user}
        onEditClick={() => setEditModalOpen(true)}
        onChangePasswordClick={() => setPasswordModalOpen(true)}
        onAvatarChange={handleAvatarChange}
      />

      {/* Two-Column Layout on Desktop (Section 28) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Core Identity & Health Baseline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <PersonalInfoCard user={user} onEditClick={() => setEditModalOpen(true)} />
          <ContactInfoCard user={user} onEditClick={() => setEditModalOpen(true)} />
          <SkinProfileCard user={user} onEditClick={() => setEditModalOpen(true)} />
        </div>

        {/* Right Column: Status, Completion, Health Snapshot, Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ProfileCompletion
            report={completionReport}
            onEditClick={() => setEditModalOpen(true)}
          />
          <ProfileHealthSnapshot
            user={user}
            onStartAnalysis={(type) => navigate(type === 'skincare' ? '/skincare-analysis' : '/skin-disease-analysis')}
          />
          <RecentActivityCard activities={[]} />
          <AccountInfoCard
            user={user}
            onChangeEmailClick={() => setEmailModalOpen(true)}
            onDeleteAccountClick={() => setDeleteModalOpen(true)}
          />
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        onSave={handleSaveProfileData}
      />

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
