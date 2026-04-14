// Auth types for Weespas

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type LoginMethod = 'phone' | 'email';

export interface LoginCredentials {
  email?: string;
  password?: string;
  phone?: string;
}

export interface OtpPayload {
  phone: string;
  otp: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
}
