import { apiClient } from '../../../services/api';
import type { ApiResponse } from '../../../types/api';
import type {
  MedicalRecord,
  CreateRecordData,
  UpdateRecordData,
  PatientSummaryData,
  RecordAttachment,
  RecordAuditLogEntry,
  ConsentData,
  CreateConsentData,
  AddAttachmentData,
} from '../types/medicalRecord';

class MedicalRecordApiService {
  // --------------- Records ---------------

  async createRecord(data: CreateRecordData): Promise<MedicalRecord> {
    const response = await apiClient.post<ApiResponse<MedicalRecord>>('/medical-records', data);
    return response.data;
  }

  async updateRecord(id: number, data: UpdateRecordData): Promise<MedicalRecord> {
    const response = await apiClient.put<ApiResponse<MedicalRecord>>(`/medical-records/${id}`, data);
    return response.data;
  }

  async signRecord(id: number): Promise<MedicalRecord> {
    const response = await apiClient.post<ApiResponse<MedicalRecord>>(`/medical-records/${id}/sign`);
    return response.data;
  }

  async getRecord(id: number): Promise<MedicalRecord> {
    const response = await apiClient.get<ApiResponse<MedicalRecord>>(`/medical-records/${id}`);
    return response.data;
  }

  async getRecordByAppointment(appointmentId: number): Promise<MedicalRecord | null> {
    const response = await apiClient.get<ApiResponse<MedicalRecord | null>>(`/medical-records/appointment/${appointmentId}`);
    return response.data;
  }

  async getPatientRecords(beneficiaryId: number): Promise<MedicalRecord[]> {
    const response = await apiClient.get<ApiResponse<MedicalRecord[]>>(`/medical-records/patient/${beneficiaryId}`);
    return response.data;
  }

  async getPatientSummary(beneficiaryId: number): Promise<PatientSummaryData> {
    const response = await apiClient.get<ApiResponse<PatientSummaryData>>(`/medical-records/patient/${beneficiaryId}/summary`);
    return response.data;
  }

  async getMyRecords(): Promise<MedicalRecord[]> {
    const response = await apiClient.get<ApiResponse<MedicalRecord[]>>('/medical-records/my-records');
    return response.data;
  }

  // --------------- Attachments ---------------

  async addAttachment(recordId: number, data: AddAttachmentData): Promise<RecordAttachment> {
    const response = await apiClient.post<ApiResponse<RecordAttachment>>(`/medical-records/${recordId}/attachments`, data);
    return response.data;
  }

  async getAttachments(recordId: number): Promise<RecordAttachment[]> {
    const response = await apiClient.get<ApiResponse<RecordAttachment[]>>(`/medical-records/${recordId}/attachments`);
    return response.data;
  }

  async deleteAttachment(recordId: number, attachmentId: number): Promise<void> {
    await apiClient.delete(`/medical-records/${recordId}/attachments/${attachmentId}`);
  }

  // --------------- Audit ---------------

  async getAuditLogs(recordId: number): Promise<RecordAuditLogEntry[]> {
    const response = await apiClient.get<ApiResponse<RecordAuditLogEntry[]>>(`/medical-records/${recordId}/audit`);
    return response.data;
  }

  async getPatientAuditLogs(beneficiaryId: number): Promise<RecordAuditLogEntry[]> {
    const response = await apiClient.get<ApiResponse<RecordAuditLogEntry[]>>(`/medical-records/patient/${beneficiaryId}/audit`);
    return response.data;
  }

  // --------------- Consent ---------------

  async createConsent(data: CreateConsentData): Promise<ConsentData> {
    const response = await apiClient.post<ApiResponse<ConsentData>>('/medical-records/consents', data);
    return response.data;
  }

  async getConsent(appointmentId: number): Promise<ConsentData | null> {
    const response = await apiClient.get<ApiResponse<ConsentData | null>>(`/medical-records/consents/appointment/${appointmentId}`);
    return response.data;
  }
}

export const medicalRecordApiService = new MedicalRecordApiService();
