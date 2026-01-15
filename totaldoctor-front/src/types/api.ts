export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  message: string;
  code: string;
}

export interface Specialty {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
}

export interface SpecialtyFormData {
  name: string;
  active?: boolean;
}

export type Profession = 'MEDICO' | 'PSICOLOGO' | 'NUTRICIONISTA';
export type RegistryType = 'CRM' | 'CRP' | 'CFN';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'BLOCKED';
export type DocumentType = 'photo' | 'council-doc' | 'specialization-doc' | 'acceptance-term';

export interface Doctor {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  status: UserStatus;
  profession: Profession;
  registry_type: RegistryType;
  registry_number: string;
  registry_uf?: string;
  rqe?: string;
  photo_url?: string;
  council_doc_url?: string;
  specialization_doc_url?: string;
  acceptance_term_url?: string;
  approved_at?: string;
  created_at?: string;
  specialties?: Specialty[];
  temporary_password?: string;
}

export interface DoctorFormData {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  status: UserStatus;
  profession: Profession;
  registry_type: RegistryType;
  registry_number: string;
  registry_uf?: string;
  rqe?: string;
  specialty_ids: number[];
  approved: boolean;
  photo_url?: string;
  council_doc_url?: string;
  specialization_doc_url?: string;
  acceptance_term_url?: string;
}

export interface UpdateDoctorFormData {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  status?: UserStatus;
  profession?: Profession;
  registry_type?: RegistryType;
  registry_number?: string;
  registry_uf?: string;
  rqe?: string;
  specialty_ids?: number[];
  approved?: boolean;
  photo_url?: string | null;
  council_doc_url?: string | null;
  specialization_doc_url?: string | null;
  acceptance_term_url?: string | null;
}

export interface UploadResponse {
  url: string;
}

// Beneficiários
export type BeneficiaryType = 'TITULAR' | 'DEPENDENTE';
export type ServiceType = 'CLINICO' | 'PREMIUM' | 'FAMILIAR';
export type BeneficiaryStatus = 'ACTIVE' | 'INACTIVE';

export interface Beneficiary {
  id: number;
  type: BeneficiaryType;
  titular_id?: number;
  name: string;
  cpf: string;
  birth_date: string;
  phone?: string;
  email?: string;
  cep?: string;
  city?: string;
  state?: string;
  address?: string;
  service_type: ServiceType;
  status: BeneficiaryStatus;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  titular?: Beneficiary;
  dependents?: Beneficiary[];
}

export interface BeneficiaryFormData {
  type: BeneficiaryType;
  titular_id?: number;
  name: string;
  cpf: string;
  birth_date: string;
  phone?: string;
  email?: string;
  password?: string;
  cep?: string;
  city?: string;
  state?: string;
  address?: string;
  service_type: ServiceType;
}