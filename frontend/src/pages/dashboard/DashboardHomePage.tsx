import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Activity,
  FileText,
  CreditCard,
  User,
  Settings,
  ShoppingBag,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getGreeting } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { PrimaryServiceCard } from '../../components/dashboard/PrimaryServiceCard';
import { StatusCard } from '../../components/dashboard/StatusCard';
import { QuickActionCard } from '../../components/dashboard/QuickActionCard';
import { analysisHistoryService } from '../../services/analysisHistoryService';
import { membershipService } from '../../services/membershipService';
import { reportService } from '../../services/reportService';

export const DashboardHomePage: React.FC = () => {
  const { user, isAadhaarVerified, triggerAadhaarVerification } = useAuth();
  const greeting = getGreeting();

  const isProfileComplete = Boolean(user?.profile?.isProfileCompleted);
  const userId = user?.id || 'usr_guest';

  // Real data state
  const [analysisCount, setAnalysisCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [membershipLabel, setMembershipLabel] = useState('Free Plan');
  const [latestSkinType, setLatestSkinType] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyses, subscription, reports] = await Promise.all([
          analysisHistoryService.getUserAnalyses(userId),
          membershipService.getUserSubscription(userId),
          reportService.getReports(userId),
        ]);

        setAnalysisCount(analyses.length);
        setReportCount(reports.length);

        const planMap: Record<string, string> = {
          free: 'Free Plan',
          premium: 'Premium Plan',
          professional: 'Professional Plan',
        };
        setMembershipLabel(planMap[subscription.planId] || 'Free Plan');

        if (analyses.length > 0) {
          setLatestSkinType(analyses[0].detectedSkinType || null);
        }

      } catch {
        // Silent fail — defaults remain
      }
    };
    loadData();
  }, [userId]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Personalized Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {greeting}, {user?.fullName || 'User'} 👋
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Your personalized skin-health workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {latestSkinType && (
            <div className="px-3.5 py-1.5 rounded-xl bg-tealBrand-50 dark:bg-tealBrand-950/30 border border-tealBrand-200 dark:border-tealBrand-900/50 text-xs font-semibold text-tealBrand-700 dark:text-tealBrand-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Skin Type: {latestSkinType}</span>
            </div>
          )}
          <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Workspace Active</span>
          </div>
        </div>
      </div>

      {/* Identity Verification Security Banner if pending */}
      {!isAadhaarVerified && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Identity Verification Pending
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Recommended
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Verify your Aadhaar-linked identity to protect health records.
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => triggerAadhaarVerification()}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            className="flex-shrink-0"
          >
            Verify Now
          </Button>
        </div>
      )}

      {/* TWO PRIMARY SERVICES */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Core AI Services
          </h2>
          <span className="text-xs text-slate-400">Select an analysis workflow</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <PrimaryServiceCard
            id="skincare"
            title="Skincare Analysis"
            description="Upload a photo, describe your skin concerns, and get a personalized morning & evening skincare routine with product categories."
            icon={Sparkles}
            badgeText="Personalized Routine"
            badgeVariant="brand"
            capabilities={['Skin Type Detection', 'Routine Builder', 'Products', 'Food & Lifestyle']}
            to="/dashboard/skincare"
            buttonText="Start Skincare Analysis"
            gradientTheme="brand"
          />

          <PrimaryServiceCard
            id="disease"
            title="Skin Disease Analysis"
            description="Upload affected skin images, complete a structured symptom profile, and get screening guidance with doctor referral if needed."
            icon={Activity}
            badgeText="Symptom Screening"
            badgeVariant="warning"
            capabilities={['Image Upload', 'Symptom Profile', 'AI Screening', 'Doctor Referral']}
            to="/dashboard/disease"
            buttonText="Start Skin Disease Analysis"
            gradientTheme="teal"
          />
        </div>
      </div>

      {/* REAL-DATA STATUS CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Account Status & Records
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatusCard
            title="Skin Profile"
            value={isProfileComplete ? 'Profile Active' : 'Incomplete'}
            statusType={isProfileComplete ? 'success' : 'warning'}
            icon={User}
            description={
              isProfileComplete
                ? `${latestSkinType ? `${latestSkinType} skin. ` : ''}Preferences and concerns recorded.`
                : 'Complete your profile to tailor recommendations.'
            }
            actionText={isProfileComplete ? 'Edit Profile' : 'Complete Profile'}
            actionTo="/dashboard/profile"
          />

          <StatusCard
            title="Analyses"
            value={analysisCount > 0 ? `${analysisCount} Complete` : 'None yet'}
            statusType={analysisCount > 0 ? 'success' : 'info'}
            icon={Sparkles}
            description={
              analysisCount > 0
                ? `${analysisCount} skincare analysis${analysisCount !== 1 ? 'es' : ''} saved to your account.`
                : 'Run your first skincare analysis to get started.'
            }
            actionText="Run Analysis"
            actionTo="/dashboard/skincare"
          />

          <StatusCard
            title="Membership"
            value={membershipLabel}
            statusType={membershipLabel !== 'Free Plan' ? 'success' : 'info'}
            icon={CreditCard}
            description={
              membershipLabel !== 'Free Plan'
                ? 'Premium features active on your account.'
                : 'Upgrade to unlock advanced analysis and reports.'
            }
            actionText="Manage Membership"
            actionTo="/dashboard/membership"
          />
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Product Recommendations"
            description="Explore AI-matched products with multi-store pricing"
            icon={ShoppingBag}
            to="/dashboard/products"
            color="brand"
          />
          <QuickActionCard
            title="Skin Progress Tracking"
            description="Interactive before/after split slider & check-ins"
            icon={TrendingUp}
            to="/dashboard/progress"
            color="teal"
          />
          <QuickActionCard
            title="AI Chat Assistant"
            description="Ask DermaBot about your reports or skincare routines"
            icon={MessageCircle}
            to="/dashboard/chat"
            color="indigo"
            badge="New"
          />
          <QuickActionCard
            title="View Smart Reports"
            description={`${reportCount} report${reportCount !== 1 ? 's' : ''} in your health archive`}
            icon={FileText}
            to="/dashboard/reports"
            color="slate"
          />
          <QuickActionCard
            title="Membership & Plans"
            description={`Current: ${membershipLabel}`}
            icon={CreditCard}
            to="/dashboard/membership"
            color="slate"
          />
          <QuickActionCard
            title="Profile Details"
            description="Update your skin type, age, and language"
            icon={User}
            to="/dashboard/profile"
            color="brand"
          />
          <QuickActionCard
            title="Settings & Privacy"
            description="Manage appearance, notifications, and data"
            icon={Settings}
            to="/dashboard/settings"
            color="slate"
          />
        </div>
      </div>
    </div>
  );
};
