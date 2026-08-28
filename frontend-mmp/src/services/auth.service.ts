import apiClient from '@/lib/axios';
import type { ApiResponse, AuthResponse, UserResponse } from '@/types/api';

export const authService = {
  async register(data: { email: string; password: string; name?: string }): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  async me(): Promise<UserResponse> {
    const res = await apiClient.get<ApiResponse<UserResponse>>('/auth/me', {
      skipAuthRedirect: true,
    });
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', undefined, { skipAuthRedirect: true });
  },
};
