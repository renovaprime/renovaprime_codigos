import { Navigate } from 'react-router-dom';
import { useCompanyAuth } from '../contexts/CompanyAuthContext';

interface ProtectedCompanyRouteProps {
  children: React.ReactNode;
}

export const ProtectedCompanyRoute = ({ children }: ProtectedCompanyRouteProps) => {
  const { isAuthenticated, isLoading } = useCompanyAuth();

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
    return <Navigate to="/empresa/login" replace />;
  }

  return <>{children}</>;
};
