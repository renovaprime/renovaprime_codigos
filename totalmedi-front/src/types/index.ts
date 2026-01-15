export interface User {
  email: string;
  token: string;
  userType: string;
}

export interface Doctor {
  id: string;
  name: string;
  cpf: string;
  email: string;
  registrationDate: string;
  birthDate: string;
  gender: string;
  crm: string;
  crmState: string;
  rqe: string;
  certifications: string[];
  specialties: string[];
  phone: string;
  commercialPhone: string;
  address: string;
  bankInfo: {
    bank: string;
    agency: string;
    account: string;
    accountType: string;
    pix: string;
  };
  schedule: string[];
  modality: string;
  languages: string[];
  consultationTime: number;
  photoUrl: string;
  crmDocumentUrl: string;
  specialtyDocumentUrl: string;
  acceptanceTermUrl: string;
}

export interface Beneficiary {
  id: string;
  uuid: string;
  name: string;
  cpf: string;
  birthDate: string;
  birthday: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  planType: string;
  paymentType: string;
  serviceType: string;
  status: 'active' | 'inactive';
  isActive: boolean;
  nome_revendedor?: string;
  nome_filial?: string;
  nome_parceiro?: string;
  holder?: string;
  dependents?: Beneficiary[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  status: 'SCHEDULED' | 'FINISHED' | 'UNFINISHED' | 'CANCELED';
  type: 'presential' | 'online';
  datetime: string;
  specialty: string;
}

export interface Depoimento {
  id: string;
  arquivo_path: string;
}