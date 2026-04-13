import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { planCommissionService } from '../services/planCommissionService';
import type { Partner, PartnerFormData, PlanType, PlanCommissionInput } from '../types/api';

const PLAN_LABELS: Record<PlanType, string> = {
  CLINICO: 'Individual',
  PREMIUM: 'Individual Premium',
  FAMILIAR: 'Familiar Master',
};

const PLAN_TYPES: PlanType[] = ['CLINICO', 'PREMIUM', 'FAMILIAR'];

type CommissionsState = Record<PlanType, { partner_pct: string; branch_pct: string; reseller_pct: string }>;

const FIELD_MAX_LENGTH = {
  name: 120,
  cnpj: 18,
  email: 120,
  password: 72,
  bankAgency: 10,
  bankAccount: 10,
  bankDigit: 4,
  pixKey: 120,
  logoUrl: 255,
  websiteUrl: 255,
  commission: 6,
} as const;

const emptyCommissions = (): CommissionsState => ({
  CLINICO: { partner_pct: '0', branch_pct: '0', reseller_pct: '0' },
  PREMIUM: { partner_pct: '0', branch_pct: '0', reseller_pct: '0' },
  FAMILIAR: { partner_pct: '0', branch_pct: '0', reseller_pct: '0' },
});

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PartnerFormData) => Promise<number>;
  editingPartner?: Partner | null;
}

export function PartnerFormModal({ isOpen, onClose, onSave, editingPartner }: PartnerFormModalProps) {
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    cnpj: '',
    email: '',
    password: '',
    bank_agency: '',
    bank_account: '',
    bank_digit: '',
    pix_key: '',
    logo_url: '',
    website_url: '',
  });
  const [commissions, setCommissions] = useState<CommissionsState>(emptyCommissions());
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCommissions, setLoadingCommissions] = useState(false);

  useEffect(() => {
    if (editingPartner) {
      setFormData({
        name: editingPartner.name,
        cnpj: editingPartner.cnpj || '',
        email: editingPartner.email,
        password: '',
        bank_agency: editingPartner.bank_agency || '',
        bank_account: editingPartner.bank_account || '',
        bank_digit: editingPartner.bank_digit || '',
        pix_key: editingPartner.pix_key || '',
        logo_url: editingPartner.logo_url || '',
        website_url: editingPartner.website_url || '',
      });
      loadCommissions(editingPartner.id);
    } else {
      setFormData({
        name: '',
        cnpj: '',
        email: '',
        password: '',
        bank_agency: '',
        bank_account: '',
        bank_digit: '',
        pix_key: '',
        logo_url: '',
        website_url: '',
      });
      setCommissions(emptyCommissions());
    }
    setError('');
  }, [editingPartner, isOpen]);

  const loadCommissions = async (partnerId: number) => {
    setLoadingCommissions(true);
    try {
      const data = await planCommissionService.listByPartner(partnerId);
      const state = emptyCommissions();
      for (const c of data) {
        const pt = c.plan_type as PlanType;
        if (state[pt]) {
          state[pt] = {
            partner_pct: String(Number(c.partner_pct)),
            branch_pct: String(Number(c.branch_pct)),
            reseller_pct: String(Number(c.reseller_pct)),
          };
        }
      }
      setCommissions(state);
    } catch {
      setCommissions(emptyCommissions());
    } finally {
      setLoadingCommissions(false);
    }
  };

  const handleChange = (field: keyof PartnerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCommissionChange = (
    planType: PlanType,
    field: 'partner_pct' | 'branch_pct' | 'reseller_pct',
    value: string
  ) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    setCommissions((prev) => ({
      ...prev,
      [planType]: { ...prev[planType], [field]: cleaned },
    }));
  };

  const validateCommissions = (): string | null => {
    for (const pt of PLAN_TYPES) {
      const c = commissions[pt];
      const partner = parseFloat(c.partner_pct) || 0;
      const branch = parseFloat(c.branch_pct) || 0;
      const reseller = parseFloat(c.reseller_pct) || 0;

      if (partner < 0 || partner > 100 || branch < 0 || branch > 100 || reseller < 0 || reseller > 100) {
        return `${PLAN_LABELS[pt]}: percentuais devem estar entre 0 e 100`;
      }
      if (partner + branch + reseller > 100) {
        return `${PLAN_LABELS[pt]}: soma dos percentuais não pode ultrapassar 100%`;
      }
    }
    return null;
  };

  const buildCommissionPayload = (): PlanCommissionInput[] => {
    return PLAN_TYPES.map((pt) => ({
      plan_type: pt,
      partner_pct: parseFloat(commissions[pt].partner_pct) || 0,
      branch_pct: parseFloat(commissions[pt].branch_pct) || 0,
      reseller_pct: parseFloat(commissions[pt].reseller_pct) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }
    if (!editingPartner && (!formData.password || formData.password.length < 6)) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    const commissionError = validateCommissions();
    if (commissionError) {
      setError(commissionError);
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend: PartnerFormData = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
      };
      if (editingPartner && !dataToSend.password) {
        delete dataToSend.password;
      }
      const partnerId = await onSave(dataToSend);
      await planCommissionService.upsert(partnerId, buildCommissionPayload());

      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao salvar parceiro');
      } else {
        setError('Erro ao salvar parceiro');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-2xl mx-4 p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nome do parceiro"
              maxLength={FIELD_MAX_LENGTH.name}
              disabled={isLoading}
            />
            <Input
              label="CNPJ"
              value={formData.cnpj || ''}
              onChange={(e) => handleChange('cnpj', e.target.value)}
              placeholder="00.000.000/0000-00"
              maxLength={FIELD_MAX_LENGTH.cnpj}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@parceiro.com"
              maxLength={FIELD_MAX_LENGTH.email}
              disabled={isLoading}
            />
            <Input
              label={editingPartner ? 'Nova Senha (opcional)' : 'Senha *'}
              type="password"
              value={formData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={editingPartner ? 'Deixe vazio para manter' : 'Mínimo 6 caracteres'}
              maxLength={FIELD_MAX_LENGTH.password}
              disabled={isLoading}
            />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Dados Bancários</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Agência"
                value={formData.bank_agency || ''}
                onChange={(e) => handleChange('bank_agency', e.target.value)}
                placeholder="0000"
                maxLength={FIELD_MAX_LENGTH.bankAgency}
                disabled={isLoading}
              />
              <Input
                label="Conta"
                value={formData.bank_account || ''}
                onChange={(e) => handleChange('bank_account', e.target.value)}
                placeholder="00000-0"
                maxLength={FIELD_MAX_LENGTH.bankAccount}
                disabled={isLoading}
              />
              <Input
                label="Dígito"
                value={formData.bank_digit || ''}
                onChange={(e) => handleChange('bank_digit', e.target.value)}
                placeholder="0"
                maxLength={FIELD_MAX_LENGTH.bankDigit}
                disabled={isLoading}
              />
            </div>
          </div>

          <Input
            label="Chave PIX"
            value={formData.pix_key || ''}
            onChange={(e) => handleChange('pix_key', e.target.value)}
            placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
            maxLength={FIELD_MAX_LENGTH.pixKey}
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL do Logo"
              value={formData.logo_url || ''}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              placeholder="https://..."
              maxLength={FIELD_MAX_LENGTH.logoUrl}
              disabled={isLoading}
            />
            <Input
              label="Website"
              value={formData.website_url || ''}
              onChange={(e) => handleChange('website_url', e.target.value)}
              placeholder="https://www.parceiro.com"
              maxLength={FIELD_MAX_LENGTH.websiteUrl}
              disabled={isLoading}
            />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Comissão por Plano (%)
            </p>
            {loadingCommissions ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3 text-xs font-medium text-muted-foreground">
                  <div>Plano</div>
                  <div>% Parceiro</div>
                  <div>% Filial</div>
                  <div>% Revendedor</div>
                </div>
                {PLAN_TYPES.map((pt) => (
                  <div key={pt} className="grid grid-cols-4 gap-3 items-center">
                    <span className="text-sm font-medium text-foreground">{PLAN_LABELS[pt]}</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={commissions[pt].partner_pct}
                      onChange={(e) => handleCommissionChange(pt, 'partner_pct', e.target.value)}
                      disabled={isLoading}
                      placeholder="0"
                      maxLength={FIELD_MAX_LENGTH.commission}
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={commissions[pt].branch_pct}
                      onChange={(e) => handleCommissionChange(pt, 'branch_pct', e.target.value)}
                      disabled={isLoading}
                      placeholder="0"
                      maxLength={FIELD_MAX_LENGTH.commission}
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={commissions[pt].reseller_pct}
                      onChange={(e) => handleCommissionChange(pt, 'reseller_pct', e.target.value)}
                      disabled={isLoading}
                      placeholder="0"
                      maxLength={FIELD_MAX_LENGTH.commission}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              className="flex-1"
            >
              {editingPartner ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
