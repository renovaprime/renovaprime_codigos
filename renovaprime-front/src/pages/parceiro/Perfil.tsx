import { useState, useEffect } from 'react';
import { User, Mail, Building2, Phone, CreditCard, Key, Globe, MapPin, AlertCircle, Check, Lock, Eye, EyeOff } from 'lucide-react';
import { LayoutParceiro } from '../../layout/LayoutParceiro';
import { Card, Button, Input } from '../../components';
import { partnerAreaService } from '../../services/partnerAreaService';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import type { PartnerProfile } from '../../types/partner';

export function ParceiroPerfil() {
  const { entity } = usePartnerAuth();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Password form state
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
      const data = await partnerAreaService.getProfile();
      setProfile(data);
      initFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const initFormData = (data: PartnerProfile) => {
    switch (data.type) {
      case 'partner':
        setFormData({
          name: data.name || '',
          cnpj: data.cnpj || '',
          bank_agency: data.bank_agency || '',
          bank_account: data.bank_account || '',
          bank_digit: data.bank_digit || '',
          pix_key: data.pix_key || '',
          website_url: data.website_url || '',
        });
        break;
      case 'branch':
        setFormData({
          name: data.name || '',
          alias: data.alias || '',
          address: data.address || '',
        });
        break;
      case 'reseller':
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          pix_key: data.pix_key || '',
        });
        break;
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const updated = await partnerAreaService.updateProfile(formData);
      setProfile(updated);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar perfil');
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

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);

    try {
      await partnerAreaService.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getTypeLabel = () => {
    switch (entity?.type) {
      case 'partner': return 'Parceiro';
      case 'branch': return 'Filial';
      case 'reseller': return 'Revendedor';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <LayoutParceiro title="Meu Perfil">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </LayoutParceiro>
    );
  }

  if (error || !profile) {
    return (
      <LayoutParceiro title="Meu Perfil">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-600">{error || 'Perfil não encontrado'}</p>
        </div>
      </LayoutParceiro>
    );
  }

  return (
    <LayoutParceiro title="Meu Perfil">
      <div className="max-w-2xl space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">Meu Perfil</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">{getTypeLabel()} — Informações da conta.</p>
          </div>
        </div>

        {/* Profile Data Form */}
        <Card>
          <form onSubmit={handleSaveProfile} className="space-y-4 p-1">
            <h2 className="font-display text-lg text-foreground mb-4">Dados do Perfil</h2>

            {/* Read-only email */}
            <div className="flex items-start gap-3 py-2 border-b border-border">
              <Mail className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium text-foreground">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
              <div className="flex-1">
                <Input
                  label="Nome"
                  value={formData.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
              </div>
            </div>

            {profile.type === 'partner' && (
              <>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      label="CNPJ"
                      value={formData.cnpj || ''}
                      onChange={(e) => handleFieldChange('cnpj', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <Input
                      label="Agência"
                      value={formData.bank_agency || ''}
                      onChange={(e) => handleFieldChange('bank_agency', e.target.value)}
                    />
                    <Input
                      label="Conta"
                      value={formData.bank_account || ''}
                      onChange={(e) => handleFieldChange('bank_account', e.target.value)}
                    />
                    <Input
                      label="Dígito"
                      value={formData.bank_digit || ''}
                      onChange={(e) => handleFieldChange('bank_digit', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      label="Chave PIX"
                      value={formData.pix_key || ''}
                      onChange={(e) => handleFieldChange('pix_key', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      label="Website"
                      value={formData.website_url || ''}
                      onChange={(e) => handleFieldChange('website_url', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {profile.type === 'branch' && (
              <>
                {/* Read-only partner info */}
                <div className="flex items-start gap-3 py-2 border-b border-border">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Parceiro</p>
                    <p className="text-sm font-medium text-foreground">{profile.Partner?.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      label="Apelido"
                      value={formData.alias || ''}
                      onChange={(e) => handleFieldChange('alias', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      label="Endereço"
                      value={formData.address || ''}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {profile.type === 'reseller' && (
              <>
                {/* Read-only branch/partner info */}
                <div className="flex items-start gap-3 py-2 border-b border-border">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Filial</p>
                    <p className="text-sm font-medium text-foreground">{profile.PartnerBranch?.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2 border-b border-border">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Parceiro</p>
                    <p className="text-sm font-medium text-foreground">{profile.PartnerBranch?.Partner?.name}</p>
                  </div>
                </div>
                {/* Read-only CPF */}
                <div className="flex items-start gap-3 py-2 border-b border-border">
                  <CreditCard className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">CPF</p>
                    <p className="text-sm font-medium text-foreground">{profile.cpf}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      label="Telefone"
                      value={formData.phone || ''}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      label="Chave PIX"
                      value={formData.pix_key || ''}
                      onChange={(e) => handleFieldChange('pix_key', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {saveError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{saveError}</p>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800">Perfil atualizado com sucesso</p>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" isLoading={isSaving} disabled={isSaving}>
                Salvar alterações
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card>
          <form onSubmit={handleChangePassword} className="space-y-4 p-1">
            <h2 className="font-display text-lg text-foreground mb-4">Alterar Senha</h2>

            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
              <div className="flex-1 relative">
                <Input
                  label="Senha atual"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError(null);
                    setPasswordSuccess(false);
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
              <div className="flex-1 relative">
                <Input
                  label="Nova senha"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError(null);
                    setPasswordSuccess(false);
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground mt-2.5 flex-shrink-0" />
              <div className="flex-1">
                <Input
                  label="Confirmar nova senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError(null);
                    setPasswordSuccess(false);
                  }}
                  required
                />
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800">Senha alterada com sucesso</p>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" isLoading={isChangingPassword} disabled={isChangingPassword}>
                Alterar senha
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </LayoutParceiro>
  );
}
