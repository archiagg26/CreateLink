import { create } from 'zustand';
import type { User } from '../types/index';
import * as authService from '../services/authService';

interface AuthStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, role: 'creator' | 'brand') => Promise<User>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const user = await authService.login(email, password);
    set({ currentUser: user, isAuthenticated: true });
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  register: async (email, password, role) => {
    const user = await authService.register(email, password, role);
    return user;
  },

  verifyEmail: async (token) => {
    const user = await authService.verifyEmail(token);
    set({ currentUser: user, isAuthenticated: true });
  },

  resendVerification: async (email) => {
    await authService.resendVerification(email);
  },

  resetPassword: async (email) => {
    await authService.resetPassword(email);
  },
}));
