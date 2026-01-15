import { apiClient } from './api';
import type { ApiResponse, Doctor, DoctorFormData, UpdateDoctorFormData, Specialty } from '../types/api';

class DoctorService {
  async createDoctor(data: DoctorFormData): Promise<Doctor> {
    const response = await apiClient.post<ApiResponse<Doctor>>('/admin/doctors', data);
    return response.data;
  }

  async listActiveDoctors(): Promise<Doctor[]> {
    const response = await apiClient.get<ApiResponse<Doctor[]>>('/admin/doctors');
    return response.data;
  }

  async getDoctorById(id: number): Promise<Doctor> {
    const response = await apiClient.get<ApiResponse<Doctor>>(`/admin/doctors/${id}`);
    return response.data;
  }

  async updateDoctor(id: number, data: UpdateDoctorFormData): Promise<Doctor> {
    const response = await apiClient.put<ApiResponse<Doctor>>(`/admin/doctors/${id}`, data);
    return response.data;
  }

  async deleteDoctor(id: number): Promise<void> {
    await apiClient.delete(`/admin/doctors/${id}`);
  }

  async listActiveSpecialties(): Promise<Specialty[]> {
    const response = await apiClient.get<ApiResponse<Specialty[]>>('/admin/specialties');
    // Filtrar apenas especialidades ativas
    return response.data.filter(specialty => specialty.active);
  }

  async listPendingDoctors(): Promise<Doctor[]> {
    const response = await apiClient.get<ApiResponse<Doctor[]>>('/admin/doctors/pending');
    return response.data;
  }

  async approveDoctor(id: number): Promise<void> {
    await apiClient.post(`/admin/doctors/${id}/approve`);
  }

  async rejectDoctor(id: number): Promise<void> {
    await apiClient.post(`/admin/doctors/${id}/reject`);
  }
}

export const doctorService = new DoctorService();
