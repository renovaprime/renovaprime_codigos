import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { partnerAuthService } from '../services/partnerAuthService';
import type { PartnerEntity } from '../types/partner';

interface PartnerAuthContextType {
  entity: PartnerEntity | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const PartnerAuthContext = createContext<PartnerAuthContextType | undefined>(undefined);

interface PartnerAuthProviderProps {
  children: ReactNode;
}

export const PartnerAuthProvider = ({ children }: PartnerAuthProviderProps) => {
  const [entity, setEntity] = useState<PartnerEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedEntity = partnerAuthService.getEntity();
    const token = partnerAuthService.getToken();

    if (savedEntity && token) {
      setEntity(savedEntity);
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { entity: loggedEntity } = await partnerAuthService.login(email, password);
    setEntity(loggedEntity);
  };

  const logout = () => {
    partnerAuthService.logout();
    setEntity(null);
  };

  const value: PartnerAuthContextType = {
    entity,
    isAuthenticated: !!entity,
    login,
    logout,
    isLoading,
  };

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>;
};

export const usePartnerAuth = () => {
  const context = useContext(PartnerAuthContext);

  if (context === undefined) {
    throw new Error('usePartnerAuth must be used within a PartnerAuthProvider');
  }

  return context;
};
