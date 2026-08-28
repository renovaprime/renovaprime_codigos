export type BillingType = 'PER_LIFE' | 'PER_FAMILY';
export type CompanyServiceType = 'CLINICO' | 'PREMIUM' | 'FAMILIAR';

export interface PriceTier {
  id?: number;
  lives_from: number;
  lives_to: number;
  unit_price: number;
}

export interface CompanyPlanRecord {
  id: number;
  name: string;
  description?: string | null;
  billing_type: BillingType;
  service_type: CompanyServiceType;
  active: boolean;
  tiers?: PriceTier[];
  created_at?: string;
  updated_at?: string;
}

export interface CompanyPlanFormData {
  name: string;
  description?: string;
  billing_type: BillingType;
  service_type: CompanyServiceType;
  tiers: PriceTier[];
}

export interface CompanyContractRecord {
  id: number;
  company_id: number;
  company_plan_id: number;
  billing_type: BillingType;
  due_day: number;
  starts_on: string;
  ends_on?: string | null;
  active: boolean;
  plan?: CompanyPlanRecord;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyContractFormData {
  company_plan_id: number;
  due_day: number;
  starts_on: string;
  ends_on?: string | null;
  force?: boolean;
}
