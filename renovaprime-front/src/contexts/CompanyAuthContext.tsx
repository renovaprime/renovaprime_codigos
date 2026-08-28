import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { companyAuthService } from '../services/companyAuthService';
import type { CompanyEntity } from '../types/company';

interface CompanyAuthContextType {
  entity: CompanyEntity | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const CompanyAuthContext = createContext<CompanyAuthContextType | undefined>(undefined);

interface CompanyAuthProviderProps {
  children: ReactNode;
}

export const CompanyAuthProvider = ({ children }: CompanyAuthProviderProps) => {
  const [entity, setEntity] = useState<CompanyEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedEntity = companyAuthService.getEntity();
    const token = companyAuthService.getToken();

    if (savedEntity && token) {
      setEntity(savedEntity);
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { entity: loggedEntity } = await companyAuthService.login(email, password);
    setEntity(loggedEntity);
  };

  const logout = () => {
    companyAuthService.logout();
    setEntity(null);
  };

  const value: CompanyAuthContextType = {
    entity,
    isAuthenticated: !!entity,
    login,
    logout,
    isLoading,
  };

  return <CompanyAuthContext.Provider value={value}>{children}</CompanyAuthContext.Provider>;
};

export const useCompanyAuth = () => {
  const context = useContext(CompanyAuthContext);

  if (context === undefined) {
    throw new Error('useCompanyAuth must be used within a CompanyAuthProvider');
  }

  return context;
};
