import { apiClient } from './api';
import type { ApiResponse } from '../types/api';

interface MemedTokenResponse {
  token: string;
}

interface PrescricaoImpressa {
  alterada?: boolean;
  reimpressao?: boolean;
  prescricao?: {
    id: number;
    prescriptionUuid: string;
    signed?: number;
    paciente?: {
      id: number;
      nome?: string;
      cpf?: string;
    };
    medicamentos?: unknown[];
    documents?: unknown[];
    [key: string]: unknown;
  };
}

interface SavePrescriptionPayload {
  memed_prescription_id: number;
  memed_uuid: string;
  memed_patient_id: number | null;
  memed_payload: PrescricaoImpressa;
}

class MemedService {
  async getPrescriberToken(): Promise<string> {
    const response = await apiClient.get<ApiResponse<MemedTokenResponse>>('/doctors/me/memed-token');
    return response.data.token;
  }

  async savePrescription(appointmentId: number, data: PrescricaoImpressa): Promise<void> {
    if (!data?.prescricao?.id || !data?.prescricao?.prescriptionUuid) {
      throw new Error('Payload inválido: prescricao.id e prescricao.prescriptionUuid são obrigatórios');
    }

    const payload: SavePrescriptionPayload = {
      memed_prescription_id: data.prescricao.id,
      memed_uuid: data.prescricao.prescriptionUuid,
      memed_patient_id: data.prescricao.paciente?.id ?? null,
      memed_payload: data,
    };

    await apiClient.post<ApiResponse<unknown>>(`/prescriptions/${appointmentId}`, payload);
  }

  async markPrescriptionDeleted(memedPrescriptionId: number): Promise<void> {
    await apiClient.patch<ApiResponse<unknown>>(`/prescriptions/${memedPrescriptionId}/mark-deleted`);
  }
}

export const memedService = new MemedService();
