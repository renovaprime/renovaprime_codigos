import { apiClient } from './api';
import type { ApiResponse } from '../types/api';

export interface RoomData {
  appointment_id: number;
  appointment_status: string;
  room_id: string;
  doctor_peer_id: string | null; // Preenchido apenas para paciente
  peer_server: {
    path: string;
    secure: boolean;
  };
}

export interface TeleconsultAvailability {
  available: boolean;
  reason?: string;
}

class TeleconsultService {
  /**
   * Obtém dados da sala de teleconsulta
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

  /**
   * Registra o peer ID do médico após conectar
   */
  async registerPeerId(appointmentId: number, peerId: string): Promise<{ ok: boolean }> {
    const response = await apiClient.post<ApiResponse<{ ok: boolean }>>(
      `/teleconsult/appointments/${appointmentId}/register-peer`,
      { peerId }
    );
    return response.data;
  }

  /**
   * Obtém a URL base do PeerServer
   */
  getPeerServerConfig() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    // Remove /api/v1 para obter a URL base
    const baseUrl = apiUrl.replace('/api/v1', '');
    const url = new URL(baseUrl);

    return {
      host: url.hostname,
      port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
      path: '/peerjs',
      secure: url.protocol === 'https:',
      key: 'peerjs'
    };
  }
}

export const teleconsultService = new TeleconsultService();
