import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  showNotification: (type: NotificationType, title: string, message?: string, duration?: number) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showNotification = useCallback(
    (type: NotificationType, title: string, message?: string, duration: number = 4000) => {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      const newItem: NotificationItem = { id, type, title, message, duration };

      setNotifications((prev) => [...prev, newItem]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    [removeNotification]
  );

  const showSuccess = useCallback((title: string, message?: string) => {
    showNotification('success', title, message);
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string) => {
    showNotification('error', title, message);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message?: string) => {
    showNotification('info', title, message);
  }, [showNotification]);

  const showWarning = useCallback((title: string, message?: string) => {
    showNotification('warning', title, message);
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        removeNotification,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              n.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/30'
                : n.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-500/30'
                : n.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-500/30'
                : 'bg-slate-900/90 text-slate-100 border-brand-500/30'
            }`}
            role="alert"
          >
            <div className="flex-shrink-0 mt-0.5">
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {n.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-brand-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-5 text-white">{n.title}</h4>
              {n.message && (
                <p className="mt-0.5 text-xs text-slate-300 leading-relaxed break-words">{n.message}</p>
              )}
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-1 rounded-md"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
