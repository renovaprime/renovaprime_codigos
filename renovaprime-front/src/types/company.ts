export interface CompanyEntity {
  id: number;
  name: string;
  email: string;
}

export interface CompanyLoginResponse {
  token: string;
  name: string;
  email: string;
  entity: CompanyEntity;
}

export interface CompanyRecord {
  id: number;
  legal_name: string;
  trade_name: string;
  cnpj: string;
  phone: string;
  email: string;
  zip_code: string;
  address: string;
  city: string;
  state: string;
  state_registration?: string | null;
  responsible_name: string;
  responsible_email: string;
  responsible_phone?: string | null;
  active: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyFormData {
  legal_name: string;
  trade_name: string;
  cnpj: string;
  phone: string;
  email: string;
  zip_code: string;
  address: string;
  city: string;
  state: string;
  state_registration?: string;
  responsible_name: string;
  responsible_email: string;
  responsible_phone?: string;
  password?: string;
  notes?: string;
}

export interface CompanyProfileUpdate {
  responsible_name?: string;
  responsible_email?: string;
  responsible_phone?: string;
  phone?: string;
}
