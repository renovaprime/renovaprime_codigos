import { partnerApiClient } from './partnerApi';
import type { ApiResponse } from '../types/api';
import type { ResellerSaleRecord, SalesSummary } from './salesReportService';
import type { PartnerDashboard, PartnerProfile, PartnerBranchItem, PartnerResellerItem } from '../types/partner';

interface CommissionRow {
  reseller_id: number | null;
  branch_id: number | null;
  partner_id: number | null;
  totalSales: number;
  totalValue: number;
  commissionReseller: number;
  commissionBranch: number;
  commissionPartner: number;
  Reseller?: { id: number; name: string } | null;
  PartnerBranch?: {
    id: number;
    name: string;
    Partner?: { id: number; name: string };
  } | null;
}

interface SalesFilters {
  branch_id?: number;
  reseller_id?: number;
  plan_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

class PartnerAreaService {
  async getDashboard(): Promise<PartnerDashboard> {
    const response = await partnerApiClient.get<ApiResponse<PartnerDashboard>>('/partner-area/dashboard');
    return response.data;
  }

  async getSales(filters?: SalesFilters): Promise<ResellerSaleRecord[]> {
    const params = new URLSearchParams();
    if (filters?.branch_id) params.append('branch_id', String(filters.branch_id));
    if (filters?.reseller_id) params.append('reseller_id', String(filters.reseller_id));
    if (filters?.plan_type) params.append('plan_type', filters.plan_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const qs = params.toString();
    const url = qs ? `/partner-area/sales?${qs}` : '/partner-area/sales';
    const response = await partnerApiClient.get<ApiResponse<ResellerSaleRecord[]>>(url);
    return response.data;
  }

  async getSalesSummary(filters?: SalesFilters): Promise<SalesSummary> {
    const params = new URLSearchParams();
    if (filters?.branch_id) params.append('branch_id', String(filters.branch_id));
    if (filters?.reseller_id) params.append('reseller_id', String(filters.reseller_id));
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const qs = params.toString();
    const url = qs ? `/partner-area/sales/summary?${qs}` : '/partner-area/sales/summary';
    const response = await partnerApiClient.get<ApiResponse<SalesSummary>>(url);
    return response.data;
  }

  async getCommissions(filters?: SalesFilters): Promise<CommissionRow[]> {
    const params = new URLSearchParams();
    if (filters?.branch_id) params.append('branch_id', String(filters.branch_id));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const qs = params.toString();
    const url = qs ? `/partner-area/sales/commissions?${qs}` : '/partner-area/sales/commissions';
    const response = await partnerApiClient.get<ApiResponse<CommissionRow[]>>(url);
    return response.data;
  }

  async getProfile(): Promise<PartnerProfile> {
    const response = await partnerApiClient.get<ApiResponse<PartnerProfile>>('/partner-area/profile');
    return response.data;
  }

  async getBranches(): Promise<PartnerBranchItem[]> {
    const response = await partnerApiClient.get<ApiResponse<PartnerBranchItem[]>>('/partner-area/branches');
    return response.data;
  }

  async getResellers(): Promise<PartnerResellerItem[]> {
    const response = await partnerApiClient.get<ApiResponse<PartnerResellerItem[]>>('/partner-area/resellers');
    return response.data;
  }

  async updateProfile(data: Record<string, string | undefined>): Promise<PartnerProfile> {
    const response = await partnerApiClient.put<ApiResponse<PartnerProfile>>('/partner-area/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await partnerApiClient.put<ApiResponse<{ message: string }>>('/partner-area/profile/password', {
      currentPassword,
      newPassword,
    });
  }
}

export const partnerAreaService = new PartnerAreaService();
export type { CommissionRow, SalesFilters };
