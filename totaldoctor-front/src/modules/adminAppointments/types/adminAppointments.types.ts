export interface AdminAppointmentSpecialty {
  id: number;
  name: string;
}

export interface AdminAppointmentBeneficiary {
  id: number;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
}

export interface AdminAppointmentDoctor {
  id: number;
  name: string | null;
  email?: string;
  photo_url?: string;
}

export interface AdminAppointmentLog {
  id: number;
  action: 'CREATED' | 'STARTED' | 'FINISHED' | 'CANCELED';
  performed_by: {
    id: number;
    name: string;
  } | null;
  created_at: string;
}

export interface AdminAppointmentItem {
  id: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELED';
  type: 'ONLINE' | 'PRESENTIAL';
  date: string;
  start_time: string;
  end_time: string;
  specialty: AdminAppointmentSpecialty | null;
  doctor: AdminAppointmentDoctor | null;
  beneficiary: AdminAppointmentBeneficiary | null;
  finished_at?: string | null;
  canceled_at?: string | null;
}

export interface AdminAppointmentDetails extends AdminAppointmentItem {
  created_at: string;
  updated_at: string;
  logs: AdminAppointmentLog[];
}

export interface AdminAppointmentsResponse {
  items: AdminAppointmentItem[];
  page: number;
  limit: number;
  total: number;
}

export interface AdminAppointmentsFiltersParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  specialtyId?: number;
  doctorId?: number;
  beneficiaryId?: number;
  type?: 'ONLINE' | 'PRESENTIAL';
  search?: string;
  page?: number;
  limit?: number;
}
