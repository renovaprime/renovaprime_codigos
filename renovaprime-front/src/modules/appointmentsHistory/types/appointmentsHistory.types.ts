export interface AppointmentHistorySpecialty {
  id: number;
  name: string;
}

export interface AppointmentHistoryBeneficiary {
  id: number;
  name: string;
  cpf: string;
}

export interface AppointmentHistoryDoctor {
  id: number;
  name: string | null;
  photo_url?: string;
}

export interface AppointmentHistoryItem {
  id: number;
  status: 'FINISHED' | 'CANCELED';
  type: 'ONLINE' | 'PRESENTIAL';
  date: string;
  start_time: string;
  end_time: string;
  specialty: AppointmentHistorySpecialty | null;
  beneficiary: AppointmentHistoryBeneficiary | null;
  doctor: AppointmentHistoryDoctor | null;
  finished_at: string | null;
  canceled_at: string | null;
}

export interface AppointmentHistoryResponse {
  items: AppointmentHistoryItem[];
  page: number;
  limit: number;
  total: number;
}

export interface AppointmentHistoryFilters {
  status?: 'FINISHED' | 'CANCELED';
  startDate?: string;
  endDate?: string;
  specialtyId?: number;
  search?: string;
  page?: number;
  limit?: number;
  beneficiaryId?: number;
}
