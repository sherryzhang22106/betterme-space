import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  account: string; // 手机号或邮箱
  nickname?: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: (user, token) => set({ user, token }),

      logout: () => set({ user: null, token: null }),

      isLoggedIn: () => !!get().token,
    }),
    {
      name: 'betterme-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
