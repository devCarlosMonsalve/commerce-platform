import apiClient from '@/lib/axios';
import type {
  AiOperationsSummaryResponse,
  AiPurchaseSuggestionsResponse,
  ApiResponse,
  OperationalSearchResponse,
  OperationsSummarySection,
} from '@/types/api';

export const aiService = {
  async generateOperationsSummary(
    organizationId: string,
    section?: OperationsSummarySection,
  ): Promise<AiOperationsSummaryResponse> {
    const response = await apiClient.get<ApiResponse<AiOperationsSummaryResponse>>(
      `/organizations/${organizationId}/ai/operations-summary${section ? `/${section}` : ''}`,
    );
    return response.data.data;
  },

  async searchOperations(
    organizationId: string,
    query: string,
  ): Promise<OperationalSearchResponse> {
    const response = await apiClient.post<ApiResponse<OperationalSearchResponse>>(
      `/organizations/${organizationId}/ai/operations/search`,
      { query },
    );
    return response.data.data;
  },

  async generatePurchaseSuggestions(
    organizationId: string,
  ): Promise<AiPurchaseSuggestionsResponse> {
    const response = await apiClient.get<ApiResponse<AiPurchaseSuggestionsResponse>>(
      `/organizations/${organizationId}/ai/purchase-suggestions`,
    );
    return response.data.data;
  },
};
