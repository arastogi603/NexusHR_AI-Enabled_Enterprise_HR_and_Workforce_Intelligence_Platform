import { create } from 'zustand';

interface AuthUser {
  email: string;
  role: string;
  name?: string;
  mustChangePassword?: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setAuth: (token: string, refreshToken?: string | null, user?: AuthUser | null) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  user: typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  setAuth: (token, refreshToken, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
    set((state) => ({
      token,
      refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken,
      user: user !== undefined ? user : state.user,
      isAuthenticated: true,
    }));
  },
  updateUser: (partialUser) => {
    set((state) => {
      const updated = state.user ? { ...state.user, ...partialUser } : null;
      if (typeof window !== 'undefined' && updated) {
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return { user: updated };
    });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  }
}));
