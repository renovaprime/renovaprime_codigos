import { useState, useEffect } from 'react';
import { UserRound } from 'lucide-react';
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '../../../components';
import { profileService } from '../services/profileService';
import type { ProfileUser, UpdateProfileData } from '../types/profile.types';

interface ProfileBasicFormProps {
  user: ProfileUser | null;
  onUpdate: (user: ProfileUser) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function ProfileBasicForm({ user, onUpdate, onError, onSuccess }: ProfileBasicFormProps) {
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: '',
    email: '',
    phone: ''
  });
  const [originalData, setOriginalData] = useState<UpdateProfileData>({
    name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      const data = {
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpar erro do campo quando usuário digita
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const updatedUser = await profileService.updateMe(formData);
      onUpdate(updatedUser);
      setOriginalData(formData);
      onSuccess('Dados atualizados com sucesso!');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erro ao atualizar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setErrors({});
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  return (
    <Card className="border-border/70">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-1 text-primary">
            <UserRound className="h-4 w-4" />
          </div>
          <CardTitle>Dados Basicos</CardTitle>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Mantenha suas informacoes atualizadas para contato e atendimento.
        </p>
      </CardHeader>
      <CardContent className="pt-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Seu nome completo"
            data-cy="profile-form-name"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="seu@email.com"
            data-cy="profile-form-email"
            required
          />

          <div className="flex gap-3 border-t border-border/60 pt-4">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!hasChanges}
              data-cy="profile-form-submit"
            >
              Salvar alteracoes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={!hasChanges || isLoading}
              data-cy="profile-form-cancel"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
