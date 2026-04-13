import { apiClient } from './api';
import type { ApiResponse, PatientWithAppointment, PrescriptionWithAppointment } from '../types/api';

class DoctorPrescriptionService {
  async listPatientsWithAppointments(): Promise<PatientWithAppointment[]> {
    const response = await apiClient.get<ApiResponse<PatientWithAppointment[]>>(
      '/doctors/patients-with-appointments'
    );
    return response.data;
  }

  async listPrescriptionsByPatient(
    beneficiaryId?: number | null,
    patientId?: number | null
  ): Promise<PrescriptionWithAppointment[]> {
    const params = new URLSearchParams();

    if (beneficiaryId) params.append('beneficiaryId', String(beneficiaryId));
    if (patientId) params.append('patientId', String(patientId));

    const queryString = params.toString();
    const endpoint = `/doctors/prescriptions/by-patient${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponse<PrescriptionWithAppointment[]>>(endpoint);
    return response.data;
  }
}

export const doctorPrescriptionService = new DoctorPrescriptionService();
