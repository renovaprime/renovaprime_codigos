import { apiClient } from './api';
import { companyApiClient } from './companyApi';
import type { ApiResponse, Beneficiary } from '../types/api';

export type KinshipType = 'conjuge' | 'filho' | 'enteado' | 'pai' | 'mae' | 'irmao' | 'outro';

export interface CompanyTitularFormData {
  type: 'TITULAR';
  name: string;
  cpf: string;
  birth_date: string;
  email: string;
  password: string;
  phone?: string;
  cep?: string;
  city?: string;
  state?: string;
  address?: string;
}

export interface CompanyDependentFormData {
  type: 'DEPENDENTE';
  titular_id: number;
  kinship: KinshipType;
  name: string;
  cpf: string;
  birth_date: string;
  phone?: string;
  email?: string;
  cep?: string;
  city?: string;
  state?: string;
  address?: string;
}

export type CompanyBeneficiaryFormData = CompanyTitularFormData | CompanyDependentFormData;

export interface DependentAccessData {
  email: string;
  password: string;
}

class CompanyBeneficiaryService {
  async listAdmin(companyId: number, filters?: { type?: string; status?: string; search?: string }): Promise<Beneficiary[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const qs = params.toString();
    const url = qs
      ? `/admin/companies/${companyId}/beneficiaries?${qs}`
      : `/admin/companies/${companyId}/beneficiaries`;

    const response = await apiClient.get<ApiResponse<Beneficiary[]>>(url);
    return response.data;
  }

  async createAdmin(companyId: number, data: CompanyBeneficiaryFormData): Promise<Beneficiary> {
    const response = await apiClient.post<ApiResponse<Beneficiary>>(
      `/admin/companies/${companyId}/beneficiaries`,
      data
    );
    return response.data;
  }

  async updateAdmin(companyId: number, beneficiaryId: number, data: Partial<CompanyBeneficiaryFormData> & { status?: 'INACTIVE' }): Promise<Beneficiary> {
    const response = await apiClient.patch<ApiResponse<Beneficiary>>(
      `/admin/companies/${companyId}/beneficiaries/${beneficiaryId}`,
      data
    );
    return response.data;
  }

  async deleteAdmin(companyId: number, beneficiaryId: number): Promise<void> {
    await apiClient.delete(`/admin/companies/${companyId}/beneficiaries/${beneficiaryId}`);
  }

  async grantAccessAdmin(companyId: number, beneficiaryId: number, data: DependentAccessData): Promise<void> {
    await apiClient.post(`/admin/companies/${companyId}/beneficiaries/${beneficiaryId}/access`, data);
  }

  async listPortal(filters?: { type?: string; status?: string; search?: string }): Promise<Beneficiary[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const qs = params.toString();
    const url = qs ? `/company-area/beneficiaries?${qs}` : '/company-area/beneficiaries';

    const response = await companyApiClient.get<ApiResponse<Beneficiary[]>>(url);
    return response.data;
  }

  async createPortal(data: CompanyBeneficiaryFormData): Promise<Beneficiary> {
    const response = await companyApiClient.post<ApiResponse<Beneficiary>>('/company-area/beneficiaries', data);
    return response.data;
  }

  async updatePortal(beneficiaryId: number, data: Partial<CompanyBeneficiaryFormData> & { status?: 'INACTIVE' }): Promise<Beneficiary> {
    const response = await companyApiClient.patch<ApiResponse<Beneficiary>>(
      `/company-area/beneficiaries/${beneficiaryId}`,
      data
    );
    return response.data;
  }

  async deletePortal(beneficiaryId: number): Promise<void> {
    await companyApiClient.delete(`/company-area/beneficiaries/${beneficiaryId}`);
  }

  async grantAccessPortal(beneficiaryId: number, data: DependentAccessData): Promise<void> {
    await companyApiClient.post(`/company-area/beneficiaries/${beneficiaryId}/access`, data);
  }
}

export const companyBeneficiaryService = new CompanyBeneficiaryService();
