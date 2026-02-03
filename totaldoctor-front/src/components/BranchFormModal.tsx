import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import type { PartnerBranch, BranchFormData, Partner } from '../types/api';

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BranchFormData) => Promise<void>;
  editingBranch?: PartnerBranch | null;
  partners: Partner[];
}

export function BranchFormModal({ isOpen, onClose, onSave, editingBranch, partners }: BranchFormModalProps) {
  const [formData, setFormData] = useState<BranchFormData>({
    partner_id: 0,
    name: '',
    alias: '',
    address: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingBranch) {
      setFormData({
        partner_id: editingBranch.partner_id,
        name: editingBranch.name,
        alias: editingBranch.alias || '',
        address: editingBranch.address || '',
        email: editingBranch.email,
        password: '',
      });
    } else {
      setFormData({
        partner_id: partners.length > 0 ? partners[0].id : 0,
        name: '',
        alias: '',
        address: '',
        email: '',
        password: '',
      });
    }
    setError('');
  }, [editingBranch, isOpen, partners]);

  const handleChange = (field: keyof BranchFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.partner_id) {
      setError('Selecione um parceiro');
      return;
    }
    if (formData.name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }
    if (!editingBranch && (!formData.password || formData.password.length < 6)) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend: BranchFormData = {
        ...formData,
        partner_id: Number(formData.partner_id),
        name: formData.name.trim(),
        email: formData.email.trim(),
      };
      if (editingBranch && !dataToSend.password) {
        delete dataToSend.password;
      }
      await onSave(dataToSend);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao salvar filial');
      } else {
        setError('Erro ao salvar filial');
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

      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-lg mx-4 p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {editingBranch ? 'Editar Filial' : 'Nova Filial'}
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
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Parceiro *</label>
            <select
              value={formData.partner_id}
              onChange={(e) => handleChange('partner_id', parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground transition-all duration-200 ease-out hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={0}>Selecione um parceiro</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nome *"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nome da filial"
            disabled={isLoading}
          />

          <Input
            label="Apelido"
            value={formData.alias || ''}
            onChange={(e) => handleChange('alias', e.target.value)}
            placeholder="Apelido/nome fantasia"
            disabled={isLoading}
          />

          <Input
            label="Endereço"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Endereço completo"
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@filial.com"
              disabled={isLoading}
            />
            <Input
              label={editingBranch ? 'Nova Senha (opcional)' : 'Senha *'}
              type="password"
              value={formData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={editingBranch ? 'Deixe vazio para manter' : 'Mínimo 6 caracteres'}
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
              {editingBranch ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
