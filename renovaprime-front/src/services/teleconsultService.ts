import { apiClient } from './api';
import type { ApiResponse } from '../types/api';

const log = (...args: unknown[]) => console.log('[Teleconsult]', ...args);

export interface RoomData {
  appointment_id: number;
  appointment_status: string;
  beneficiary_id: number;
  roomName: string;
  accessToken: string;
  displayName: string;
  doctorDisplayName: string;
  beneficiaryDisplayName: string;
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
    log('getRoom request', { appointmentId });
    const response = await apiClient.get<ApiResponse<RoomData>>(
      `/teleconsult/room/${appointmentId}`
    );
    const data = response.data;
    log('getRoom response', {
      appointmentId,
      roomName: data.roomName,
      role: data.role,
      appointment_status: data.appointment_status,
      displayName: data.displayName,
      accessTokenLength: data.accessToken?.length
    });
    return data;
  }

  /**
   * Finaliza a teleconsulta (apenas médico)
   */
  async endAppointment(appointmentId: number): Promise<{ ok: boolean }> {
    log('endAppointment request', { appointmentId });
    const response = await apiClient.post<ApiResponse<{ ok: boolean }>>(
      `/teleconsult/appointments/${appointmentId}/end`
    );
    log('endAppointment response', { appointmentId, ...response.data });
    return response.data;
  }

  /**
   * Verifica disponibilidade da teleconsulta
   */
  async checkAvailability(appointmentId: number): Promise<TeleconsultAvailability> {
    const response = await apiClient.get<ApiResponse<TeleconsultAvailability>>(
      `/teleconsult/appointments/${appointmentId}/availability`
    );
    const data = response.data;
    const noisyWait =
      data.available === false &&
      data.reason === 'Waiting for doctor to start the consultation';
    if (!noisyWait) {
      log('checkAvailability response', { appointmentId, ...data });
    }
    return data;
  }
}

export const teleconsultService = new TeleconsultService();
