import { partnerApiClient } from './partnerApi';
import type { ApiResponse } from '../types/api';
import type { PartnerEntity, PartnerLoginResponse } from '../types/partner';

const PARTNER_TOKEN_KEY = 'partner_auth_token';
const PARTNER_ENTITY_KEY = 'partner_auth_entity';

class PartnerAuthService {
  async login(email: string, password: string): Promise<PartnerLoginResponse> {
    try {
      const response = await partnerApiClient.post<ApiResponse<PartnerLoginResponse>>(
        '/partner-area/auth/login',
        { email, password }
      );

      const { token, entity } = response.data;

      this.setToken(token);
      this.setEntity(entity);

      return { token, entity };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Credenciais inválidas') {
          throw new Error('Email ou senha incorretos');
        }
        if (error.message === 'Conta desativada') {
          throw new Error('Conta desativada. Entre em contato com o suporte.');
        }
        throw error;
      }
      throw new Error('Erro de conexão. Tente novamente.');
    }
  }

  logout(): void {
    localStorage.removeItem(PARTNER_TOKEN_KEY);
    localStorage.removeItem(PARTNER_ENTITY_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(PARTNER_TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(PARTNER_TOKEN_KEY, token);
  }

  getEntity(): PartnerEntity | null {
    const json = localStorage.getItem(PARTNER_ENTITY_KEY);
    if (!json) return null;
    try {
      return JSON.parse(json) as PartnerEntity;
    } catch {
      return null;
    }
  }

  setEntity(entity: PartnerEntity): void {
    localStorage.setItem(PARTNER_ENTITY_KEY, JSON.stringify(entity));
  }
}

export const partnerAuthService = new PartnerAuthService();
