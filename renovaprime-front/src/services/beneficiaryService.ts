import { apiClient } from './api';
import type { ApiResponse, Beneficiary, BeneficiaryFormData } from '../types/api';

export type FaceScanListFilter = 'disabled' | 'pending' | 'active';

export interface BeneficiaryFilters {
  name?: string;
  cpf?: string;
  search?: string;
  type?: string;
  status?: string;
  /** Filtra pela situação do Face Scan (mesmos estados da coluna na lista) */
  faceScan?: FaceScanListFilter;
  company_id?: number;
}

class BeneficiaryService {
  async list(filters?: BeneficiaryFilters): Promise<Beneficiary[]> {
    const params = new URLSearchParams();
    if (filters?.name) params.append('name', filters.name);
    if (filters?.cpf) params.append('cpf', filters.cpf);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.faceScan) params.append('faceScan', filters.faceScan);
    if (filters?.company_id) params.append('company_id', String(filters.company_id));
    
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

  /** Ativa ou desativa Face Scan (Rapidoc + flags locais). */
  async setFaceScan(id: number, enabled: boolean): Promise<Beneficiary> {
    const response = await apiClient.patch<ApiResponse<Beneficiary>>(
      `/admin/beneficiaries/${id}/face-scan`,
      { enabled }
    );
    return response.data;
  }
}

export const beneficiaryService = new BeneficiaryService();
