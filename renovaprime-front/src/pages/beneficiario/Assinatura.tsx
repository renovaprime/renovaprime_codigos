import { useState, useEffect } from 'react';
import { Shield, Users, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { LayoutBeneficiario } from '../../layout/LayoutBeneficiario';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components';
import { subscriptionService } from '../../services/subscriptionService';
import type { SubscriptionData } from '../../types/api';

const PLAN_TYPE_LABELS: Record<string, string> = {
  CLINICO: 'Clínico',
  PREMIUM: 'Premium',
  FAMILIAR: 'Familiar',
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  CONFIRMED: { label: 'Confirmado', color: 'text-green-700', bg: 'bg-green-50' },
  OVERDUE: { label: 'Inadimplente', color: 'text-red-700', bg: 'bg-red-50' },
  REFUNDED: { label: 'Reembolsado', color: 'text-gray-700', bg: 'bg-gray-100' },
  FAILED: { label: 'Falhou', color: 'text-red-700', bg: 'bg-red-50' },
  CANCELED: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length === 11) {
    return `***.***.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return cpf;
}

export function BeneficiarioAssinatura() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await subscriptionService.getMySubscription();
      setSubscription(data);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = subscription?.status === 'ACTIVE';
  const paymentConfig = subscription?.payment_status
    ? PAYMENT_STATUS_CONFIG[subscription.payment_status]
    : null;

  return (
    <LayoutBeneficiario title="Assinatura">
      <div className="w-full mx-auto space-y-6">
        <PageHeader
          title="Assinatura"
          subtitle="Acompanhe seu plano atual, situacao de pagamento e beneficiarios vinculados."
        />

        {isLoading ? (
          <Card className="p-10">
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          </Card>
        ) : notFound || !subscription ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-display text-foreground">
                Nenhuma assinatura encontrada
              </h2>
              <p className="text-muted-foreground max-w-md">
                Voce ainda nao possui um plano ativo.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="bg-gradient-to-br from-primary/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Plano</p>
                <p className="mt-2 text-base font-semibold text-foreground">{subscription.plan.name}</p>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="mt-2 text-base font-semibold text-emerald-700 dark:text-emerald-400">
                  {isActive ? 'Ativo' : 'Inativo'}
                </p>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Beneficiarios</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-700 dark:text-cyan-400">
                  {subscription.beneficiaries.length}
                </p>
              </Card>
            </div>

            <Card className="overflow-hidden border-border/70 p-0">
              <div className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-display text-foreground">
                    {subscription.plan.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                      {PLAN_TYPE_LABELS[subscription.plan.type] || subscription.plan.type}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold text-white ${
                        isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50" />

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor mensal</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(subscription.plan.price)}
                  </span>
                </div>

                {paymentConfig && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pagamento</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${paymentConfig.bg} ${paymentConfig.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${paymentConfig.color.replace('text-', 'bg-')}`}
                      />
                      {paymentConfig.label}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Membro desde</span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {formatDate(subscription.subscribed_at)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-border/70 p-0">
              <div className="p-6 flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-base font-display text-foreground flex-1">
                  Beneficiários
                </h3>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {subscription.beneficiaries.length}
                </span>
              </div>

              <div className="border-t border-border/50" />

              <div className="divide-y divide-border/50">
                {subscription.beneficiaries.map((ben) => (
                  <div key={ben.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {ben.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {maskCpf(ben.cpf)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        ben.type === 'TITULAR'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-teal-50 text-teal-700'
                      }`}
                    >
                      {ben.type === 'TITULAR' ? 'Titular' : 'Dependente'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </LayoutBeneficiario>
  );
}
