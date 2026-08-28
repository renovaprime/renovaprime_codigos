import { companyApiClient } from './companyApi';
import type { ApiResponse } from '../types/api';
import type { CompanyProfileUpdate, CompanyRecord } from '../types/company';

class CompanyAreaService {
  async getProfile(): Promise<CompanyRecord> {
    const response = await companyApiClient.get<ApiResponse<CompanyRecord>>('/company-area/profile');
    return response.data;
  }

  async updateProfile(data: CompanyProfileUpdate): Promise<CompanyRecord> {
    const response = await companyApiClient.put<ApiResponse<CompanyRecord>>('/company-area/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await companyApiClient.put('/company-area/profile/password', { currentPassword, newPassword });
  }
}

export const companyAreaService = new CompanyAreaService();
