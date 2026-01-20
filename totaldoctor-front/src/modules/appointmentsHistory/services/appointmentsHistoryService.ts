import { apiClient } from '../../../services/api';
import type { ApiResponse } from '../../../types/api';
import type { AppointmentHistoryResponse, AppointmentHistoryFilters } from '../types/appointmentsHistory.types';

class AppointmentsHistoryService {
  async listDoctorHistory(filters: AppointmentHistoryFilters = {}): Promise<AppointmentHistoryResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.specialtyId) params.append('specialtyId', String(filters.specialtyId));
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const endpoint = `/doctors/appointments/history${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponse<AppointmentHistoryResponse>>(endpoint);
    return response.data;
  }

  async listPatientHistory(filters: AppointmentHistoryFilters = {}): Promise<AppointmentHistoryResponse> {
    const params = new URLSearchParams();

    if (filters.beneficiaryId) params.append('beneficiaryId', String(filters.beneficiaryId));
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.specialtyId) params.append('specialtyId', String(filters.specialtyId));
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const endpoint = `/patient/appointments/history${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponse<AppointmentHistoryResponse>>(endpoint);
    return response.data;
  }
}

export const appointmentsHistoryService = new AppointmentsHistoryService();
