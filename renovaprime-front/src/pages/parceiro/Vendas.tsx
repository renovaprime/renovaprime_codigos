import { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { LayoutParceiro } from '../../layout/LayoutParceiro';
import { Card, EmptyState, Input, Badge } from '../../components';
import { partnerAreaService } from '../../services/partnerAreaService';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import type { ResellerSaleRecord, SalesSummary } from '../../services/salesReportService';
import type { PartnerBranchItem, PartnerResellerItem } from '../../types/partner';

const PLAN_LABELS: Record<string, string> = {
  CLINICO: 'Individual',
  PREMIUM: 'Premium',
  FAMILIAR: 'Familiar',
};

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  OVERDUE: 'warning',
  REFUNDED: 'default',
  FAILED: 'error',
  CANCELED: 'default',
};

export function ParceiroVendas() {
  const { entity } = usePartnerAuth();
  const [sales, setSales] = useState<ResellerSaleRecord[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [branches, setBranches] = useState<PartnerBranchItem[]>([]);
  const [resellers, setResellers] = useState<PartnerResellerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [branchFilter, setBranchFilter] = useState('');
  const [resellerFilter, setResellerFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    loadSales();
  }, [branchFilter, resellerFilter, planFilter, statusFilter, startDate, endDate]);

  const loadDropdownData = async () => {
    try {
      if (entity?.type === 'partner') {
        const [branchData, resellerData] = await Promise.all([
          partnerAreaService.getBranches(),
          partnerAreaService.getResellers(),
        ]);
        setBranches(branchData);
        setResellers(resellerData);
      } else if (entity?.type === 'branch') {
        const resellerData = await partnerAreaService.getResellers();
        setResellers(resellerData);
      }
    } catch {
      // ignore
    }
  };

  const loadSales = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters = {
        branch_id: branchFilter ? Number(branchFilter) : undefined,
        reseller_id: resellerFilter ? Number(resellerFilter) : undefined,
        plan_type: planFilter || undefined,
        status: statusFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const [salesData, summaryData] = await Promise.all([
        partnerAreaService.getSales(filters),
        partnerAreaService.getSalesSummary(filters),
      ]);

      setSales(salesData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vendas');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <LayoutParceiro title="Vendas">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">Vendas</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">Acompanhe as vendas realizadas.</p>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Vendas</p>
                  <p className="text-xl font-semibold text-foreground">{summary.totalSales}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-xl font-semibold text-foreground">{formatCurrency(summary.totalValue)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confirmadas</p>
                  <p className="text-xl font-semibold text-foreground">{summary.confirmedCount}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-xl font-semibold text-foreground">{summary.pendingCount}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Card padding="sm">
          <div className="flex flex-col gap-3 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {entity?.type === 'partner' && (
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm transition-all duration-200 ease-out hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="">Todas as filiais</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
              {(entity?.type === 'partner' || entity?.type === 'branch') && (
                <select
                  value={resellerFilter}
                  onChange={(e) => setResellerFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm transition-all duration-200 ease-out hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="">Todos os revendedores</option>
                  {resellers.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm transition-all duration-200 ease-out hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="">Todos os planos</option>
                <option value="CLINICO">Individual</option>
                <option value="PREMIUM">Premium</option>
                <option value="FAMILIAR">Familiar</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm transition-all duration-200 ease-out hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="">Todos os status</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="PENDING">Pendente</option>
                <option value="OVERDUE">Vencida</option>
                <option value="REFUNDED">Reembolsada</option>
                <option value="FAILED">Falha</option>
                <option value="CANCELED">Cancelada</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1" />
            </div>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        {isLoading ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        ) : sales.length === 0 ? (
          <Card>
            <EmptyState
              icon={ShoppingCart}
              title="Nenhuma venda encontrada"
              description="Ajuste os filtros ou aguarde novas vendas."
            />
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Beneficiário</th>
                    {entity?.type !== 'reseller' && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revendedor</th>
                    )}
                    {entity?.type === 'partner' && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Filial</th>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plano</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-foreground">{formatDate(sale.created_at)}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-foreground">{sale.Beneficiary?.name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{sale.cpf}</p>
                      </td>
                      {entity?.type !== 'reseller' && (
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {sale.Reseller?.name || 'Venda direta'}
                        </td>
                      )}
                      {entity?.type === 'partner' && (
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {sale.PartnerBranch?.name || '-'}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <Badge variant="primary">{PLAN_LABELS[sale.plan_type] || sale.plan_type}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground text-right font-medium">
                        {formatCurrency(Number(sale.value))}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={STATUS_VARIANTS[sale.status] || 'default'}>{sale.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </LayoutParceiro>
  );
}
