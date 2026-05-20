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
  cpf?: string;
  birth_date?: string;
  gender?: Gender;
  photo_url?: string;
  council_doc_url?: string;
  specialization_doc_url?: string;
  acceptance_term_url?: string;
  approved_at?: string;
  created_at?: string;
  specialties?: Specialty[];
  temporary_password?: string;
  memed_external_id?: string;
}

export type Gender = 'M' | 'F';

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
  cpf?: string;
  birth_date?: string;
  gender?: Gender;
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
  cpf?: string;
  birth_date?: string;
  gender?: Gender;
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
  user_id?: number | null;
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
  /** Admin liberou Face Scan (VitalScan) para este beneficiário */
  face_scan_enabled?: boolean;
  /** Paciente solicitou pelo app; aguardando liberação */
  face_scan_requested?: boolean;
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

// Appointments
export type AppointmentType = 'ONLINE' | 'PRESENTIAL';
export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELED';

export interface Appointment {
  id: number;
  doctor_id: number;
  patient_id?: number | null;
  beneficiary_id?: number;
  specialty_id: number;
  date: string;
  start_time: string;
  end_time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  created_at: string;
  updated_at?: string;

  // Relacionamentos
  doctor?: {
    id: number;
    name: string;
    photo_url?: string;
  };
  Patient?: {
    id: number;
    phone?: string;
    User?: {
      id: number;
      name: string;
      email: string;
    };
  } | null;
  patient?: {
    id: number;
    phone?: string;
    User?: {
      id: number;
      name: string;
      email: string;
    };
  };
  Beneficiary?: {
    id: number;
    name: string;
    cpf: string;
    phone?: string;
  } | null;
  beneficiary?: {
    id: number;
    name: string;
    cpf: string;
    phone?: string;
  };
  Specialty?: Specialty;
  specialty?: Specialty;
  TeleconsultRoom?: {
    id: number;
    appointment_id?: number;
    room_name?: string;
    doctor_link?: string;
    patient_link?: string;
    started_at?: string | null;
    ended_at?: string | null;
  };
  teleconsult_room?: {
    id: number;
    room_name?: string;
    doctor_link?: string;
    patient_link?: string;
    started_at?: string | null;
    ended_at?: string | null;
  };
}

export interface AvailableSlot {
  time: string;         // "08:00:00"
  doctor_id: number;
  duration: number;     // minutos
}

export interface CreateAppointmentData {
  specialty_id: number;
  date: string;         // YYYY-MM-DD
  start_time: string;   // HH:MM:SS
  beneficiary_id?: number;
}

// Partners
export interface Partner {
  id: number;
  name: string;
  cnpj?: string;
  email: string;
  bank_agency?: string;
  bank_account?: string;
  bank_digit?: string;
  pix_key?: string;
  logo_url?: string;
  website_url?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  branches?: PartnerBranch[];
}

export interface PartnerFormData {
  name: string;
  cnpj?: string;
  email: string;
  password?: string;
  bank_agency?: string;
  bank_account?: string;
  bank_digit?: string;
  pix_key?: string;
  logo_url?: string;
  website_url?: string;
}

// Partner Branches (Filiais)
export interface PartnerBranch {
  id: number;
  partner_id: number;
  name: string;
  alias?: string;
  address?: string;
  email: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  Partner?: { id: number; name: string };
  resellers?: Reseller[];
}

export interface BranchFormData {
  partner_id: number;
  name: string;
  alias?: string;
  address?: string;
  email: string;
  password?: string;
}

// Resellers (Revendedores)
export interface Reseller {
  id: number;
  branch_id: number;
  name: string;
  cpf: string;
  role?: string;
  email?: string;
  pix_key?: string;
  phone?: string;
  functional_unit?: string;
  registration_code?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  PartnerBranch?: {
    id: number;
    name: string;
    partner_id: number;
    Partner?: { id: number; name: string };
  };
}

export interface ResellerFormData {
  branch_id: number;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  pix_key?: string;
  functional_unit?: string;
  registration_code?: string;
}

// Plan Commissions
export type PlanType = 'CLINICO' | 'PREMIUM' | 'FAMILIAR';

export interface PlanCommission {
  id: number | null;
  partner_id: number;
  plan_type: PlanType;
  partner_pct: number;
  branch_pct: number;
  reseller_pct: number;
  active: boolean;
}

export interface PlanCommissionInput {
  plan_type: PlanType;
  partner_pct: number;
  branch_pct: number;
  reseller_pct: number;
}

// Doctor Dashboard
export interface DoctorDashboardAppointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  beneficiary: {
    id: number;
    name: string;
    cpf: string;
    phone?: string;
  } | null;
  specialty: {
    id: number;
    name: string;
  } | null;
  teleconsultRoom: {
    id: number;
    roomName: string;
    doctorLink: string;
  } | null;
}

export interface DoctorDashboard {
  today: {
    total: number;
    scheduled: number;
    inProgress: number;
    finished: number;
  };
  currentAppointment: DoctorDashboardAppointment | null;
  nextAppointment: DoctorDashboardAppointment | null;
  finishedAppointments: DoctorDashboardAppointment[];
}

// Admin Dashboard
export interface AdminDashboard {
  users: {
    active: number;
    pending: number;
    blocked: number;
  };
  doctors: {
    total: number;
    approved: number;
    pending: number;
  };
  beneficiaries: {
    active: number;
    inactive: number;
  };
  appointmentsToday: {
    total: number;
    scheduled: number;
    inProgress: number;
    finished: number;
  };
  appointments: {
    total: number;
    scheduled: number;
    inProgress: number;
    finished: number;
    canceled: number;
  };
  teleconsults: {
    active: number;
    finished: number;
  };
}

// Doctor Prescriptions
export interface PatientWithAppointment {
  name: string;
  cpf: string;
  lastAppointmentDate: string;
  lastAppointmentTime?: string;
  specialty: { id: number; name: string } | null;
  hasPrescription: boolean;
  beneficiaryId?: number | null;
  patientId?: number | null;
  appointmentId?: number;
}

export interface PrescriptionWithAppointment {
  id: number;
  memed_prescription_id: number;
  memed_uuid: string;
  issued_at: string;
  signed: boolean;
  memed_patient_link: string | null;
  memed_patient_digits: string | null;
  appointment: {
    date: string;
    start_time: string;
    specialty: { id: number; name: string } | null;
  };
}

// CMS
export interface CmsEntry {
  key: string;
  title: string;
  content: string;
}

// Subscription
export interface SubscriptionPlan {
  name: string;
  type: ServiceType;
  price: number;
}

export interface SubscriptionBeneficiary {
  id: number;
  name: string;
  type: BeneficiaryType;
  cpf: string;
  status: BeneficiaryStatus;
}

export interface SubscriptionData {
  plan: SubscriptionPlan;
  status: BeneficiaryStatus;
  payment_status: string | null;
  subscribed_at: string;
  beneficiaries: SubscriptionBeneficiary[];
}