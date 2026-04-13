export interface VitalsData {
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  spo2?: number;
  respiratory_rate?: number;
}

export type RecordStatus = 'DRAFT' | 'SIGNED';
export type AttachmentCategory = 'EXAM' | 'IMAGE' | 'REPORT' | 'CERTIFICATE' | 'REFERRAL' | 'OTHER';
export type AuditAction = 'CREATED' | 'UPDATED' | 'SIGNED' | 'VIEWED' | 'ATTACHMENT_ADDED';

export interface RecordAttachment {
  id: number;
  medical_record_id: number;
  category: AttachmentCategory;
  file_name: string;
  file_url: string;
  mime_type?: string;
  uploaded_by: number;
  created_at: string;
}

export interface MedicalRecord {
  id: number;
  appointment_id: number;
  beneficiary_id: number;
  doctor_id: number;
  // Anamnese
  chief_complaint?: string;
  hpi?: string;
  personal_history?: string;
  surgical_history?: string;
  allergies?: string;
  current_medications?: string;
  comorbidities?: string;
  habits?: string;
  family_history?: string;
  // Exame
  vitals_json?: VitalsData;
  physical_exam?: string;
  assessment?: string;
  diagnosis?: string;
  cid10?: string;
  // Conduta
  plan?: string;
  guidance?: string;
  return_instructions?: string;
  red_flags?: string;
  referrals?: string;
  exam_requests?: string;
  // Controle
  status: RecordStatus;
  signed_at?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  attachments?: RecordAttachment[];
  Appointment?: {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    type: string;
    status: string;
    Specialty?: { id: number; name: string };
    Prescription?: { id: number; memed_uuid: string; signed: boolean } | null;
  };
  Beneficiary?: {
    id: number;
    name: string;
    cpf?: string;
  };
  Doctor?: {
    id: number;
    User?: { id: number; name: string; email: string };
  };
}

export interface CreateRecordData {
  appointment_id: number;
  chief_complaint?: string;
  hpi?: string;
  personal_history?: string;
  surgical_history?: string;
  allergies?: string;
  current_medications?: string;
  comorbidities?: string;
  habits?: string;
  family_history?: string;
  vitals_json?: VitalsData;
  physical_exam?: string;
  assessment?: string;
  diagnosis?: string;
  cid10?: string;
  plan?: string;
  guidance?: string;
  return_instructions?: string;
  red_flags?: string;
  referrals?: string;
  exam_requests?: string;
}

export interface UpdateRecordData {
  chief_complaint?: string;
  hpi?: string;
  personal_history?: string;
  surgical_history?: string;
  allergies?: string;
  current_medications?: string;
  comorbidities?: string;
  habits?: string;
  family_history?: string;
  vitals_json?: VitalsData;
  physical_exam?: string;
  assessment?: string;
  diagnosis?: string;
  cid10?: string;
  plan?: string;
  guidance?: string;
  return_instructions?: string;
  red_flags?: string;
  referrals?: string;
  exam_requests?: string;
}

export interface PatientSummaryData {
  beneficiary: {
    id: number;
    name: string;
    cpf: string;
    birth_date: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    cep?: string;
  };
  clinical: {
    allergies?: string | null;
    current_medications?: string | null;
    comorbidities?: string | null;
    personal_history?: string | null;
    surgical_history?: string | null;
    habits?: string | null;
    family_history?: string | null;
    last_diagnosis?: string | null;
    last_cid10?: string | null;
  };
  stats: {
    total_appointments: number;
    total_records: number;
    last_record_date?: string | null;
  };
}

export interface RecordAuditLogEntry {
  id: number;
  medical_record_id: number;
  actor_id: number;
  action: AuditAction;
  changes_json?: Record<string, { old: unknown; new: unknown }>;
  ip?: string;
  user_agent?: string;
  created_at: string;
  actor?: { id: number; name: string; email: string };
  MedicalRecord?: { id: number; appointment_id: number };
}

export interface ConsentData {
  id: number;
  beneficiary_id: number;
  appointment_id: number;
  type: string;
  version: string;
  accepted: boolean;
  accepted_at?: string;
  ip?: string;
  created_at: string;
}

export interface CreateConsentData {
  appointment_id: number;
  beneficiary_id: number;
  version: string;
  accepted: boolean;
}

export interface AddAttachmentData {
  category: AttachmentCategory;
  file_name: string;
  file_url: string;
  mime_type?: string;
}
