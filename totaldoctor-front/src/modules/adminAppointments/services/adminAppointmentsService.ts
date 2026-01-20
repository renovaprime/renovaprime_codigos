import { apiClient } from '../../../services/api';
import type { ApiResponse } from '../../../types/api';
import type {
  AdminAppointmentsResponse,
  AdminAppointmentsFiltersParams,
  AdminAppointmentDetails,
} from '../types/adminAppointments.types';

class AdminAppointmentsService {
  async listAppointments(filters: AdminAppointmentsFiltersParams = {}): Promise<AdminAppointmentsResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.specialtyId) params.append('specialtyId', String(filters.specialtyId));
    if (filters.doctorId) params.append('doctorId', String(filters.doctorId));
    if (filters.beneficiaryId) params.append('beneficiaryId', String(filters.beneficiaryId));
    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const endpoint = `/admin/appointments${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponse<AdminAppointmentsResponse>>(endpoint);
    return response.data;
  }

  async listHistory(filters: AdminAppointmentsFiltersParams = {}): Promise<AdminAppointmentsResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.specialtyId) params.append('specialtyId', String(filters.specialtyId));
    if (filters.doctorId) params.append('doctorId', String(filters.doctorId));
    if (filters.beneficiaryId) params.append('beneficiaryId', String(filters.beneficiaryId));
    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const endpoint = `/admin/appointments/history${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponse<AdminAppointmentsResponse>>(endpoint);
    return response.data;
  }

  async getById(id: number): Promise<AdminAppointmentDetails> {
    const response = await apiClient.get<ApiResponse<AdminAppointmentDetails>>(`/admin/appointments/${id}`);
    return response.data;
  }

  async cancel(id: number): Promise<{ ok: boolean }> {
    const response = await apiClient.post<ApiResponse<{ ok: boolean }>>(`/admin/appointments/${id}/cancel`);
    return response.data;
  }
}

export const adminAppointmentsService = new AdminAppointmentsService();
