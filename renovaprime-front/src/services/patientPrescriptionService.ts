import { apiClient } from './api';
import type { ApiResponse, PrescriptionWithAppointment } from '../types/api';

export interface PrescriptionLinkResponse {
  link: string;
  digits: string;
}

class PatientPrescriptionService {
  async listMyPrescriptions(): Promise<PrescriptionWithAppointment[]> {
    const response = await apiClient.get<ApiResponse<PrescriptionWithAppointment[]>>(
      '/prescriptions/patient'
    );
    return response.data;
  }

  async getPrescriptionLink(prescriptionId: number): Promise<PrescriptionLinkResponse> {
    const response = await apiClient.get<ApiResponse<PrescriptionLinkResponse>>(
      `/prescriptions/${prescriptionId}/patient-link`
    );
    return response.data;
  }
}

export const patientPrescriptionService = new PatientPrescriptionService();
