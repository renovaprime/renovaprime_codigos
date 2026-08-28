import type { BillingType, CompanyBillingStatus } from './companyBilling';

export interface CompanyReportPlan {
  id: number;
  name: string | null;
  billing_type: BillingType;
  service_type: string | null;
}

export interface CompanyReportLastBilling {
  id: number;
  competence: string;
  status: CompanyBillingStatus;
  total_amount: number;
  due_date: string;
}

export interface CompanyReportSummary {
  id: number;
  trade_name: string;
  legal_name: string;
  cnpj: string;
  active: boolean;
  plan: CompanyReportPlan | null;
  lives_active: number;
  titulars_active: number;
  last_billing: CompanyReportLastBilling | null;
}

export interface CompanyReportLives {
  company_id: number;
  company_name: string;
  lives_active: number;
  titulars_active: number;
  beneficiaries: import('./api').Beneficiary[];
}

export interface CompanyReportBillings {
  company_id: number;
  company_name: string;
  billings: import('./companyBilling').CompanyBillingRecord[];
}

export interface CompanyReportFilters {
  name?: string;
  status?: 'active' | 'inactive';
}
