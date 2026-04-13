import { apiClient } from './api';
import type { ApiResponse, CmsEntry } from '../types/api';

class CmsService {
  async listAll(): Promise<CmsEntry[]> {
    const response = await apiClient.get<ApiResponse<CmsEntry[]>>('/cms');
    return response.data;
  }

  async getByKey(key: string): Promise<CmsEntry> {
    const response = await apiClient.get<ApiResponse<CmsEntry>>(`/cms/${encodeURIComponent(key)}`);
    return response.data;
  }

  async getPublic(key: string): Promise<CmsEntry> {
    const response = await apiClient.get<ApiResponse<CmsEntry>>(`/cms/public/${encodeURIComponent(key)}`);
    return response.data;
  }

  async create(key: string, title: string, content: string): Promise<CmsEntry> {
    const response = await apiClient.post<ApiResponse<CmsEntry>>('/cms', { key, title, content });
    return response.data;
  }

  async update(key: string, title: string, content: string): Promise<CmsEntry> {
    const response = await apiClient.put<ApiResponse<CmsEntry>>(`/cms/${encodeURIComponent(key)}`, { title, content });
    return response.data;
  }

  async upsert(key: string, title: string, content: string): Promise<CmsEntry> {
    const response = await apiClient.put<ApiResponse<CmsEntry>>(`/cms/${encodeURIComponent(key)}/upsert`, { title, content });
    return response.data;
  }

  async delete(key: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/cms/${encodeURIComponent(key)}`);
  }
}

export const cmsService = new CmsService();
