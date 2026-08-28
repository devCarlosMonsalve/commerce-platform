import apiClient from '@/lib/axios';
import type { ApiResponse, SupplierResponse, SupplierUpsertRequest } from '@/types/api';

export const suppliersService = {
  async list(orgId: string): Promise<SupplierResponse[]> {
    const res = await apiClient.get<ApiResponse<SupplierResponse[]>>(`/organizations/${orgId}/suppliers`);
    return res.data.data;
  },

  async get(orgId: string, supplierId: string): Promise<SupplierResponse> {
    const res = await apiClient.get<ApiResponse<SupplierResponse>>(
      `/organizations/${orgId}/suppliers/${supplierId}`,
    );
    return res.data.data;
  },

  async create(orgId: string, data: SupplierUpsertRequest): Promise<SupplierResponse> {
    const res = await apiClient.post<ApiResponse<SupplierResponse>>(
      `/organizations/${orgId}/suppliers`,
      data,
    );
    return res.data.data;
  },

  async update(
    orgId: string,
    supplierId: string,
    data: Partial<SupplierUpsertRequest>,
  ): Promise<SupplierResponse> {
    const res = await apiClient.patch<ApiResponse<SupplierResponse>>(
      `/organizations/${orgId}/suppliers/${supplierId}`,
      data,
    );
    return res.data.data;
  },

  async delete(orgId: string, supplierId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/suppliers/${supplierId}`);
  },
};
