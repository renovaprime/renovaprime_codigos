import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import type { Partner, PartnerFormData } from '../types/api';

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PartnerFormData) => Promise<void>;
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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    }
    setError('');
  }, [editingPartner, isOpen]);

  const handleChange = (field: keyof PartnerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      await onSave(dataToSend);
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
              disabled={isLoading}
            />
            <Input
              label="CNPJ"
              value={formData.cnpj || ''}
              onChange={(e) => handleChange('cnpj', e.target.value)}
              placeholder="00.000.000/0000-00"
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
              disabled={isLoading}
            />
            <Input
              label={editingPartner ? 'Nova Senha (opcional)' : 'Senha *'}
              type="password"
              value={formData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={editingPartner ? 'Deixe vazio para manter' : 'Mínimo 6 caracteres'}
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
                disabled={isLoading}
              />
              <Input
                label="Conta"
                value={formData.bank_account || ''}
                onChange={(e) => handleChange('bank_account', e.target.value)}
                placeholder="00000-0"
                disabled={isLoading}
              />
              <Input
                label="Dígito"
                value={formData.bank_digit || ''}
                onChange={(e) => handleChange('bank_digit', e.target.value)}
                placeholder="0"
                disabled={isLoading}
              />
            </div>
          </div>

          <Input
            label="Chave PIX"
            value={formData.pix_key || ''}
            onChange={(e) => handleChange('pix_key', e.target.value)}
            placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL do Logo"
              value={formData.logo_url || ''}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              placeholder="https://..."
              disabled={isLoading}
            />
            <Input
              label="Website"
              value={formData.website_url || ''}
              onChange={(e) => handleChange('website_url', e.target.value)}
              placeholder="https://www.parceiro.com"
              disabled={isLoading}
            />
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
