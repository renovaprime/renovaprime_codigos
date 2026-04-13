import { apiClient } from './api';
import type { ApiResponse, PlanCommission, PlanCommissionInput } from '../types/api';

class PlanCommissionService {
  async listByPartner(partnerId: number): Promise<PlanCommission[]> {
    const response = await apiClient.get<ApiResponse<PlanCommission[]>>(
      `/partners/${partnerId}/commissions`
    );
    return response.data;
  }

  async upsert(partnerId: number, commissions: PlanCommissionInput[]): Promise<PlanCommission[]> {
    const response = await apiClient.put<ApiResponse<PlanCommission[]>>(
      `/partners/${partnerId}/commissions`,
      { commissions }
    );
    return response.data;
  }
}

export const planCommissionService = new PlanCommissionService();
