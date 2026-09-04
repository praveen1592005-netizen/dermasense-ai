import { UserProfile } from './user';

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  authProvider?: 'email' | 'google' | 'phone';
  phoneNumber?: string;
  profile?: UserProfile;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  phone?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
