import { apiClient } from './api';
import type { ApiResponse, Appointment, CreateAppointmentData, Beneficiary } from '../types/api';

class AppointmentService {
  async listMyAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<ApiResponse<Appointment[]>>('/patient/appointments');
    return response.data;
  }

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await apiClient.post<ApiResponse<Appointment>>('/patient/appointments', data);
    return response.data;
  }

  async cancelAppointment(id: number): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/patient/appointments/${id}/cancel`);
  }

  async getMyBeneficiaries(): Promise<Beneficiary[]> {
    const response = await apiClient.get<ApiResponse<Beneficiary[]>>('/patient/beneficiaries');
    return response.data;
  }
}

export const appointmentService = new AppointmentService();
