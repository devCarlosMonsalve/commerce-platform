import apiClient from '@/lib/axios';
import type { ApiResponse, ProductResponse, ProductStatus } from '@/types/api';

export const productsService = {
  async list(orgId: string): Promise<ProductResponse[]> {
    const res = await apiClient.get<ApiResponse<ProductResponse[]>>(`/organizations/${orgId}/products`);
    return res.data.data;
  },

  async get(orgId: string, productId: string): Promise<ProductResponse> {
    const res = await apiClient.get<ApiResponse<ProductResponse>>(`/organizations/${orgId}/products/${productId}`);
    return res.data.data;
  },

  async create(orgId: string, data: { name: string; price: number; description?: string; sku?: string; stock?: number }): Promise<ProductResponse> {
    const res = await apiClient.post<ApiResponse<ProductResponse>>(`/organizations/${orgId}/products`, data);
    return res.data.data;
  },

  async update(orgId: string, productId: string, data: { name?: string; price?: number; description?: string; sku?: string; stock?: number; status?: ProductStatus }): Promise<ProductResponse> {
    const res = await apiClient.patch<ApiResponse<ProductResponse>>(`/organizations/${orgId}/products/${productId}`, data);
    return res.data.data;
  },

  async delete(orgId: string, productId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/products/${productId}`);
  },
};
