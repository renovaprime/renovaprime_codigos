import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type {
  CompanyPlanRecord,
  CompanyPlanFormData,
  CompanyContractRecord,
  CompanyContractFormData
} from '../types/companyPlan';

class CompanyPlanService {
  async listPlans(status?: string): Promise<CompanyPlanRecord[]> {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get<ApiResponse<CompanyPlanRecord[]>>(`/admin/company-plans${params}`);
    return response.data;
  }

  async getPlanById(id: number): Promise<CompanyPlanRecord> {
    const response = await apiClient.get<ApiResponse<CompanyPlanRecord>>(`/admin/company-plans/${id}`);
    return response.data;
  }

  async createPlan(data: CompanyPlanFormData): Promise<CompanyPlanRecord> {
    const response = await apiClient.post<ApiResponse<CompanyPlanRecord>>('/admin/company-plans', data);
    return response.data;
  }

  async updatePlan(id: number, data: Partial<CompanyPlanFormData>): Promise<CompanyPlanRecord> {
    const response = await apiClient.put<ApiResponse<CompanyPlanRecord>>(`/admin/company-plans/${id}`, data);
    return response.data;
  }

  async updatePlanStatus(id: number, active: boolean): Promise<CompanyPlanRecord> {
    const response = await apiClient.patch<ApiResponse<CompanyPlanRecord>>(`/admin/company-plans/${id}/status`, { active });
    return response.data;
  }

  async getContract(companyId: number): Promise<CompanyContractRecord> {
    const response = await apiClient.get<ApiResponse<CompanyContractRecord>>(`/admin/companies/${companyId}/contract`);
    return response.data;
  }

  async createContract(companyId: number, data: CompanyContractFormData): Promise<CompanyContractRecord> {
    const response = await apiClient.post<ApiResponse<CompanyContractRecord>>(`/admin/companies/${companyId}/contract`, data);
    return response.data;
  }

  async updateContractStatus(companyId: number, active: boolean): Promise<CompanyContractRecord> {
    const response = await apiClient.patch<ApiResponse<CompanyContractRecord>>(
      `/admin/companies/${companyId}/contract/status`,
      { active }
    );
    return response.data;
  }
}

export const companyPlanService = new CompanyPlanService();
