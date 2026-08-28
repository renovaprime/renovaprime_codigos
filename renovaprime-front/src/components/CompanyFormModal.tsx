import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import type { CompanyFormData, CompanyRecord } from '../types/company';

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CompanyFormData) => Promise<void>;
  editingCompany?: CompanyRecord | null;
}

const emptyForm = (): CompanyFormData => ({
  legal_name: '',
  trade_name: '',
  cnpj: '',
  phone: '',
  email: '',
  zip_code: '',
  address: '',
  city: '',
  state: '',
  state_registration: '',
  responsible_name: '',
  responsible_email: '',
  responsible_phone: '',
  password: '',
  notes: '',
});

export function CompanyFormModal({ isOpen, onClose, onSave, editingCompany }: CompanyFormModalProps) {
  const [formData, setFormData] = useState<CompanyFormData>(emptyForm());
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingCompany) {
      setFormData({
        legal_name: editingCompany.legal_name,
        trade_name: editingCompany.trade_name,
        cnpj: editingCompany.cnpj,
        phone: editingCompany.phone,
        email: editingCompany.email,
        zip_code: editingCompany.zip_code,
        address: editingCompany.address,
        city: editingCompany.city,
        state: editingCompany.state,
        state_registration: editingCompany.state_registration || '',
        responsible_name: editingCompany.responsible_name,
        responsible_email: editingCompany.responsible_email,
        responsible_phone: editingCompany.responsible_phone || '',
        password: '',
        notes: editingCompany.notes || '',
      });
    } else {
      setFormData(emptyForm());
    }
    setError('');
  }, [editingCompany, isOpen]);

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany && !formData.password) {
      setError('Senha inicial é obrigatória');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = { ...formData };
      if (editingCompany && !payload.password) {
        delete payload.password;
      }
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar empresa');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>}

          <Tabs defaultValue="pj">
            <TabsList>
              <TabsTrigger value="pj">Dados PJ</TabsTrigger>
              <TabsTrigger value="responsavel">Responsável</TabsTrigger>
            </TabsList>

            <TabsContent value="pj" className="space-y-4 pt-4">
              <Input placeholder="Razão social" value={formData.legal_name} onChange={(e) => handleChange('legal_name', e.target.value)} required />
              <Input placeholder="Nome fantasia" value={formData.trade_name} onChange={(e) => handleChange('trade_name', e.target.value)} required />
              <Input placeholder="CNPJ" value={formData.cnpj} onChange={(e) => handleChange('cnpj', e.target.value)} required />
              <Input placeholder="Telefone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} required />
              <Input type="email" placeholder="E-mail corporativo" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
              <Input placeholder="CEP" value={formData.zip_code} onChange={(e) => handleChange('zip_code', e.target.value)} required />
              <Input placeholder="Endereço" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} required />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Cidade" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} required />
                <Input placeholder="UF" maxLength={2} value={formData.state} onChange={(e) => handleChange('state', e.target.value.toUpperCase())} required />
              </div>
              <Input placeholder="Inscrição estadual (opcional)" value={formData.state_registration} onChange={(e) => handleChange('state_registration', e.target.value)} />
            </TabsContent>

            <TabsContent value="responsavel" className="space-y-4 pt-4">
              <Input placeholder="Nome do responsável" value={formData.responsible_name} onChange={(e) => handleChange('responsible_name', e.target.value)} required />
              <Input type="email" placeholder="E-mail de login" value={formData.responsible_email} onChange={(e) => handleChange('responsible_email', e.target.value)} required />
              <Input placeholder="Telefone do responsável (opcional)" value={formData.responsible_phone} onChange={(e) => handleChange('responsible_phone', e.target.value)} />
              <Input
                type="password"
                placeholder={editingCompany ? 'Nova senha (deixe em branco para manter)' : 'Senha inicial'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required={!editingCompany}
                minLength={6}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
