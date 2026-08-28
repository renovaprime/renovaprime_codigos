import { apiClient } from './api';
import { companyApiClient } from './companyApi';
import type { ApiResponse } from '../types/api';
import type {
  CompanyBillingPreview,
  CompanyBillingRecord,
  CompanyBillingPortalRecord
} from '../types/companyBilling';

class CompanyBillingService {
  async getPreview(companyId: number, competence?: string): Promise<CompanyBillingPreview> {
    const params = competence ? `?competence=${encodeURIComponent(competence)}` : '';
    const response = await apiClient.get<ApiResponse<CompanyBillingPreview>>(
      `/admin/companies/${companyId}/billing-preview${params}`
    );
    return response.data;
  }

  async generate(companyId: number, competence?: string): Promise<CompanyBillingRecord> {
    const body = competence ? { competence } : {};
    const response = await apiClient.post<ApiResponse<CompanyBillingRecord>>(
      `/admin/companies/${companyId}/billings/generate`,
      body
    );
    return response.data;
  }

  async listAdmin(companyId: number): Promise<CompanyBillingRecord[]> {
    const response = await apiClient.get<ApiResponse<CompanyBillingRecord[]>>(
      `/admin/companies/${companyId}/billings`
    );
    return response.data;
  }

  async listPortal(): Promise<CompanyBillingPortalRecord[]> {
    const response = await companyApiClient.get<ApiResponse<CompanyBillingPortalRecord[]>>(
      '/company-area/billing'
    );
    return response.data;
  }

  async getByCompetencePortal(competence: string): Promise<CompanyBillingPortalRecord> {
    const response = await companyApiClient.get<ApiResponse<CompanyBillingPortalRecord>>(
      `/company-area/billing/${competence}`
    );
    return response.data;
  }
}

export const companyBillingService = new CompanyBillingService();
