import { useState, useEffect } from 'react';
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
    <Card>
      <CardHeader>
        <CardTitle>Dados Básicos</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Seu nome completo"
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
            required
          />

          <Input
            label="Telefone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!hasChanges}
            >
              Salvar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={!hasChanges || isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
