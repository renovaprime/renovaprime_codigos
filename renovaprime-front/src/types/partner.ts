export type PartnerEntityType = 'partner' | 'branch' | 'reseller';

export interface PartnerEntity {
  id: number;
  type: PartnerEntityType;
  name: string;
  email: string;
  partnerId: number | null;
  branchId: number | null;
  partnerName: string;
}

export interface PartnerLoginResponse {
  token: string;
  entity: PartnerEntity;
}

export interface PartnerDashboard {
  totalSales: number;
  totalValue: number;
  confirmedCount: number;
  pendingCount: number;
  totalCommission: number;
  branchCount?: number;
  resellerCount?: number;
}

export interface PartnerProfile {
  id: number;
  type: PartnerEntityType;
  name: string;
  email: string;
  cnpj?: string;
  bank_agency?: string;
  bank_account?: string;
  bank_digit?: string;
  pix_key?: string;
  logo_url?: string;
  website_url?: string;
  alias?: string;
  address?: string;
  cpf?: string;
  phone?: string;
  role?: string;
  functional_unit?: string;
  registration_code?: string;
  active: boolean;
  created_at?: string;
  Partner?: { id: number; name: string };
  PartnerBranch?: {
    id: number;
    name: string;
    Partner?: { id: number; name: string };
  };
}

export interface PartnerBranchItem {
  id: number;
  partner_id: number;
  name: string;
  alias?: string;
  address?: string;
  email: string;
  active: boolean;
  resellerCount: number;
  created_at?: string;
}

export interface PartnerResellerItem {
  id: number;
  branch_id: number;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  role?: string;
  active: boolean;
  created_at?: string;
  PartnerBranch?: {
    id: number;
    name: string;
    partner_id: number;
  };
}
