import { User, SignInCredentials, SignUpCredentials, ResetPasswordRequest, VerifyPhoneOtpRequest } from '../types/auth';
import { UserProfile } from '../types/user';
import { apiClient } from './apiClient';
import { supabase } from './supabaseClient';

const AUTH_USER_KEY = 'dermasense_auth_user';

const setSession = (user: any, rememberMe: boolean) => {
  if (rememberMe) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
};

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch {
      return null;
    }
  },

  async signIn(credentials: SignInCredentials): Promise<User> {
    const response = await apiClient.post('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    
    if (response.success && response.user) {
      const user = response.user;
      if (response.session) {
        await supabase.auth.setSession({
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token
        });
      }
      setSession(user, credentials.rememberMe !== false);
      return user;
    }
    throw new Error('Login failed');
  },

  async signUp(credentials: SignUpCredentials): Promise<User> {
    const response = await apiClient.post('/auth/signup', {
      email: credentials.email,
      password: credentials.password,
      full_name: credentials.fullName,
      phone: credentials.phone || ''
    });
    
    if (response.success && response.user) {
      const newUser = response.user;
      if (response.session) {
        await supabase.auth.setSession({
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token
        });
      }
      setSession(newUser, true);
      return newUser;
    }
    throw new Error('Signup failed');
  },

  async signOut(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (e) {
      console.warn("Logout endpoint error", e);
    } finally {
      localStorage.removeItem(AUTH_USER_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
      await supabase.auth.signOut();
    }
  },

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<User> {
    const response = await apiClient.put(`/profile/${userId}`, profileData);
    
    if (response.success && response.profile) {
      const current = await this.getCurrentUser();
      if (!current) throw new Error('Not authenticated');

      const updatedUser: User = {
        ...current,
        profile: response.profile
      };

      if (localStorage.getItem(AUTH_USER_KEY)) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      }

      return updatedUser;
    }
    throw new Error('Profile update failed');
  },

  async updateAccountDetails(userId: string, data: { fullName?: string; email?: string }): Promise<User> {
    return this.updateUserProfile(userId, { fullName: data.fullName, email: data.email } as any);
  },

  async resetPassword(request: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/reset-password', { email: request.email });
    return { success: true, message: response.message || `Reset link sent if an account exists for ${request.email}.` };
  },

  async sendPhoneOtp(phoneNumber: string): Promise<{ success: boolean; otp: string; message: string }> {
    return { success: true, otp: "123456", message: `Test OTP sent` };
  },
  
  async verifyPhoneOtp(request: VerifyPhoneOtpRequest): Promise<User> {
    throw new Error('Phone login is currently mocked. Please use email.');
  },

  async signInWithGoogle(customUser?: any): Promise<User> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) {
      throw new Error(error.message || 'Google login failed');
    }
    return new Promise(() => {}); // Doesn't resolve because of redirect
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    const response = await apiClient.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword });
    return response.success === true;
  },

  async deleteAccount(): Promise<void> {
    await this.signOut();
  }
};
