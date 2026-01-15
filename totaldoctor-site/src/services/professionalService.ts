const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface Specialty {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
}

export type Profession = 'MEDICO' | 'PSICOLOGO' | 'NUTRICIONISTA';
export type RegistryType = 'CRM' | 'CRP' | 'CFN';
export type DocumentType = 'photo' | 'council-doc' | 'specialization-doc' | 'acceptance-term';

export interface ProfessionalFormData {
  name: string;
  email: string;
  phone: string;
  profession: Profession;
  registry_type: RegistryType;
  registry_number: string;
  registry_uf: string;
  rqe?: string;
  specialty_ids: number[];
  photo_url: string;
  council_doc_url: string;
  specialization_doc_url: string;
  acceptance_term_url: string;
}

interface ApiResponse<T> {
  data: T;
}

interface UploadResponse {
  url: string;
}

class ProfessionalService {
  async createProfessional(data: ProfessionalFormData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/site/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar cadastro');
      }

      await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de rede. Por favor, tente novamente.');
    }
  }

  async uploadDocument(file: File, documentType: DocumentType): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    try {
      const response = await fetch(`${API_BASE_URL}/site/upload/doctor-document`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao fazer upload do arquivo');
      }

      const data = await response.json() as ApiResponse<UploadResponse>;
      return data.data.url;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de rede. Por favor, tente novamente.');
    }
  }

  async listActiveSpecialties(): Promise<Specialty[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/site/specialties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar especialidades');
      }

      const data = await response.json() as ApiResponse<Specialty[]>;
      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de rede. Por favor, tente novamente.');
    }
  }
}

export const professionalService = new ProfessionalService();
