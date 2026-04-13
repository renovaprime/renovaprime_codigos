import { apiClient } from './api';
import type { ApiResponse } from '../types/api';

export interface ResellerSaleRecord {
  id: number;
  uuid: string;
  reseller_id: number | null;
  branch_id: number | null;
  partner_id: number | null;
  beneficiary_id: number | null;
  cpf: string;
  plan_type: 'CLINICO' | 'PREMIUM' | 'FAMILIAR';
  value: number;
  gateway: string;
  gateway_subscription_id: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'FAILED' | 'CANCELED';
  commission_partner: number;
  commission_branch: number;
  commission_reseller: number;
  confirmed_at: string | null;
  created_at: string;
  Reseller?: { id: number; name: string; cpf: string } | null;
  PartnerBranch?: {
    id: number;
    name: string;
    Partner?: { id: number; name: string };
  } | null;
  Partner?: { id: number; name: string } | null;
  Beneficiary?: { id: number; name: string; cpf: string } | null;
}

export interface SalesSummary {
  totalSales: number;
  totalValue: number;
  totalCommissionReseller: number;
  totalCommissionBranch: number;
  totalCommissionPartner: number;
  confirmedCount: number;
  pendingCount: number;
}

interface SalesFilters {
  reseller_id?: number;
  branch_id?: number;
  partner_id?: number;
  plan_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

class SalesReportService {
  async getSales(filters?: SalesFilters): Promise<ResellerSaleRecord[]> {
    const params = new URLSearchParams();
    if (filters?.reseller_id) params.append('reseller_id', String(filters.reseller_id));
    if (filters?.branch_id) params.append('branch_id', String(filters.branch_id));
    if (filters?.partner_id) params.append('partner_id', String(filters.partner_id));
    if (filters?.plan_type) params.append('plan_type', filters.plan_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const qs = params.toString();
    const url = qs ? `/sales?${qs}` : '/sales';
    const response = await apiClient.get<ApiResponse<ResellerSaleRecord[]>>(url);
    return response.data;
  }

  async getSummary(filters?: SalesFilters): Promise<SalesSummary> {
    const params = new URLSearchParams();
    if (filters?.reseller_id) params.append('reseller_id', String(filters.reseller_id));
    if (filters?.branch_id) params.append('branch_id', String(filters.branch_id));
    if (filters?.partner_id) params.append('partner_id', String(filters.partner_id));
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const qs = params.toString();
    const url = qs ? `/sales/summary?${qs}` : '/sales/summary';
    const response = await apiClient.get<ApiResponse<SalesSummary>>(url);
    return response.data;
  }

  async getCommissions(filters?: SalesFilters): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (filters?.partner_id) params.append('partner_id', String(filters.partner_id));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const qs = params.toString();
    const url = qs ? `/sales/commissions?${qs}` : '/sales/commissions';
    const response = await apiClient.get<ApiResponse<unknown[]>>(url);
    return response.data;
  }
}

export const salesReportService = new SalesReportService();
