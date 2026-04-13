import { apiClient } from './api';
import type { ApiResponse, PartnerBranch, BranchFormData } from '../types/api';

interface BranchFilters {
  partner_id?: number;
  name?: string;
  status?: string;
}

class BranchService {
  async list(filters?: BranchFilters): Promise<PartnerBranch[]> {
    const params = new URLSearchParams();
    if (filters?.partner_id) params.append('partner_id', String(filters.partner_id));
    if (filters?.name) params.append('name', filters.name);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/partners/branches/all?${queryString}` : '/partners/branches/all';

    const response = await apiClient.get<ApiResponse<PartnerBranch[]>>(url);
    return response.data;
  }

  async getById(id: number): Promise<PartnerBranch> {
    const response = await apiClient.get<ApiResponse<PartnerBranch>>(`/partners/branches/${id}`);
    return response.data;
  }

  async create(data: BranchFormData): Promise<PartnerBranch> {
    const response = await apiClient.post<ApiResponse<PartnerBranch>>(
      `/partners/${data.partner_id}/branches`,
      data
    );
    return response.data;
  }

  async update(id: number, data: Partial<BranchFormData>): Promise<PartnerBranch> {
    const response = await apiClient.put<ApiResponse<PartnerBranch>>(`/partners/branches/${id}`, data);
    return response.data;
  }

  async toggle(id: number): Promise<PartnerBranch> {
    const response = await apiClient.patch<ApiResponse<PartnerBranch>>(`/partners/branches/${id}/toggle`);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/partners/branches/${id}`);
  }
}

export const branchService = new BranchService();
