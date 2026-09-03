import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Activity,
  ShoppingBag,
  TrendingUp,
  FileText,
  UserCheck,
  Calendar,
  CreditCard,
  Tag,
  User,
  Settings,
  LogOut,
  X,
  Shield,
  MessageCircle,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const { showInfo } = useNotification();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Skincare Analysis', to: '/dashboard/skincare', icon: Sparkles },
    { label: 'Skin Disease Analysis', to: '/dashboard/disease', icon: Activity },
    { label: 'AI Chat Assistant', to: '/dashboard/chat', icon: MessageCircle, badge: 'New' },
    { label: 'Products & Stores', to: '/dashboard/products', icon: ShoppingBag },
    { label: 'Skin Progress', to: '/dashboard/progress', icon: TrendingUp },
    { label: 'Smart Reports', to: '/dashboard/reports', icon: FileText },
    { label: 'Membership & Plans', to: '/dashboard/membership', icon: CreditCard },
    { label: 'My Coupons', to: '/dashboard/coupons', icon: Tag },
    { label: 'My Profile', to: '/dashboard/profile', icon: User },
    { label: 'Settings', to: '/dashboard/settings', icon: Settings },
  ];


  const handleSignOut = async () => {
    try {
      await signOut();
      showInfo('Signed out successfully', 'You have been safely logged out of your session.');
      navigate('/');
    } catch (err) {
      console.error('Sign out error', err);
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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-darkBg-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top Branding Section */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <Logo size="md" showTagline />
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-xs border border-brand-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-darkBg-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-darkBg-750 text-slate-500 dark:text-slate-400 group-hover:text-brand-500">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Account & Sign Out Section */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-darkBg-950/50">
          <div className="flex items-center gap-3 p-2 rounded-xl mb-2">
            {user?.profile?.avatarUrl ? (
              <img
                src={user.profile.avatarUrl}
                alt={user.fullName}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-tealBrand-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {getInitials(user?.fullName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.fullName || 'User'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
