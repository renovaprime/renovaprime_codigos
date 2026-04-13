import type { ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle responses with no content (204, etc)
      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type');
      let data: unknown;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        
        // Se não for JSON, não tente fazer parse
        if (text && text.trim().startsWith('{')) {
          try {
            data = JSON.parse(text);
          } catch {
            data = { message: 'Invalid response from server' };
          }
        } else if (text && text.trim().startsWith('<!DOCTYPE')) {
          // HTML recebido - provavelmente erro de autenticação ou rota não encontrada
          console.error('Received HTML instead of JSON:', text.substring(0, 200));
          throw new Error(
            response.status === 401 
              ? 'Não autenticado. Faça login novamente.' 
              : response.status === 404
              ? 'Endpoint não encontrado'
              : 'Erro no servidor. Tente novamente.'
          );
        } else {
          data = text ? { message: text } : undefined;
        }
      }

      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please try again.');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

