import { useState, useEffect } from 'react';
import { ExternalLink, Receipt } from 'lucide-react';
import { LayoutEmpresa } from '../../layout/LayoutEmpresa';
import { Card, EmptyState, Badge, PageHeader } from '../../components';
import { companyBillingService } from '../../services/companyBillingService';
import type { CompanyBillingPortalRecord } from '../../types/companyBilling';
import {
  BILLING_STATUS_LABELS,
  BILLING_STATUS_VARIANTS
} from '../../types/companyBilling';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCompetence(competence: string) {
  const [year, month] = competence.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function EmpresaFaturas() {
  const [billings, setBillings] = useState<CompanyBillingPortalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBillings();
  }, []);

  const loadBillings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await companyBillingService.listPortal();
      setBillings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar faturas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutEmpresa title="Faturas">
      <div className="space-y-6">
        <PageHeader
          title="Faturas"
          subtitle="Consulte o histórico de faturamento mensal da sua empresa."
        />

        {error && <div className="p-4 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>}

        {isLoading ? (
          <p className="text-muted-foreground">Carregando faturas...</p>
        ) : billings.length === 0 ? (
          <Card>
            <EmptyState
              icon={Receipt}
              title="Nenhuma fatura"
              description="Quando o administrador gerar o faturamento mensal, as faturas aparecerão aqui."
            />
          </Card>
        ) : (
          <div className="grid gap-4">
            {billings.map((billing) => (
              <Card key={billing.id} padding="md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{formatCompetence(billing.competence)}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {billing.total_lives} vidas · Vencimento{' '}
                      {new Date(billing.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-lg font-semibold mt-2">{formatCurrency(billing.total_amount)}</p>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <Badge variant={BILLING_STATUS_VARIANTS[billing.status]}>
                      {BILLING_STATUS_LABELS[billing.status]}
                    </Badge>
                    {billing.asaas_invoice_url && (
                      <a
                        href={billing.asaas_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Pagar fatura
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutEmpresa>
  );
}
