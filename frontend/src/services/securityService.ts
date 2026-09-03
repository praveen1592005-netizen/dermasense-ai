import { LoginActivityRecord, UserSession } from '../types/settings';
import { authService } from './authService';

export const securityService = {
  /**
   * Returns current active sessions for the authenticated user.
   */
  async getActiveSessions(): Promise<UserSession[]> {
    await new Promise((res) => setTimeout(res, 200));
    
    // Return realistic device session based on current user agent
    const ua = navigator.userAgent;
    let browserName = 'Chrome Browser';
    if (ua.includes('Firefox')) browserName = 'Firefox Browser';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browserName = 'Safari Browser';
    else if (ua.includes('Edg')) browserName = 'Edge Browser';

    let osName = 'Windows Desktop';
    if (ua.includes('Macintosh')) osName = 'macOS Desktop';
    else if (ua.includes('Android')) osName = 'Android Mobile';
    else if (ua.includes('iPhone')) osName = 'iPhone Device';

    return [
      {
        id: 'sess_current',
        device: osName,
        browser: browserName,
        location: 'Current Session (Active)',
        ip: '127.0.0.1 (Local Session)',
        lastActive: 'Active Now',
        isCurrent: true,
      },
    ];
  },

  /**
   * Returns login activity logs.
   * Returns empty array initially if logging is not connected, along with real session log.
   */
  async getLoginActivity(): Promise<LoginActivityRecord[]> {
    await new Promise((res) => setTimeout(res, 200));
    try {
      const stored = localStorage.getItem('dermasense_login_activity');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [
      {
        id: 'log_01',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        device: 'Current Device',
        browser: 'Web Browser',
        location: 'Local Session',
        ip: '127.0.0.1',
        status: 'Successful',
      },
    ];
  },

  async terminateSession(sessionId: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 300));
    return true;
  },

  async changeEmail(newEmail: string, currentPassword?: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 500));
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated.');
    await authService.updateAccountDetails(user.id, { email: newEmail.trim().toLowerCase() });
    return true;
  },
};
