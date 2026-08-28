import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit2 } from 'lucide-react';
import { Layout } from '../../layout';
import { Card, EmptyState, Button, Input, Badge, Switch, ConfirmModal, PageHeader } from '../../components';
import { CompanyPlanFormModal } from '../../components/CompanyPlanFormModal';
import { companyPlanService } from '../../services/companyPlanService';
import type { CompanyPlanFormData, CompanyPlanRecord } from '../../types/companyPlan';

const BILLING_LABELS: Record<string, string> = {
  PER_LIFE: 'Por vida',
  PER_FAMILY: 'Por família'
};

const SERVICE_LABELS: Record<string, string> = {
  CLINICO: 'Clínico',
  PREMIUM: 'Premium',
  FAMILIAR: 'Familiar'
};

export function PlanosEmpresariais() {
  const [plans, setPlans] = useState<CompanyPlanRecord[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<CompanyPlanRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CompanyPlanRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [planToToggle, setPlanToToggle] = useState<CompanyPlanRecord | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlans(plans);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredPlans(
        plans.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.service_type.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, plans]);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await companyPlanService.listPlans();
      setPlans(data);
      setFilteredPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar planos');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSave = async (data: CompanyPlanFormData) => {
    if (editingPlan) {
      await companyPlanService.updatePlan(editingPlan.id, data);
      showSuccess('Plano atualizado com sucesso!');
    } else {
      await companyPlanService.createPlan(data);
      showSuccess('Plano criado com sucesso!');
    }
    await loadPlans();
  };

  const handleConfirmToggle = async () => {
    if (!planToToggle) return;
    try {
      await companyPlanService.updatePlanStatus(planToToggle.id, !planToToggle.active);
      showSuccess(`Plano ${planToToggle.active ? 'desativado' : 'ativado'} com sucesso!`);
      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status');
    } finally {
      setPlanToToggle(null);
    }
  };

  return (
    <Layout title="Planos Empresariais">
      <div className="space-y-6">
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
            {successMessage}
          </div>
        )}

        <PageHeader
          title="Planos Empresariais"
          subtitle="Catálogo global de planos com faixas de preço por volume."
          actions={
            <Button onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}>
              <Plus className="w-4 h-4" />
              Novo Plano
            </Button>
          }
        />

        {error && <div className="p-4 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>}

        <Card padding="sm">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou tipo..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : filteredPlans.length === 0 ? (
          <Card>
            <EmptyState icon={Package} title="Nenhum plano" description="Cadastre o primeiro plano empresarial." />
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} padding="md">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <Badge variant={plan.active ? 'success' : 'secondary'}>
                        {plan.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline">{BILLING_LABELS[plan.billing_type]}</Badge>
                      <Badge variant="outline">{SERVICE_LABELS[plan.service_type]}</Badge>
                    </div>
                    {plan.tiers && plan.tiers.length > 0 ? (
                      <ul className="text-sm text-muted-foreground space-y-0.5">
                        {plan.tiers.map((tier, i) => (
                          <li key={i}>
                            {tier.lives_from}–{tier.lives_to} vidas: R$ {Number(tier.unit_price).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Sem faixas cadastradas</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={plan.active}
                      onCheckedChange={() => {
                        setPlanToToggle(plan);
                        setToggleModalOpen(true);
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <CompanyPlanFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingPlan(null); }}
          onSave={handleSave}
          editingPlan={editingPlan}
        />

        <ConfirmModal
          isOpen={toggleModalOpen}
          onClose={() => { setToggleModalOpen(false); setPlanToToggle(null); }}
          onConfirm={handleConfirmToggle}
          title={planToToggle?.active ? 'Desativar plano' : 'Ativar plano'}
          message={`Confirma ${planToToggle?.active ? 'desativar' : 'ativar'} ${planToToggle?.name}?`}
        />
      </div>
    </Layout>
  );
}
