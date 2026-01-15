import { apiClient } from './api';
import type { LoginRequest, LoginResponse, ApiResponse, User } from '../types/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const payload: LoginRequest = { email, password };
    
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        '/auth/login',
        payload
      );
      
      const { token, user } = response.data;
      
      // Store token and user in localStorage
      this.setToken(token);
      this.setUser(user);
      
      return { token, user };
    } catch (error) {
      if (error instanceof Error) {
        // Map specific error messages
        if (error.message === 'Invalid credentials') {
          throw new Error('Email ou senha incorretos');
        }
        if (error.message === 'User is blocked') {
          throw new Error('Conta bloqueada. Entre em contato com o suporte.');
        }
        throw error;
      }
      throw new Error('Erro de conexão. Tente novamente.');
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

