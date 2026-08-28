'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { registerUnauthorizedHandler } from '@/lib/axios';
import { authService } from '@/services/auth.service';
import type { UserResponse } from '@/types/api';

interface AuthState {
  user: UserResponse | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true });

  useEffect(() => {
    let isMounted = true;
    const unregister = registerUnauthorizedHandler(() => {
      if (isMounted) {
        setState({ user: null, isLoading: false });
      }
    });

    const loadSession = async () => {
      try {
        const user = await authService.me();

        if (isMounted) {
          setState({ user, isLoading: false });
        }
      } catch {
        if (isMounted) {
          setState({ user: null, isLoading: false });
        }
      }
    };

    void loadSession();

    return () => {
      isMounted = false;
      unregister();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authService.login({ email, password });
    setState({ user, isLoading: false });
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const { user } = await authService.register({ email, password, name });
    setState({ user, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setState({ user: null, isLoading: false });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        isAuthenticated: !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
