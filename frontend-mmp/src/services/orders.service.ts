import apiClient from '@/lib/axios';
import type { ApiResponse, CreateOrderRequest, OrderResponse, OrderStatus } from '@/types/api';

export const ordersService = {
  async list(orgId: string): Promise<OrderResponse[]> {
    const res = await apiClient.get<ApiResponse<OrderResponse[]>>(`/organizations/${orgId}/orders`);
    return res.data.data;
  },

  async get(orgId: string, orderId: string): Promise<OrderResponse> {
    const res = await apiClient.get<ApiResponse<OrderResponse>>(`/organizations/${orgId}/orders/${orderId}`);
    return res.data.data;
  },

  async create(orgId: string, data: CreateOrderRequest): Promise<OrderResponse> {
    const res = await apiClient.post<ApiResponse<OrderResponse>>(`/organizations/${orgId}/orders`, data);
    return res.data.data;
  },

  async updateStatus(orgId: string, orderId: string, status: OrderStatus): Promise<OrderResponse> {
    const res = await apiClient.patch<ApiResponse<OrderResponse>>(`/organizations/${orgId}/orders/${orderId}/status`, { status });
    return res.data.data;
  },

  async delete(orgId: string, orderId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/orders/${orderId}`);
  },
};
