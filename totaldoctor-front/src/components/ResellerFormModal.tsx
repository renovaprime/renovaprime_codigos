import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import type { Reseller, ResellerFormData, PartnerBranch } from '../types/api';

interface ResellerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ResellerFormData) => Promise<void>;
  editingReseller?: Reseller | null;
  branches: PartnerBranch[];
}

export function ResellerFormModal({ isOpen, onClose, onSave, editingReseller, branches }: ResellerFormModalProps) {
  const [formData, setFormData] = useState<ResellerFormData>({
    branch_id: 0,
    name: '',
    cpf: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    pix_key: '',
    functional_unit: '',
    registration_code: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingReseller) {
      setFormData({
        branch_id: editingReseller.branch_id,
        name: editingReseller.name,
        cpf: editingReseller.cpf,
        email: editingReseller.email || '',
        phone: editingReseller.phone || '',
        password: '',
        role: editingReseller.role || '',
        pix_key: editingReseller.pix_key || '',
        functional_unit: editingReseller.functional_unit || '',
        registration_code: editingReseller.registration_code || '',
      });
    } else {
      setFormData({
        branch_id: branches.length > 0 ? branches[0].id : 0,
        name: '',
        cpf: '',
        email: '',
        phone: '',
        password: '',
        role: '',
        pix_key: '',
        functional_unit: '',
        registration_code: '',
      });
    }
    setError('');
  }, [editingReseller, isOpen, branches]);

  const handleChange = (field: keyof ResellerFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.branch_id) {
      setError('Selecione uma filial');
      return;
    }
    if (formData.name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return;
    }
    if (!formData.cpf || formData.cpf.trim().length < 11) {
      setError('CPF inválido');
      return;
    }
    if (!editingReseller && (!formData.password || formData.password.length < 6)) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend: ResellerFormData = {
        ...formData,
        branch_id: Number(formData.branch_id),
        name: formData.name.trim(),
        cpf: formData.cpf.trim(),
      };
      if (editingReseller && !dataToSend.password) {
        delete dataToSend.password;
      }
      await onSave(dataToSend);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao salvar revendedor');
      } else {
        setError('Erro ao salvar revendedor');
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
            {editingReseller ? 'Editar Revendedor' : 'Novo Revendedor'}
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
            <label className="block text-sm font-medium text-foreground">Filial *</label>
            <select
              value={formData.branch_id}
              onChange={(e) => handleChange('branch_id', parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground transition-all duration-200 ease-out hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={0}>Selecione uma filial</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} {branch.Partner ? `(${branch.Partner.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nome completo"
              disabled={isLoading}
            />
            <Input
              label="CPF *"
              value={formData.cpf}
              onChange={(e) => handleChange('cpf', e.target.value)}
              placeholder="000.000.000-00"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@revendedor.com"
              disabled={isLoading}
            />
            <Input
              label="Telefone"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(00) 00000-0000"
              disabled={isLoading}
            />
          </div>

          <Input
            label={editingReseller ? 'Nova Senha (opcional)' : 'Senha *'}
            type="password"
            value={formData.password || ''}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder={editingReseller ? 'Deixe vazio para manter' : 'Mínimo 6 caracteres'}
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Cargo/Função"
              value={formData.role || ''}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="Ex: Vendedor, Gerente"
              disabled={isLoading}
            />
            <Input
              label="Chave PIX"
              value={formData.pix_key || ''}
              onChange={(e) => handleChange('pix_key', e.target.value)}
              placeholder="Chave PIX"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Unidade Funcional"
              value={formData.functional_unit || ''}
              onChange={(e) => handleChange('functional_unit', e.target.value)}
              placeholder="Unidade funcional"
              disabled={isLoading}
            />
            <Input
              label="Código de Registro"
              value={formData.registration_code || ''}
              onChange={(e) => handleChange('registration_code', e.target.value)}
              placeholder="Código de registro"
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
              {editingReseller ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
