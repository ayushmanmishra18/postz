import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

const secureStorage = {
  getItem: async (name: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(name);
    }
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
      return;
    }
    return SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
      return;
    }
    return SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: async (user, accessToken, refreshToken) => {
        await secureStorage.setItem('accessToken', accessToken);
        await secureStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      logout: async () => {
        await secureStorage.removeItem('accessToken');
        await secureStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);