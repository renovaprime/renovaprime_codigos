import { companyApiClient } from './companyApi';
import type { ApiResponse } from '../types/api';
import type { CompanyEntity, CompanyLoginResponse } from '../types/company';

const COMPANY_TOKEN_KEY = 'company_auth_token';
const COMPANY_ENTITY_KEY = 'company_auth_entity';

class CompanyAuthService {
  async login(email: string, password: string): Promise<CompanyLoginResponse> {
    const response = await companyApiClient.post<ApiResponse<CompanyLoginResponse>>(
      '/company-area/auth/login',
      { email, password }
    );

    const { token, name, email: loginEmail, entity } = response.data;
    const resolvedEntity: CompanyEntity = entity || { id: 0, name, email: loginEmail };

    this.setToken(token);
    this.setEntity(resolvedEntity);

    return { token, name, email: loginEmail, entity: resolvedEntity };
  }

  logout(): void {
    localStorage.removeItem(COMPANY_TOKEN_KEY);
    localStorage.removeItem(COMPANY_ENTITY_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(COMPANY_TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(COMPANY_TOKEN_KEY, token);
  }

  getEntity(): CompanyEntity | null {
    const json = localStorage.getItem(COMPANY_ENTITY_KEY);
    if (!json) return null;
    try {
      return JSON.parse(json) as CompanyEntity;
    } catch {
      return null;
    }
  }

  setEntity(entity: CompanyEntity): void {
    localStorage.setItem(COMPANY_ENTITY_KEY, JSON.stringify(entity));
  }
}

export const companyAuthService = new CompanyAuthService();
