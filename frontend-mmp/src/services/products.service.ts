import apiClient from '@/lib/axios';
import type {
  ApiResponse,
  ProductResponse,
  ProductStatus,
  ProductUpsertRequest,
} from '@/types/api';

export const productsService = {
  async list(orgId: string): Promise<ProductResponse[]> {
    const res = await apiClient.get<ApiResponse<ProductResponse[]>>(`/organizations/${orgId}/products`);
    return res.data.data;
  },

  async get(orgId: string, productId: string): Promise<ProductResponse> {
    const res = await apiClient.get<ApiResponse<ProductResponse>>(`/organizations/${orgId}/products/${productId}`);
    return res.data.data;
  },

  async create(orgId: string, data: ProductUpsertRequest): Promise<ProductResponse> {
    const res = await apiClient.post<ApiResponse<ProductResponse>>(`/organizations/${orgId}/products`, data);
    return res.data.data;
  },

  async update(
    orgId: string,
    productId: string,
    data: Partial<ProductUpsertRequest> & { status?: ProductStatus },
  ): Promise<ProductResponse> {
    const res = await apiClient.patch<ApiResponse<ProductResponse>>(`/organizations/${orgId}/products/${productId}`, data);
    return res.data.data;
  },

  async deactivate(orgId: string, productId: string): Promise<ProductResponse> {
    const res = await apiClient.patch<ApiResponse<ProductResponse>>(
      `/organizations/${orgId}/products/${productId}`,
      { status: 'INACTIVE' satisfies ProductStatus },
    );
    return res.data.data;
  },

  async delete(orgId: string, productId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/products/${productId}`);
  },
};
