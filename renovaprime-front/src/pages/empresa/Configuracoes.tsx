import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { LayoutEmpresa } from '../../layout/LayoutEmpresa';
import { Card, Button, Input, PageHeader } from '../../components';
import { companyAreaService } from '../../services/companyAreaService';
import type { CompanyRecord } from '../../types/company';

export function EmpresaConfiguracoes() {
  const [profile, setProfile] = useState<CompanyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleEmail, setResponsibleEmail] = useState('');
  const [responsiblePhone, setResponsiblePhone] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await companyAreaService.getProfile();
      setProfile(data);
      setResponsibleName(data.responsible_name || '');
      setResponsibleEmail(data.responsible_email || '');
      setResponsiblePhone(data.responsible_phone || '');
      setPhone(data.phone || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updated = await companyAreaService.updateProfile({
        responsible_name: responsibleName,
        responsible_email: responsibleEmail,
        responsible_phone: responsiblePhone || undefined,
        phone,
      });
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    setIsChangingPassword(true);
    try {
      await companyAreaService.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <LayoutEmpresa title="Configurações">
        <p className="text-muted-foreground">Carregando...</p>
      </LayoutEmpresa>
    );
  }

  if (error || !profile) {
    return (
      <LayoutEmpresa title="Configurações">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800">{error || 'Perfil não encontrado'}</p>
        </div>
      </LayoutEmpresa>
    );
  }

  return (
    <LayoutEmpresa title="Configurações">
      <div className="space-y-6">
        <PageHeader
          title="Configurações"
          subtitle="Atualize os dados do responsável e a senha de acesso."
        />

        <Card padding="lg">
          <h2 className="text-lg font-semibold mb-4">Dados editáveis</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {saveSuccess && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-green-800 text-sm">
                <Check className="w-4 h-4" />
                Dados salvos com sucesso
              </div>
            )}
            {saveError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{saveError}</div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Nome do responsável</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-10" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">E-mail de login</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" className="pl-10" value={responsibleEmail} onChange={(e) => setResponsibleEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Telefone do responsável</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-10" value={responsiblePhone} onChange={(e) => setResponsiblePhone(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Telefone da empresa</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>

            <Button type="submit" isLoading={isSaving} disabled={isSaving}>
              Salvar alterações
            </Button>
          </form>
        </Card>

        <Card padding="lg">
          <h2 className="text-lg font-semibold mb-4">Somente leitura</h2>
          <dl className="grid gap-3 text-sm">
            <div><dt className="text-muted-foreground">Razão social</dt><dd className="font-medium">{profile.legal_name}</dd></div>
            <div><dt className="text-muted-foreground">Nome fantasia</dt><dd className="font-medium">{profile.trade_name}</dd></div>
            <div><dt className="text-muted-foreground">CNPJ</dt><dd className="font-medium">{profile.cnpj}</dd></div>
            <div><dt className="text-muted-foreground">E-mail corporativo</dt><dd className="font-medium">{profile.email}</dd></div>
          </dl>
        </Card>

        <Card padding="lg">
          <h2 className="text-lg font-semibold mb-4">Alterar senha</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-green-800 text-sm">
                <Check className="w-4 h-4" />
                Senha alterada com sucesso
              </div>
            )}
            {passwordError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{passwordError}</div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                className="pl-10 pr-10"
                placeholder="Senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showNewPassword ? 'text' : 'password'}
                className="pl-10 pr-10"
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />

            <Button type="submit" variant="outline" isLoading={isChangingPassword} disabled={isChangingPassword}>
              Alterar senha
            </Button>
          </form>
        </Card>
      </div>
    </LayoutEmpresa>
  );
}
