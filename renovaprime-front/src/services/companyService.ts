import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type { CompanyFormData, CompanyRecord } from '../types/company';

interface CompanyFilters {
  name?: string;
  status?: string;
}

class CompanyService {
  async list(filters?: CompanyFilters): Promise<CompanyRecord[]> {
    const params = new URLSearchParams();
    if (filters?.name) params.append('name', filters.name);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/admin/companies?${queryString}` : '/admin/companies';

    const response = await apiClient.get<ApiResponse<CompanyRecord[]>>(url);
    return response.data;
  }

  async getById(id: number): Promise<CompanyRecord> {
    const response = await apiClient.get<ApiResponse<CompanyRecord>>(`/admin/companies/${id}`);
    return response.data;
  }

  async create(data: CompanyFormData): Promise<CompanyRecord> {
    const response = await apiClient.post<ApiResponse<CompanyRecord>>('/admin/companies', data);
    return response.data;
  }

  async update(id: number, data: Partial<CompanyFormData>): Promise<CompanyRecord> {
    const response = await apiClient.put<ApiResponse<CompanyRecord>>(`/admin/companies/${id}`, data);
    return response.data;
  }

  async updateStatus(id: number, active: boolean): Promise<CompanyRecord> {
    const response = await apiClient.patch<ApiResponse<CompanyRecord>>(`/admin/companies/${id}/status`, { active });
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/admin/companies/${id}`);
  }
}

export const companyService = new CompanyService();
