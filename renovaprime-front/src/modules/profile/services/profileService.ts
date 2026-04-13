import { apiClient } from '../../../services/api';
import type {
  ProfileUser,
  UpdateProfileData,
  UpdatePasswordData,
  ProfileResponse,
  PasswordUpdateResponse
} from '../types/profile.types';

class ProfileService {
  async getMe(): Promise<ProfileUser> {
    const response = await apiClient.get<ProfileResponse>('/me');
    return response.data;
  }

  async updateMe(data: UpdateProfileData): Promise<ProfileUser> {
    const response = await apiClient.put<ProfileResponse>('/me', data);
    return response.data;
  }

  async updatePassword(data: UpdatePasswordData): Promise<string> {
    const response = await apiClient.put<PasswordUpdateResponse>('/me/password', data);
    return response.data.message;
  }
}

export const profileService = new ProfileService();
