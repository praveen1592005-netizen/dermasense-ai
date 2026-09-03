import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { AadhaarSecurityBadge } from './AadhaarSecurityBadge';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface DashboardNavbarProps {
  onToggleSidebar: () => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onToggleSidebar }) => {
  const { user, signOut } = useAuth();
  const { showInfo } = useNotification();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    {
      id: '1',
      title: 'Welcome to DermaSense AI',
      desc: 'Complete your skin profile to tailor upcoming AI recommendations.',
      time: 'Just now',
      unread: true,
    },
    {
      id: '2',
      title: 'Phase 1 Active',
      desc: 'Explore Skincare and Disease Analysis workflow preview modules.',
      time: '1 hour ago',
      unread: false,
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      showInfo('Signed out', 'You have been safely signed out.');
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left section: Hamburger button & Quick Search / Workspace Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-darkBg-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-tealBrand-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Phase 1</span>
          <span>•</span>
          <span>AI Health Workspace</span>
        </div>
      </div>

      {/* Right Section: Aadhaar Badge, Theme Toggle, Notifications, User Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <div className="hidden md:block">
          <AadhaarSecurityBadge compact />
        </div>
        <ThemeToggle size="md" />

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-800 focus:outline-none transition-colors border border-slate-200/60 dark:border-slate-700/60"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-darkBg-900" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 animate-scaleUp">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Notifications
                    </h4>
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-brand-500/10 text-brand-500">
                      2 New
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-darkBg-900/80 border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {n.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-darkBg-800 transition-colors focus:outline-none"
            aria-label="User menu"
          >
            {user?.profile?.avatarUrl ? (
              <img
                src={user.profile.avatarUrl}
                alt={user.fullName}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-brand-500 to-tealBrand-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs">
                {getInitials(user?.fullName)}
              </div>
            )}
            <span className="hidden md:inline-block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
              {user?.fullName || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 animate-scaleUp">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <Link
                  to="/dashboard/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-800"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/dashboard/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-800"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </Link>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
