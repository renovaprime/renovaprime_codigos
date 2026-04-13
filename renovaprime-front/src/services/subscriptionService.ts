import { apiClient } from './api';
import type { ApiResponse, SubscriptionData } from '../types/api';

class SubscriptionService {
  async getMySubscription(): Promise<SubscriptionData> {
    const response = await apiClient.get<ApiResponse<SubscriptionData>>('/patient/subscription');
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService();
