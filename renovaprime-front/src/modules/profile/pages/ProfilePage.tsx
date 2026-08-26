import { useState, useEffect, ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../components/Card';
import { PageHeader } from '../../../components';
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
        <div className="w-full mx-auto space-y-6">
          <Card className="p-10">
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Meu Perfil">
      <div className="w-full mx-auto space-y-6">
        <PageHeader
          title="Meu Perfil"
          subtitle="Atualize seus dados pessoais e mantenha sua conta segura."
        />

        {error && (
          <Card className="border-red-200 bg-red-50/70 px-4 py-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </Card>
        )}
        {successMessage && (
          <Card className="border-emerald-200 bg-emerald-50/70 px-4 py-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm">{successMessage}</p>
            </div>
          </Card>
        )}

        <ProfileBasicForm
          user={user}
          onUpdate={handleUserUpdate}
          onError={handleError}
          onSuccess={handleSuccess}
        />

        <ProfilePasswordForm
          onError={handleError}
          onSuccess={handleSuccess}
        />
      </div>
    </Layout>
  );
}
