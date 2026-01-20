import { useState, useEffect, ReactNode } from 'react';
import { profileService } from '../services/profileService';
import { ProfileBasicForm } from '../components/ProfileBasicForm';
import { ProfilePasswordForm } from '../components/ProfilePasswordForm';
import type { ProfileUser } from '../types/profile.types';

interface ProfilePageProps {
  Layout: React.ComponentType<{ children: ReactNode; title?: string }>;
}

export function ProfilePage({ Layout }: ProfilePageProps) {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await profileService.getMe();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser: ProfileUser) => {
    setUser(updatedUser);
  };

  const handleError = (message: string) => {
    setError(message);
    setSuccessMessage(null);
    // Limpar após 5 segundos
    setTimeout(() => setError(null), 5000);
  };

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setError(null);
    // Limpar após 3 segundos
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <Layout title="Meu Perfil">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Meu Perfil">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Mensagens de feedback */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            {successMessage}
          </div>
        )}

        {/* Card de Dados Básicos */}
        <ProfileBasicForm
          user={user}
          onUpdate={handleUserUpdate}
          onError={handleError}
          onSuccess={handleSuccess}
        />

        {/* Card de Alterar Senha */}
        <ProfilePasswordForm
          onError={handleError}
          onSuccess={handleSuccess}
        />
      </div>
    </Layout>
  );
}
