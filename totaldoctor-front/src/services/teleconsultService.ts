import { apiClient } from './api';
import type { ApiResponse } from '../types/api';

export interface RoomData {
  appointment_id: number;
  appointment_status: string;
  roomName: string;
  accessToken: string;
  displayName: string;
  role: 'doctor' | 'patient';
}

export interface TeleconsultAvailability {
  available: boolean;
  reason?: string;
}

class TeleconsultService {
  /**
   * Obtém dados da sala de teleconsulta para Twilio
   */
  async getRoom(appointmentId: number): Promise<RoomData> {
    const response = await apiClient.get<ApiResponse<RoomData>>(
      `/teleconsult/room/${appointmentId}`
    );
    return response.data;
  }

  /**
   * Finaliza a teleconsulta (apenas médico)
   */
  async endAppointment(appointmentId: number): Promise<{ ok: boolean }> {
    const response = await apiClient.post<ApiResponse<{ ok: boolean }>>(
      `/teleconsult/appointments/${appointmentId}/end`
    );
    return response.data;
  }

  /**
   * Verifica disponibilidade da teleconsulta
   */
  async checkAvailability(appointmentId: number): Promise<TeleconsultAvailability> {
    const response = await apiClient.get<ApiResponse<TeleconsultAvailability>>(
      `/teleconsult/appointments/${appointmentId}/availability`
    );
    return response.data;
  }
}

export const teleconsultService = new TeleconsultService();
