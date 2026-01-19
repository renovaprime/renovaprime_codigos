const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface CreditCard {
  number: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface Dependent {
  name: string;
  cpf: string;
  birthDate: string;
}

export interface CheckoutData {
  planId: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  cep: string;
  address: string;
  addressNumber?: string;
  neighborhood?: string;
  city: string;
  state: string;
  creditCard: CreditCard;
  dependents?: Dependent[];
}

export interface CheckoutResponse {
  success: boolean;
  subscriptionId?: string;
  subscriptionStatus?: string;
  message?: string;
}

interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  message: string;
  code: string;
}

class CheckoutService {
  async processCheckout(data: CheckoutData): Promise<CheckoutResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/site/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json() as ApiError;
        throw new Error(errorData.message || 'Erro ao processar pagamento');
      }

      const result = await response.json() as ApiResponse<CheckoutResponse>;
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de rede. Por favor, tente novamente.');
    }
  }

  async fetchAddressByCep(cep: string): Promise<{
    address: string;
    neighborhood: string;
    city: string;
    state: string;
  } | null> {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) return null;

      const data = await response.json();
      if (data.erro) return null;

      return {
        address: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      };
    } catch {
      return null;
    }
  }
}

export const checkoutService = new CheckoutService();
