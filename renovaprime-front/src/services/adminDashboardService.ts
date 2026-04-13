import { apiClient } from './api';
import type { ApiResponse, AdminDashboard } from '../types/api';

class AdminDashboardService {
  async getDashboard(): Promise<AdminDashboard> {
    const response = await apiClient.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
    return response.data;
  }
}

export const adminDashboardService = new AdminDashboardService();
