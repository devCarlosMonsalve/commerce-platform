import apiClient from '@/lib/axios';
import type { ApiResponse, OrganizationResponse } from '@/types/api';

export const organizationsService = {
  async list(): Promise<OrganizationResponse[]> {
    const res = await apiClient.get<ApiResponse<OrganizationResponse[]>>('/organizations');
    return res.data.data;
  },

  async get(orgId: string): Promise<OrganizationResponse> {
    const res = await apiClient.get<ApiResponse<OrganizationResponse>>(`/organizations/${orgId}`);
    return res.data.data;
  },

  async create(data: { name: string; slug: string }): Promise<OrganizationResponse> {
    const res = await apiClient.post<ApiResponse<OrganizationResponse>>('/organizations', data);
    return res.data.data;
  },

  async update(orgId: string, data: { name?: string; slug?: string }): Promise<OrganizationResponse> {
    const res = await apiClient.patch<ApiResponse<OrganizationResponse>>(`/organizations/${orgId}`, data);
    return res.data.data;
  },

  async delete(orgId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}`);
  },
};
