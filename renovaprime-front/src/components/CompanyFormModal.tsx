import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { ModalOverlay } from './ModalOverlay';
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
    <ModalOverlay>
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
              <Input
                label="Razão social *"
                placeholder="Razão social da empresa"
                value={formData.legal_name}
                onChange={(e) => handleChange('legal_name', e.target.value)}
                required
              />
              <Input
                label="Nome fantasia *"
                placeholder="Nome fantasia"
                value={formData.trade_name}
                onChange={(e) => handleChange('trade_name', e.target.value)}
                required
              />
              <Input
                label="CNPJ *"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                required
              />
              <Input
                label="Telefone *"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
              <Input
                label="E-mail corporativo *"
                type="email"
                placeholder="contato@empresa.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              <Input
                label="CEP *"
                placeholder="00000-000"
                value={formData.zip_code}
                onChange={(e) => handleChange('zip_code', e.target.value)}
                required
              />
              <Input
                label="Endereço *"
                placeholder="Rua, número, bairro"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Cidade *"
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
                <Input
                  label="UF *"
                  placeholder="SP"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                  required
                />
              </div>
              <Input
                label="Inscrição estadual"
                placeholder="Número da inscrição"
                hint="Opcional"
                value={formData.state_registration}
                onChange={(e) => handleChange('state_registration', e.target.value)}
              />
            </TabsContent>

            <TabsContent value="responsavel" className="space-y-4 pt-4">
              <Input
                label="Nome do responsável *"
                placeholder="Nome completo"
                value={formData.responsible_name}
                onChange={(e) => handleChange('responsible_name', e.target.value)}
                required
              />
              <Input
                label="E-mail de login *"
                type="email"
                placeholder="responsavel@empresa.com"
                value={formData.responsible_email}
                onChange={(e) => handleChange('responsible_email', e.target.value)}
                required
              />
              <Input
                label="Telefone do responsável"
                placeholder="(00) 00000-0000"
                hint="Opcional"
                value={formData.responsible_phone}
                onChange={(e) => handleChange('responsible_phone', e.target.value)}
              />
              <Input
                label={editingCompany ? 'Nova senha' : 'Senha inicial *'}
                type="password"
                placeholder={editingCompany ? 'Nova senha' : 'Mínimo 6 caracteres'}
                hint={editingCompany ? 'Deixe em branco para manter a senha atual' : undefined}
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
    </ModalOverlay>
  );
}
