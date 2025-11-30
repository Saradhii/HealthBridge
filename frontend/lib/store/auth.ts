import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api';
import type { AuthState, User, RegisterHospitalRequest, Tenant } from '../types';
import { isTokenExpired, isValidTokenStructure } from '../jwt';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setTokens: (accessToken: string, refreshToken: string, user: User, tenant?: Tenant) => {
        set({
          accessToken,
          refreshToken,
          user,
          tenant: tenant || null,
          isAuthenticated: true,
        });
      },

      login: async (email: string, password: string) => {
        const response = await apiClient.login({ email, password });
        set({
          user: response.user,
          tenant: response.tenant || null,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });
      },

      register: async (data: RegisterHospitalRequest) => {
        const response = await apiClient.registerHospital(data);
        set({
          user: response.user,
          tenant: response.tenant,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        const { refreshToken } = get();
        if (refreshToken) {
          apiClient.logout(refreshToken).catch(() => {});
        }
        set({
          user: null,
          tenant: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          tenant: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await apiClient.refreshToken(refreshToken);
          set({
            accessToken: response.accessToken,
          });
          return response.accessToken;
        } catch (error) {
          // Clear auth state on refresh failure
          get().clearAuth();
          throw error;
        }
      },

      hydrate: () => {
        const state = get();

        // Validate tokens on hydration
        if (state.accessToken && state.refreshToken && state.user) {
          // Check if access token is valid and not expired
          const isAccessTokenValid = isValidTokenStructure(state.accessToken) &&
                                      !isTokenExpired(state.accessToken);

          if (isAccessTokenValid) {
            // Token is valid, user is authenticated
            set({ isAuthenticated: true });
          } else {
            // Access token is expired or invalid
            // We'll try to refresh it automatically when needed
            // For now, mark as authenticated if refresh token exists
            set({ isAuthenticated: true });
          }

          // Note: Tenant info might not be available for existing users
          // It will be populated when they login again after the backend update
        } else {
          // Missing required auth data, clear everything
          get().clearAuth();
        }
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Validate tokens when rehydrating from storage
          state.hydrate();
          state.setHasHydrated(true);
        }
      },
    }
  )
);
