'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import type { UserResponse } from '@/types/api';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, isLoading: true });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (token) {
      setState({
        token,
        user: user ? (JSON.parse(user) as UserResponse) : null,
        isLoading: false,
      });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken } = await authService.login({ email, password });
    localStorage.setItem('access_token', accessToken);
    setState((s) => ({ ...s, token: accessToken }));
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const user = await authService.register({ email, password, name });
    await login(email, password);
    localStorage.setItem('user', JSON.stringify(user));
    setState((s) => ({ ...s, user }));
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setState({ user: null, token: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        isAuthenticated: !!state.token,
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
