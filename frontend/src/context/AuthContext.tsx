import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, SignInCredentials, SignUpCredentials } from '../types/auth';
import { UserProfile } from '../types/user';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Auth actions
  signIn: (credentials: SignInCredentials) => Promise<User>;
  signInWithGoogle: (customUser?: { email?: string; name?: string; avatarUrl?: string }) => Promise<User>;
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
                // Identity logic removed
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
            // Identity logic removed
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
          localStorage.removeItem('dermasense_auth_user');
          sessionStorage.removeItem('dermasense_auth_user');
        }
      }
    );

    const handleUnauthorized = () => {
        setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (credentials: SignInCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.signIn(credentials);
      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async (customUser?: { email?: string; name?: string; avatarUrl?: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.signInWithGoogle(customUser);
      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  }, []);



  const signUp = useCallback(async (credentials: SignUpCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const createdUser = await authService.signUp(credentials);
      setUser(createdUser);
      return createdUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
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
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        signIn,
        signInWithGoogle,
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

