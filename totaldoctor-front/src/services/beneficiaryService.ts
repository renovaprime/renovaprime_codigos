import { apiClient } from './api';
import type { ApiResponse, Beneficiary, BeneficiaryFormData } from '../types/api';

interface BeneficiaryFilters {
  name?: string;
  cpf?: string;
  type?: string;
  status?: string;
}

class BeneficiaryService {
  async list(filters?: BeneficiaryFilters): Promise<Beneficiary[]> {
    const params = new URLSearchParams();
    if (filters?.name) params.append('name', filters.name);
    if (filters?.cpf) params.append('cpf', filters.cpf);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const url = queryString ? `/admin/beneficiaries?${queryString}` : '/admin/beneficiaries';
    
    const response = await apiClient.get<ApiResponse<Beneficiary[]>>(url);
    return response.data;
  }

  async getById(id: number): Promise<Beneficiary> {
    const response = await apiClient.get<ApiResponse<Beneficiary>>(`/admin/beneficiaries/${id}`);
    return response.data;
  }

  async create(data: BeneficiaryFormData): Promise<Beneficiary> {
    const response = await apiClient.post<ApiResponse<Beneficiary>>('/admin/beneficiaries', data);
    return response.data;
  }

  async update(id: number, data: Partial<BeneficiaryFormData>): Promise<Beneficiary> {
    const response = await apiClient.put<ApiResponse<Beneficiary>>(`/admin/beneficiaries/${id}`, data);
    return response.data;
  }

  async toggleStatus(id: number, includeDependents?: boolean): Promise<Beneficiary> {
    const params = includeDependents ? '?includeDependents=true' : '';
    const response = await apiClient.patch<ApiResponse<Beneficiary>>(`/admin/beneficiaries/${id}/status${params}`);
    return response.data;
  }

  async listTitulares(): Promise<Beneficiary[]> {
    const response = await apiClient.get<ApiResponse<Beneficiary[]>>('/admin/beneficiaries?type=TITULAR&status=ACTIVE');
    return response.data;
  }

  async listDependents(titularId: number): Promise<Beneficiary[]> {
    const response = await apiClient.get<ApiResponse<Beneficiary[]>>(`/admin/beneficiaries/${titularId}/dependents`);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/admin/beneficiaries/${id}`);
  }
}

export const beneficiaryService = new BeneficiaryService();
