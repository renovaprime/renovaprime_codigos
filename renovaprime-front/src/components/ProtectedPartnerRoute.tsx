import { Navigate } from 'react-router-dom';
import { usePartnerAuth } from '../contexts/PartnerAuthContext';
import type { PartnerEntityType } from '../types/partner';

interface ProtectedPartnerRouteProps {
  children: React.ReactNode;
  allowedTypes?: PartnerEntityType[];
}

export const ProtectedPartnerRoute = ({ children, allowedTypes }: ProtectedPartnerRouteProps) => {
  const { entity, isAuthenticated, isLoading } = usePartnerAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/parceiro/login" replace />;
  }

  if (allowedTypes && entity && !allowedTypes.includes(entity.type)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem'
      }}>
        <h1>Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
        <a href="/parceiro/dashboard" style={{ color: '#007bff', textDecoration: 'underline' }}>
          Voltar para o Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
