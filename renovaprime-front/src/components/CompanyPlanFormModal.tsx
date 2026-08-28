import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import type { CompanyPlanFormData, CompanyPlanRecord, PriceTier, BillingType, CompanyServiceType } from '../types/companyPlan';

interface CompanyPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CompanyPlanFormData) => Promise<void>;
  editingPlan?: CompanyPlanRecord | null;
}

const emptyTier = (): PriceTier => ({ lives_from: 1, lives_to: 10, unit_price: 0 });

function syncBillingType(serviceType: CompanyServiceType): BillingType {
  return serviceType === 'FAMILIAR' ? 'PER_FAMILY' : 'PER_LIFE';
}

const emptyForm = (): CompanyPlanFormData => ({
  name: '',
  description: '',
  billing_type: 'PER_LIFE',
  service_type: 'CLINICO',
  tiers: [emptyTier()]
});

export function CompanyPlanFormModal({ isOpen, onClose, onSave, editingPlan }: CompanyPlanFormModalProps) {
  const [formData, setFormData] = useState<CompanyPlanFormData>(emptyForm());
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        name: editingPlan.name,
        description: editingPlan.description || '',
        billing_type: editingPlan.billing_type,
        service_type: editingPlan.service_type,
        tiers: editingPlan.tiers && editingPlan.tiers.length > 0
          ? editingPlan.tiers.map((t) => ({
              lives_from: t.lives_from,
              lives_to: t.lives_to,
              unit_price: Number(t.unit_price)
            }))
          : [emptyTier()]
      });
    } else {
      setFormData(emptyForm());
    }
    setError('');
  }, [editingPlan, isOpen]);

  const handleBillingChange = (billingType: BillingType) => {
    setFormData((prev) => ({
      ...prev,
      billing_type: billingType,
      service_type: billingType === 'PER_FAMILY' ? 'FAMILIAR' : prev.service_type === 'FAMILIAR' ? 'CLINICO' : prev.service_type
    }));
  };

  const handleServiceChange = (serviceType: CompanyServiceType) => {
    setFormData((prev) => ({
      ...prev,
      service_type: serviceType,
      billing_type: syncBillingType(serviceType)
    }));
  };

  const updateTier = (index: number, field: keyof PriceTier, value: number) => {
    setFormData((prev) => {
      const tiers = [...prev.tiers];
      tiers[index] = { ...tiers[index], [field]: value };
      return { ...prev, tiers };
    });
  };

  const addTier = () => {
    setFormData((prev) => ({
      ...prev,
      tiers: [...prev.tiers, emptyTier()]
    }));
  };

  const removeTier = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar plano');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">{editingPlan ? 'Editar Plano' : 'Novo Plano'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de cobrança</label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={formData.billing_type}
                onChange={(e) => handleBillingChange(e.target.value as BillingType)}
              >
                <option value="PER_LIFE">Por vida</option>
                <option value="PER_FAMILY">Por família</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de serviço</label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={formData.service_type}
                onChange={(e) => handleServiceChange(e.target.value as CompanyServiceType)}
              >
                <option value="CLINICO">Clínico</option>
                <option value="PREMIUM">Premium</option>
                <option value="FAMILIAR">Familiar</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Faixas de preço</label>
              <Button type="button" variant="outline" size="sm" onClick={addTier}>
                <Plus className="w-4 h-4" />
                Faixa
              </Button>
            </div>
            <div className="space-y-3">
              {formData.tiers.map((tier, index) => (
                <div key={index} className="flex flex-wrap items-end gap-2 p-3 rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-[80px]">
                    <label className="block text-xs text-muted-foreground mb-1">De</label>
                    <Input
                      type="number"
                      min={1}
                      value={tier.lives_from}
                      onChange={(e) => updateTier(index, 'lives_from', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex-1 min-w-[80px]">
                    <label className="block text-xs text-muted-foreground mb-1">Até</label>
                    <Input
                      type="number"
                      min={1}
                      value={tier.lives_to}
                      onChange={(e) => updateTier(index, 'lives_to', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-xs text-muted-foreground mb-1">Preço (R$)</label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={tier.unit_price}
                      onChange={(e) => updateTier(index, 'unit_price', Number(e.target.value))}
                    />
                  </div>
                  {formData.tiers.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeTier(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
