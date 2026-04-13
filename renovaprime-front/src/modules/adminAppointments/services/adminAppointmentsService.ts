import { apiClient } from '../../../services/api';
import type { ApiResponse } from '../../../types/api';
import type {
  AdminAppointmentsResponse,
  AdminAppointmentsFiltersParams,
  AdminAppointmentDetails,
  AdminAppointmentSlot,
  CreateAdminAppointmentData,
} from '../types/adminAppointments.types';
import type { Specialty, Beneficiary } from '../../../types/api';

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

  async listAppointmentSpecialties(): Promise<Specialty[]> {
    const response = await apiClient.get<ApiResponse<Specialty[]>>('/admin/appointments/specialties');
    return response.data;
  }

  async listActiveBeneficiaries(): Promise<Beneficiary[]> {
    const response = await apiClient.get<ApiResponse<Beneficiary[]>>('/admin/beneficiaries?status=ACTIVE');
    const flat = new Map<number, Beneficiary>();

    response.data.forEach((beneficiary) => {
      flat.set(beneficiary.id, beneficiary);
      beneficiary.dependents?.forEach((dependent) => {
        flat.set(dependent.id, dependent);
      });
    });

    return Array.from(flat.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getMonthAvailability(specialtyId: number, year: number, month: number): Promise<number[]> {
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const response = await apiClient.get<ApiResponse<number[]>>(
      `/admin/appointments/availability/specialty/${specialtyId}/month/${yearMonth}`
    );
    return response.data;
  }

  async getDaySlots(specialtyId: number, date: string): Promise<AdminAppointmentSlot[]> {
    const response = await apiClient.get<ApiResponse<AdminAppointmentSlot[]>>(
      `/admin/appointments/availability/specialty/${specialtyId}/day/${date}`
    );
    return response.data;
  }

  async create(data: CreateAdminAppointmentData): Promise<AdminAppointmentDetails> {
    const response = await apiClient.post<ApiResponse<AdminAppointmentDetails>>('/admin/appointments', data);
    return response.data;
  }
}

export const adminAppointmentsService = new AdminAppointmentsService();
