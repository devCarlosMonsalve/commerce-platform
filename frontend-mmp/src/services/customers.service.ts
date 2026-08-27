import apiClient from '@/lib/axios';
import type { ApiResponse, CustomerResponse } from '@/types/api';

export const customersService = {
  async list(orgId: string): Promise<CustomerResponse[]> {
    const res = await apiClient.get<ApiResponse<CustomerResponse[]>>(`/organizations/${orgId}/customers`);
    return res.data.data;
  },

  async get(orgId: string, customerId: string): Promise<CustomerResponse> {
    const res = await apiClient.get<ApiResponse<CustomerResponse>>(`/organizations/${orgId}/customers/${customerId}`);
    return res.data.data;
  },

  async create(orgId: string, data: { name: string; email?: string; phone?: string }): Promise<CustomerResponse> {
    const res = await apiClient.post<ApiResponse<CustomerResponse>>(`/organizations/${orgId}/customers`, data);
    return res.data.data;
  },

  async update(orgId: string, customerId: string, data: { name?: string; email?: string; phone?: string }): Promise<CustomerResponse> {
    const res = await apiClient.patch<ApiResponse<CustomerResponse>>(`/organizations/${orgId}/customers/${customerId}`, data);
    return res.data.data;
  },

  async delete(orgId: string, customerId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/customers/${customerId}`);
  },
};
