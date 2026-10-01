import { create } from 'zustand';
import { User } from '../types';
import { api } from '../utils/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setAuth: (user: User, accessToken: string) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthModalOpen: false,
  authModalTab: 'login',

  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  setAuth: (user: User, accessToken: string) => {
    localStorage.setItem('travelhub_access_token', accessToken);
    set({ user, isAuthenticated: true, isLoading: false, isAuthModalOpen: false });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('travelhub_access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      localStorage.removeItem('travelhub_access_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('travelhub_access_token');
      set({ user: null, isAuthenticated: false });
    }
  },
}));
