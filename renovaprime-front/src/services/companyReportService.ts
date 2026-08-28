import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type {
  CompanyReportBillings,
  CompanyReportFilters,
  CompanyReportLives,
  CompanyReportSummary
} from '../types/companyReport';

class CompanyReportService {
  async list(filters?: CompanyReportFilters): Promise<CompanyReportSummary[]> {
    const params = new URLSearchParams();
    if (filters?.name) params.append('name', filters.name);
    if (filters?.status) params.append('status', filters.status);

    const qs = params.toString();
    const url = qs ? `/admin/company-reports?${qs}` : '/admin/company-reports';
    const response = await apiClient.get<ApiResponse<CompanyReportSummary[]>>(url);
    return response.data;
  }

  async getLives(
    companyId: number,
    filters?: { type?: string; status?: string; search?: string }
  ): Promise<CompanyReportLives> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const qs = params.toString();
    const url = qs
      ? `/admin/company-reports/${companyId}/lives?${qs}`
      : `/admin/company-reports/${companyId}/lives`;

    const response = await apiClient.get<ApiResponse<CompanyReportLives>>(url);
    return response.data;
  }

  async getBillings(companyId: number): Promise<CompanyReportBillings> {
    const response = await apiClient.get<ApiResponse<CompanyReportBillings>>(
      `/admin/company-reports/${companyId}/billings`
    );
    return response.data;
  }
}

export const companyReportService = new CompanyReportService();
