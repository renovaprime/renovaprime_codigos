import { useState, useEffect } from 'react';
import { Percent, DollarSign } from 'lucide-react';
import { LayoutParceiro } from '../../layout/LayoutParceiro';
import { Card, EmptyState, Input } from '../../components';
import { partnerAreaService, type CommissionRow } from '../../services/partnerAreaService';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

export function ParceiroComissoes() {
  const { entity } = usePartnerAuth();
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadCommissions();
  }, [startDate, endDate]);

  const loadCommissions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const data = await partnerAreaService.getCommissions(filters);
      setCommissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar comissões');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const totals = commissions.reduce(
    (acc, row) => ({
      sales: acc.sales + Number(row.totalSales),
      value: acc.value + Number(row.totalValue),
      reseller: acc.reseller + Number(row.commissionReseller),
      branch: acc.branch + Number(row.commissionBranch),
      partner: acc.partner + Number(row.commissionPartner),
    }),
    { sales: 0, value: 0, reseller: 0, branch: 0, partner: 0 }
  );

  const showResellerCol = entity?.type !== undefined;
  const showBranchCol = entity?.type === 'partner' || entity?.type === 'branch';
  const showPartnerCol = entity?.type === 'partner';

  return (
    <LayoutParceiro title="Comissões">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">Comissões</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">Relatório de comissões (vendas confirmadas).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {showResellerCol && (
            <Card className="bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Com. Revendedores</p>
                  <p className="text-xl font-semibold text-foreground">{formatCurrency(totals.reseller)}</p>
                </div>
              </div>
            </Card>
          )}
          {showBranchCol && (
            <Card className="bg-gradient-to-br from-primary/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Com. Filiais</p>
                  <p className="text-xl font-semibold text-foreground">{formatCurrency(totals.branch)}</p>
                </div>
              </div>
            </Card>
          )}
          {showPartnerCol && (
            <Card className="bg-gradient-to-br from-purple-500/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Com. Parceiro</p>
                  <p className="text-xl font-semibold text-foreground">{formatCurrency(totals.partner)}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-3 p-2">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1" />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1" />
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
        ) : commissions.length === 0 ? (
          <Card>
            <EmptyState
              icon={Percent}
              title="Nenhuma comissão encontrada"
              description="Não há vendas confirmadas no período selecionado."
            />
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revendedor</th>
                    {(entity?.type === 'partner') && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Filial</th>
                    )}
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Vendas</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Valor Total</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Com. Revendedor</th>
                    {showBranchCol && (
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Com. Filial</th>
                    )}
                    {showPartnerCol && (
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Com. Parceiro</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((row, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        {row.Reseller?.name || 'Venda direta'}
                      </td>
                      {(entity?.type === 'partner') && (
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {row.PartnerBranch?.name || '-'}
                        </td>
                      )}
                      <td className="py-3 px-4 text-sm text-foreground text-right">{row.totalSales}</td>
                      <td className="py-3 px-4 text-sm text-foreground text-right font-medium">
                        {formatCurrency(Number(row.totalValue))}
                      </td>
                      <td className="py-3 px-4 text-sm text-green-600 text-right font-medium">
                        {formatCurrency(Number(row.commissionReseller))}
                      </td>
                      {showBranchCol && (
                        <td className="py-3 px-4 text-sm text-blue-600 text-right font-medium">
                          {formatCurrency(Number(row.commissionBranch))}
                        </td>
                      )}
                      {showPartnerCol && (
                        <td className="py-3 px-4 text-sm text-purple-600 text-right font-medium">
                          {formatCurrency(Number(row.commissionPartner))}
                        </td>
                      )}
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
