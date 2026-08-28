export type CompanyBillingStatus =
  | 'PENDING'
  | 'ISSUED'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELED'
  | 'ERROR';

export type BillingType = 'PER_LIFE' | 'PER_FAMILY';

export interface CompanyBillingPreview {
  competence: string;
  company_id: number;
  plan_id: number;
  billing_type: BillingType;
  lives_active: number;
  titulars_active: number;
  total_lives: number;
  total_families: number;
  unit_price: number;
  total_amount: number;
  due_date: string;
  already_billed?: boolean;
}

export interface CompanyBillingRecord {
  id: number;
  company_id: number;
  competence: string;
  billing_type: BillingType;
  total_lives: number;
  total_families: number;
  unit_price: number;
  total_amount: number;
  due_date: string;
  asaas_payment_id?: string | null;
  asaas_invoice_url?: string | null;
  status: CompanyBillingStatus;
  error_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyBillingPortalRecord {
  id: number;
  company_id: number;
  competence: string;
  billing_type: BillingType;
  total_lives: number;
  total_families: number;
  unit_price: number;
  total_amount: number;
  due_date: string;
  asaas_invoice_url?: string | null;
  status: CompanyBillingStatus;
  created_at?: string;
  updated_at?: string;
}

export const BILLING_STATUS_LABELS: Record<CompanyBillingStatus, string> = {
  PENDING: 'Pendente',
  ISSUED: 'Emitida',
  PAID: 'Paga',
  OVERDUE: 'Vencida',
  CANCELED: 'Cancelada',
  ERROR: 'Erro'
};

export const BILLING_STATUS_VARIANTS: Record<CompanyBillingStatus, 'default' | 'success' | 'warning' | 'secondary' | 'destructive'> = {
  PENDING: 'secondary',
  ISSUED: 'default',
  PAID: 'success',
  OVERDUE: 'warning',
  CANCELED: 'secondary',
  ERROR: 'destructive'
};
