import { apiClient } from './api';
import type { ApiResponse, Reseller, ResellerFormData } from '../types/api';

interface ResellerFilters {
  branch_id?: number;
  name?: string;
  cpf?: string;
  status?: string;
}

class ResellerService {
  async list(filters?: ResellerFilters): Promise<Reseller[]> {
    const params = new URLSearchParams();
    if (filters?.branch_id) params.append('branch_id', String(filters.branch_id));
    if (filters?.name) params.append('name', filters.name);
    if (filters?.cpf) params.append('cpf', filters.cpf);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/partners/resellers/all?${queryString}` : '/partners/resellers/all';

    const response = await apiClient.get<ApiResponse<Reseller[]>>(url);
    return response.data;
  }

  async getById(id: number): Promise<Reseller> {
    const response = await apiClient.get<ApiResponse<Reseller>>(`/partners/resellers/${id}`);
    return response.data;
  }

  async create(data: ResellerFormData): Promise<Reseller> {
    const response = await apiClient.post<ApiResponse<Reseller>>(
      `/partners/branches/${data.branch_id}/resellers`,
      data
    );
    return response.data;
  }

  async update(id: number, data: Partial<ResellerFormData>): Promise<Reseller> {
    const response = await apiClient.put<ApiResponse<Reseller>>(`/partners/resellers/${id}`, data);
    return response.data;
  }

  async toggle(id: number): Promise<Reseller> {
    const response = await apiClient.patch<ApiResponse<Reseller>>(`/partners/resellers/${id}/toggle`);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/partners/resellers/${id}`);
  }
}

export const resellerService = new ResellerService();
