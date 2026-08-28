import apiClient from '@/lib/axios';
import type {
  ApiResponse,
  CreatePurchaseOrderRequest,
  PurchaseOrderResponse,
  PurchaseOrderStatus,
  ReceivePurchaseOrderRequest,
} from '@/types/api';

export const purchaseOrdersService = {
  async list(orgId: string): Promise<PurchaseOrderResponse[]> {
    const res = await apiClient.get<ApiResponse<PurchaseOrderResponse[]>>(
      `/organizations/${orgId}/purchase-orders`,
    );
    return res.data.data;
  },

  async get(orgId: string, purchaseOrderId: string): Promise<PurchaseOrderResponse> {
    const res = await apiClient.get<ApiResponse<PurchaseOrderResponse>>(
      `/organizations/${orgId}/purchase-orders/${purchaseOrderId}`,
    );
    return res.data.data;
  },

  async create(
    orgId: string,
    data: CreatePurchaseOrderRequest,
  ): Promise<PurchaseOrderResponse> {
    const res = await apiClient.post<ApiResponse<PurchaseOrderResponse>>(
      `/organizations/${orgId}/purchase-orders`,
      data,
    );
    return res.data.data;
  },

  async updateStatus(
    orgId: string,
    purchaseOrderId: string,
    status: PurchaseOrderStatus,
  ): Promise<PurchaseOrderResponse> {
    const res = await apiClient.patch<ApiResponse<PurchaseOrderResponse>>(
      `/organizations/${orgId}/purchase-orders/${purchaseOrderId}/status`,
      { status },
    );
    return res.data.data;
  },

  async receive(
    orgId: string,
    purchaseOrderId: string,
    data: ReceivePurchaseOrderRequest,
  ): Promise<PurchaseOrderResponse> {
    const res = await apiClient.post<ApiResponse<PurchaseOrderResponse>>(
      `/organizations/${orgId}/purchase-orders/${purchaseOrderId}/receipts`,
      data,
    );
    return res.data.data;
  },
};
