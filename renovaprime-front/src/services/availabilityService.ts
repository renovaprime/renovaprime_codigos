import { apiClient } from './api';
import type { ApiResponse, AvailableSlot } from '../types/api';

class AvailabilityService {
  async getMonthAvailability(specialtyId: number, year: number, month: number): Promise<number[]> {
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const response = await apiClient.get<ApiResponse<number[]>>(
      `/patient/availability/specialty/${specialtyId}/month/${yearMonth}`
    );
    return response.data;
  }

  async getDaySlots(specialtyId: number, date: string): Promise<AvailableSlot[]> {
    const response = await apiClient.get<ApiResponse<AvailableSlot[]>>(
      `/patient/availability/specialty/${specialtyId}/day/${date}`
    );
    return response.data;
  }
}

export const availabilityService = new AvailabilityService();
