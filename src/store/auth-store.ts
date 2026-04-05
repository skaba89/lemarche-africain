import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  role: string;
  createdAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  register: (data: { email: string; name: string; phone?: string; password: string }) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; city?: string; address?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Erreur de connexion');
          }

          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return data.user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: { email: string; name: string; phone?: string; password: string }) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await res.json();

          if (!res.ok) {
            throw new Error(result.error || 'Erreur lors de l\'inscription');
          }

          // Auto-login after registration
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email, password: data.password }),
          });

          const loginData = await loginRes.json();

          if (loginRes.ok && loginData.user) {
            set({ user: loginData.user, isAuthenticated: true, isLoading: false });
            return loginData.user;
          }

          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
          // Ignore errors, still clear local state
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      checkAuth: async () => {
        const { user } = get();
        // If we have a persisted user, try to verify the session
        if (user) {
          try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
              const data = await res.json();
              set({ user: data.user, isAuthenticated: true, isLoading: false });
              return;
            }
          } catch {
            // Session invalid, clear it
          }
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      updateProfile: async (data: { name?: string; phone?: string; city?: string; address?: string }) => {
        const { user } = get();
        if (!user) return;

        // Update local state optimistically
        const updatedUser = { ...user, ...data };
        set({ user: updatedUser });

        // Also persist to localStorage profile key for backwards compat
        try {
          const existing = localStorage.getItem('le-marche-profile');
          const parsed = existing ? JSON.parse(existing) : {};
          localStorage.setItem('le-marche-profile', JSON.stringify({ ...parsed, ...data }));
        } catch {
          // Ignore
        }
      },
    }),
    {
      name: 'le-marche-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
