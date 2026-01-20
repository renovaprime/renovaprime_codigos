import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '../../../components';
import { profileService } from '../services/profileService';
import type { UpdatePasswordData } from '../types/profile.types';

interface ProfilePasswordFormProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function ProfilePasswordForm({ onError, onSuccess }: ProfilePasswordFormProps) {
  const [formData, setFormData] = useState<UpdatePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
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

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await profileService.updatePassword(formData);
      onSuccess('Senha alterada com sucesso!');
      // Limpar campos após sucesso
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordToggleButton = ({ field, show }: { field: 'current' | 'new' | 'confirm'; show: boolean }) => (
    <button
      type="button"
      onClick={() => togglePasswordVisibility(field)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      tabIndex={-1}
    >
      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar Senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="Senha Atual"
              name="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              placeholder="Digite sua senha atual"
              required
            />
            <div className="absolute right-3 top-[38px]">
              <PasswordToggleButton field="current" show={showPasswords.current} />
            </div>
          </div>

          <div className="relative">
            <Input
              label="Nova Senha"
              name="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              placeholder="Digite a nova senha"
              hint="Mínimo de 6 caracteres"
              required
            />
            <div className="absolute right-3 top-[38px]">
              <PasswordToggleButton field="new" show={showPasswords.new} />
            </div>
          </div>

          <div className="relative">
            <Input
              label="Confirmar Nova Senha"
              name="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirme a nova senha"
              required
            />
            <div className="absolute right-3 top-[38px]">
              <PasswordToggleButton field="confirm" show={showPasswords.confirm} />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Alterar Senha
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
