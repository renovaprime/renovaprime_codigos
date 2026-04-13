import { apiClient } from './api';
import type { ApiResponse, Appointment, DoctorDashboard } from '../types/api';

export interface DoctorAppointmentFilters {
  date?: string;
  from?: string;
  to?: string;
  status?: string;
}

class DoctorAppointmentService {
  async getDashboard(): Promise<DoctorDashboard> {
    const response = await apiClient.get<ApiResponse<DoctorDashboard>>('/doctors/dashboard');
    return response.data;
  }

  async listMyAppointments(filters: DoctorAppointmentFilters = {}): Promise<Appointment[]> {
    const params = new URLSearchParams();

    if (filters.date) params.append('date', filters.date);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = `/doctors/appointments${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponse<Appointment[]>>(endpoint);
    return response.data;
  }

  async startAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.post<ApiResponse<Appointment>>(`/appointments/${id}/start`);
    return response.data;
  }

  async finishAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.post<ApiResponse<Appointment>>(`/appointments/${id}/finish`);
    return response.data;
  }

  async cancelAppointment(id: number): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/appointments/${id}/cancel`);
  }
}

export const doctorAppointmentService = new DoctorAppointmentService();
