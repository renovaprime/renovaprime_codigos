import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { companyPlanService } from '../services/companyPlanService';
import type { CompanyRecord } from '../types/company';
import type { CompanyPlanRecord, CompanyContractFormData } from '../types/companyPlan';

interface CompanyContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyRecord | null;
  onSaved?: () => void;
}

function todayIso(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

export function CompanyContractModal({ isOpen, onClose, company, onSaved }: CompanyContractModalProps) {
  const [plans, setPlans] = useState<CompanyPlanRecord[]>([]);
  const [formData, setFormData] = useState<CompanyContractFormData>({
    company_plan_id: 0,
    due_day: 5,
    starts_on: todayIso(),
    ends_on: null,
    force: false
  });
  const [hasExistingContract, setHasExistingContract] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (!isOpen || !company) return;

    const load = async () => {
      setIsLoadingData(true);
      setError('');
      try {
        const activePlans = await companyPlanService.listPlans('active');
        setPlans(activePlans);

        try {
          const contract = await companyPlanService.getContract(company.id);
          setHasExistingContract(true);
          setFormData({
            company_plan_id: contract.company_plan_id,
            due_day: contract.due_day,
            starts_on: contract.starts_on,
            ends_on: contract.ends_on ?? null,
            force: false
          });
        } catch {
          setHasExistingContract(false);
          setFormData({
            company_plan_id: activePlans[0]?.id ?? 0,
            due_day: 5,
            starts_on: todayIso(),
            ends_on: null,
            force: false
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoadingData(false);
      }
    };

    load();
  }, [isOpen, company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !formData.company_plan_id) {
      setError('Selecione um plano');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload: CompanyContractFormData = {
        company_plan_id: formData.company_plan_id,
        due_day: formData.due_day,
        starts_on: formData.starts_on,
        ends_on: formData.ends_on || null
      };

      if (hasExistingContract) {
        payload.force = true;
      }

      await companyPlanService.createContract(company.id, payload);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar contrato');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !company) return null;

  const selectedPlan = plans.find((p) => p.id === formData.company_plan_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Contrato — Plano</h2>
            <p className="text-sm text-muted-foreground">{company.trade_name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>}

          {isLoadingData ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Plano</label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={formData.company_plan_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company_plan_id: Number(e.target.value) }))}
                  required
                >
                  <option value={0} disabled>Selecione um plano</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.billing_type === 'PER_LIFE' ? 'Por vida' : 'Por família'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlan && (
                <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <p>Tipo: {selectedPlan.service_type}</p>
                  {selectedPlan.tiers && selectedPlan.tiers.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {selectedPlan.tiers.map((tier, i) => (
                        <li key={i}>
                          {tier.lives_from}–{tier.lives_to} vidas: R$ {Number(tier.unit_price).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Dia de vencimento (1–28)</label>
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={formData.due_day}
                  onChange={(e) => setFormData((prev) => ({ ...prev, due_day: Number(e.target.value) }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Início da vigência</label>
                <Input
                  type="date"
                  value={formData.starts_on}
                  onChange={(e) => setFormData((prev) => ({ ...prev, starts_on: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fim da vigência (opcional)</label>
                <Input
                  type="date"
                  value={formData.ends_on ?? ''}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    ends_on: e.target.value || null
                  }))}
                />
              </div>

              {hasExistingContract && (
                <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                  Já existe contrato ativo. Ao salvar, o contrato anterior será substituído.
                </p>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || isLoadingData}>
              {isLoading ? 'Salvando...' : hasExistingContract ? 'Substituir contrato' : 'Vincular plano'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
