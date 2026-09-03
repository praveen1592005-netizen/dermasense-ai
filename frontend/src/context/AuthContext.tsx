import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, SignInCredentials, SignUpCredentials } from '../types/auth';
import { UserProfile } from '../types/user';
import { AadhaarVerificationStatus } from '../types/identity';
import { authService } from '../services/authService';
import { identityService } from '../services/identityService';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Aadhaar Identity Verification State
  aadhaarStatus: AadhaarVerificationStatus;
  isAadhaarVerified: boolean;
  aadhaarMasked: string | null;
  aadhaarVerifiedAt: string | null;
  showAadhaarPrompt: boolean;
  aadhaarPromptAction?: string;
  triggerAadhaarVerification: (actionName?: string) => void;
  dismissAadhaarPrompt: () => void;
  refreshAadhaarStatus: () => Promise<void>;
  // Auth actions
  signIn: (credentials: SignInCredentials) => Promise<User>;
  signInWithGoogle: (customUser?: { email?: string; name?: string; avatarUrl?: string }) => Promise<User>;
  sendPhoneOtp: (phoneNumber: string) => Promise<{ success: boolean; otp: string; message: string }>;
  verifyPhoneOtp: (phoneNumber: string, otp: string, rememberMe?: boolean) => Promise<User>;
  signUp: (credentials: SignUpCredentials) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<User>;
  updateAccount: (data: { fullName?: string; email?: string }) => Promise<User>;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Aadhaar Verification State
  const [aadhaarStatus, setAadhaarStatus] = useState<AadhaarVerificationStatus>('PENDING');
  const [isAadhaarVerified, setIsAadhaarVerified] = useState<boolean>(false);
  const [aadhaarMasked, setAadhaarMasked] = useState<string | null>(null);
  const [aadhaarVerifiedAt, setAadhaarVerifiedAt] = useState<string | null>(null);
  const [showAadhaarPrompt, setShowAadhaarPrompt] = useState<boolean>(false);
  const [aadhaarPromptAction, setAadhaarPromptAction] = useState<string | undefined>(undefined);

  const checkAndSetAadhaarState = useCallback(async (userId: string, shouldAutoPrompt = false) => {
    try {
      const record = await identityService.getStatus(userId);
      setAadhaarStatus(record.status);
      setIsAadhaarVerified(record.isVerified);
      setAadhaarMasked(record.maskedAadhaar || null);
      setAadhaarVerifiedAt(record.verifiedAt || null);

      if (shouldAutoPrompt && !record.isVerified) {
        const hasSkipped = identityService.hasSkippedInSession(userId);
        if (!hasSkipped) {
          setShowAadhaarPrompt(true);
        }
      }
    } catch (e) {
      console.error('Failed to fetch Aadhaar verification status', e);
    }
  }, []);

  const refreshAadhaarStatus = useCallback(async () => {
    if (user?.id) {
      await checkAndSetAadhaarState(user.id, false);
    }
  }, [user, checkAndSetAadhaarState]);

  const triggerAadhaarVerification = useCallback((actionName?: string) => {
    setAadhaarPromptAction(actionName);
    setShowAadhaarPrompt(true);
  }, []);

  const dismissAadhaarPrompt = useCallback(() => {
    setShowAadhaarPrompt(false);
    setAadhaarPromptAction(undefined);
    if (user?.id) {
      identityService.skipForSession(user.id);
    }
  }, [user]);

  // Initialize auth state from stored session on mount
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && isMounted) {
          // Fetch profile using token (apiClient will automatically await getAuthToken)
          const { apiClient } = await import('../services/apiClient');
          try {
            const res = await apiClient.get('/auth/me');
            if (res.success && res.user) {
              localStorage.setItem('dermasense_auth_user', JSON.stringify(res.user));
              setUser(res.user);
              if (res.user.id) {
                await checkAndSetAadhaarState(res.user.id, true);
              }
            }
          } catch (e) {
            console.error("Failed to fetch user after OAuth", e);
          }
        } else if (!session && isMounted) {
          // Fallback if not OAuth or token is wiped from Supabase but still in localStorage
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          if (currentUser?.id) {
            await checkAndSetAadhaarState(currentUser.id, true);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            const { apiClient } = await import('../services/apiClient');
            try {
              const res = await apiClient.get('/auth/me');
              if (res.success && res.user) {
                localStorage.setItem('dermasense_auth_user', JSON.stringify(res.user));
                setUser(res.user);
              }
            } catch(e) {}
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAadhaarVerified(false);
          setAadhaarStatus('PENDING');
          localStorage.removeItem('dermasense_auth_user');
          sessionStorage.removeItem('dermasense_auth_user');
        }
      }
    );

    const handleUnauthorized = () => {
      if (isMounted) {
        setUser(null);
        setIsAadhaarVerified(false);
        setAadhaarStatus('PENDING');
      }
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      subscription.unsubscribe();
    };
  }, [checkAndSetAadhaarState]);

  const signIn = useCallback(async (credentials: SignInCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.signIn(credentials);
      setUser(authenticatedUser);
      identityService.clearSessionSkip(authenticatedUser.id);
      await checkAndSetAadhaarState(authenticatedUser.id, true);
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  }, [checkAndSetAadhaarState]);

  const signInWithGoogle = useCallback(async (customUser?: { email?: string; name?: string; avatarUrl?: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.signInWithGoogle(customUser);
      setUser(authenticatedUser);
      identityService.clearSessionSkip(authenticatedUser.id);
      await checkAndSetAadhaarState(authenticatedUser.id, true);
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  }, [checkAndSetAadhaarState]);

  const sendPhoneOtp = useCallback(async (phoneNumber: string) => {
    return authService.sendPhoneOtp(phoneNumber);
  }, []);

  const verifyPhoneOtp = useCallback(async (phoneNumber: string, otp: string, rememberMe?: boolean): Promise<User> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.verifyPhoneOtp({ phoneNumber, otp, rememberMe });
      setUser(authenticatedUser);
      identityService.clearSessionSkip(authenticatedUser.id);
      await checkAndSetAadhaarState(authenticatedUser.id, true);
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  }, [checkAndSetAadhaarState]);

  const signUp = useCallback(async (credentials: SignUpCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const createdUser = await authService.signUp(credentials);
      setUser(createdUser);
      identityService.clearSessionSkip(createdUser.id);
      await checkAndSetAadhaarState(createdUser.id, true);
      return createdUser;
    } finally {
      setIsLoading(false);
    }
  }, [checkAndSetAadhaarState]);

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setIsAadhaarVerified(false);
      setAadhaarStatus('PENDING');
      setAadhaarMasked(null);
      setShowAadhaarPrompt(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return authService.resetPassword({ email });
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>): Promise<User> => {
    if (!user) throw new Error('Not authenticated');
    const updated = await authService.updateUserProfile(user.id, profileData);
    setUser(updated);
    return updated;
  }, [user]);

  const updateAccount = useCallback(async (data: { fullName?: string; email?: string }): Promise<User> => {
    if (!user) throw new Error('Not authenticated');
    const updated = await authService.updateAccountDetails(user.id, data);
    setUser(updated);
    return updated;
  }, [user]);

  const changePassword = useCallback(async (oldPass: string, newPass: string): Promise<boolean> => {
    return authService.changePassword(oldPass, newPass);
  }, []);

  const deleteAccount = useCallback(async (): Promise<void> => {
    await authService.deleteAccount();
    setUser(null);
    setIsAadhaarVerified(false);
    setAadhaarStatus('PENDING');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        aadhaarStatus,
        isAadhaarVerified,
        aadhaarMasked,
        aadhaarVerifiedAt,
        showAadhaarPrompt,
        aadhaarPromptAction,
        triggerAadhaarVerification,
        dismissAadhaarPrompt,
        refreshAadhaarStatus,
        signIn,
        signInWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        updateAccount,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

