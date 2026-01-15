import { apiClient } from './api';
import type { ApiResponse, Specialty, SpecialtyFormData } from '../types/api';

class SpecialtyService {
  async listSpecialties(): Promise<Specialty[]> {
    const response = await apiClient.get<ApiResponse<Specialty[]>>('/admin/specialties');
    return response.data;
  }

  async createSpecialty(data: SpecialtyFormData): Promise<Specialty> {
    const response = await apiClient.post<ApiResponse<Specialty>>('/admin/specialties', data);
    return response.data;
  }

  async updateSpecialty(id: number, data: SpecialtyFormData): Promise<Specialty> {
    const response = await apiClient.put<ApiResponse<Specialty>>(`/admin/specialties/${id}`, data);
    return response.data;
  }

  async toggleSpecialty(id: number): Promise<Specialty> {
    const response = await apiClient.patch<ApiResponse<Specialty>>(`/admin/specialties/${id}/toggle`);
    return response.data;
  }

  async deleteSpecialty(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/specialties/${id}`);
  }
}

export const specialtyService = new SpecialtyService();
