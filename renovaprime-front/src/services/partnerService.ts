import { apiClient } from './api';
import type { ApiResponse, Partner, PartnerFormData } from '../types/api';

interface PartnerFilters {
  name?: string;
  status?: string;
}

class PartnerService {
  async list(filters?: PartnerFilters): Promise<Partner[]> {
    const params = new URLSearchParams();
    if (filters?.name) params.append('name', filters.name);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/partners?${queryString}` : '/partners';

    const response = await apiClient.get<ApiResponse<Partner[]>>(url);
    return response.data;
  }

  async getById(id: number): Promise<Partner> {
    const response = await apiClient.get<ApiResponse<Partner>>(`/partners/${id}`);
    return response.data;
  }

  async create(data: PartnerFormData): Promise<Partner> {
    const response = await apiClient.post<ApiResponse<Partner>>('/partners', data);
    return response.data;
  }

  async update(id: number, data: Partial<PartnerFormData>): Promise<Partner> {
    const response = await apiClient.put<ApiResponse<Partner>>(`/partners/${id}`, data);
    return response.data;
  }

  async toggle(id: number): Promise<Partner> {
    const response = await apiClient.patch<ApiResponse<Partner>>(`/partners/${id}/toggle`);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/partners/${id}`);
  }
}

export const partnerService = new PartnerService();
