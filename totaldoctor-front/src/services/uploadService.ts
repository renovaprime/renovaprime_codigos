import type { ApiResponse, DocumentType, UploadResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface SignedUrlResponse {
  signedUrl: string;
}

interface SignedUrlsResponse {
  photo_url?: string;
  council_doc_url?: string;
  specialization_doc_url?: string;
  acceptance_term_url?: string;
}

class UploadService {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  async uploadDoctorDocument(file: File, documentType: DocumentType): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const token = this.getAuthToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload/doctor-document`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const data = await response.json() as ApiResponse<UploadResponse>;
      return data.data.url;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please try again.');
    }
  }

  async getSignedUrl(url: string): Promise<string | null> {
    if (!url) return null;

    const token = this.getAuthToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload/signed-url?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get signed URL');
      }

      const data = await response.json() as ApiResponse<SignedUrlResponse>;
      return data.data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  }

  async getSignedUrlsForDoctor(urls: {
    photo_url?: string;
    council_doc_url?: string;
    specialization_doc_url?: string;
    acceptance_term_url?: string;
  }): Promise<SignedUrlsResponse> {
    const token = this.getAuthToken();
    
    const queryParams = new URLSearchParams();
    if (urls.photo_url) queryParams.append('photo_url', urls.photo_url);
    if (urls.council_doc_url) queryParams.append('council_doc_url', urls.council_doc_url);
    if (urls.specialization_doc_url) queryParams.append('specialization_doc_url', urls.specialization_doc_url);
    if (urls.acceptance_term_url) queryParams.append('acceptance_term_url', urls.acceptance_term_url);
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload/doctor-signed-urls?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get signed URLs');
      }

      const data = await response.json() as ApiResponse<SignedUrlsResponse>;
      return data.data;
    } catch (error) {
      console.error('Error getting signed URLs:', error);
      return {};
    }
  }
}

export const uploadService = new UploadService();
