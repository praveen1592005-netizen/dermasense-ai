import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { SignInPage } from '../pages/auth/SignInPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { OnboardingPage } from '../pages/auth/OnboardingPage';

// Dashboard Pages
import { DashboardHomePage } from '../pages/dashboard/DashboardHomePage';
import { SkincareAnalysisPage } from '../pages/dashboard/SkincareAnalysisPage';
import { SkincareResultsPage } from '../pages/dashboard/SkincareResultsPage';
import { SkinDiseaseAnalysisPage } from '../pages/dashboard/SkinDiseaseAnalysisPage';

import { SkinProgressPage } from '../pages/dashboard/SkinProgressPage';
import { ReportsPage } from '../pages/dashboard/ReportsPage';
import { ReportDetailPage } from '../pages/dashboard/ReportDetailPage';
import { ProfilePage } from '../pages/dashboard/ProfilePage';
import { SettingsPage } from '../pages/dashboard/SettingsPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AIChatPage } from '../pages/dashboard/AIChatPage';
import { RoleGuard } from '../components/common/RoleGuard';
import { NotFoundPage } from '../pages/NotFoundPage';


export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Route */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Onboarding Flow (Protected) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Direct Skincare Analysis Routes */}
      <Route
        path="/skincare-analysis"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SkincareAnalysisPage />} />
        <Route path=":analysisId" element={<SkincareResultsPage />} />
      </Route>

      {/* Direct Skin Disease Analysis Routes */}
      <Route
        path="/skin-disease-analysis"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SkinDiseaseAnalysisPage />} />
        <Route path=":analysisId" element={<SkinDiseaseAnalysisPage />} />
      </Route>

      {/* Direct Progress Shortcut Routes */}

      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SkinProgressPage />} />
      </Route>

      {/* Direct Reports Shortcut Routes */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReportsPage />} />
        <Route path=":reportId" element={<ReportDetailPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHomePage />} />
        <Route path="skincare" element={<SkincareAnalysisPage />} />
        <Route path="skincare/:analysisId" element={<SkincareResultsPage />} />

        <Route path="progress" element={<SkinProgressPage />} />
        <Route path="disease" element={<SkinDiseaseAnalysisPage />} />
        <Route path="disease/:analysisId" element={<SkinDiseaseAnalysisPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/:reportId" element={<ReportDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="chat" element={<AIChatPage />} />
        <Route
          path="admin"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </RoleGuard>
          }
        />

      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
