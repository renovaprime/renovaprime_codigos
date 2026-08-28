import { useState, useEffect, Fragment } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Download,
  Search,
  Users,
  Receipt
} from 'lucide-react';
import { Layout } from '../../layout';
import { Card, EmptyState, Badge, Input, PageHeader, Button } from '../../components';
import { companyReportService } from '../../services/companyReportService';
import type { CompanyReportSummary } from '../../types/companyReport';
import type { CompanyReportLives, CompanyReportBillings } from '../../types/companyReport';
import {
  BILLING_STATUS_LABELS,
  BILLING_STATUS_VARIANTS
} from '../../types/companyBilling';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCnpj(cnpj: string) {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatCompetence(competence: string) {
  const [year, month] = competence.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function exportSummaryCsv(reports: CompanyReportSummary[]) {
  const headers = [
    'Empresa',
    'CNPJ',
    'Status',
    'Plano',
    'Vidas ativas',
    'Titulares ativos',
    'Última competência',
    'Último valor',
    'Último status'
  ];

  const rows = reports.map((r) => [
    r.trade_name,
    formatCnpj(r.cnpj),
    r.active ? 'Ativa' : 'Inativa',
    r.plan?.name || '-',
    String(r.lives_active),
    String(r.titulars_active),
    r.last_billing?.competence || '-',
    r.last_billing ? formatCurrency(r.last_billing.total_amount) : '-',
    r.last_billing ? BILLING_STATUS_LABELS[r.last_billing.status] : '-'
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorios-empresas-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function RelatoriosEmpresas() {
  const [reports, setReports] = useState<CompanyReportSummary[]>([]);
  const [filteredReports, setFilteredReports] = useState<CompanyReportSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [livesDetail, setLivesDetail] = useState<CompanyReportLives | null>(null);
  const [billingsDetail, setBillingsDetail] = useState<CompanyReportBillings | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'lives' | 'billings'>('lives');

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const digits = searchTerm.replace(/\D/g, '');

    setFilteredReports(
      reports.filter((r) => {
        if (statusFilter === 'active' && !r.active) return false;
        if (statusFilter === 'inactive' && r.active) return false;
        if (!term) return true;
        return (
          r.trade_name.toLowerCase().includes(term) ||
          r.legal_name.toLowerCase().includes(term) ||
          (digits.length > 0 && r.cnpj.includes(digits))
        );
      })
    );
  }, [searchTerm, statusFilter, reports]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await companyReportService.list();
      setReports(data);
      setFilteredReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetail = async (companyId: number, tab: 'lives' | 'billings') => {
    setDetailLoading(true);
    setDetailTab(tab);
    try {
      if (tab === 'lives') {
        const data = await companyReportService.getLives(companyId);
        setLivesDetail(data);
      } else {
        const data = await companyReportService.getBillings(companyId);
        setBillingsDetail(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleExpand = async (companyId: number) => {
    if (expandedId === companyId) {
      setExpandedId(null);
      setLivesDetail(null);
      setBillingsDetail(null);
      return;
    }

    setExpandedId(companyId);
    setLivesDetail(null);
    setBillingsDetail(null);
    await loadDetail(companyId, 'lives');
  };

  const totals = filteredReports.reduce(
    (acc, r) => ({
      companies: acc.companies + 1,
      lives: acc.lives + r.lives_active,
      titulars: acc.titulars + r.titulars_active
    }),
    { companies: 0, lives: 0, titulars: 0 }
  );

  return (
    <Layout title="Relatórios B2B">
      <div className="space-y-6">
        <PageHeader
          title="Relatórios B2B"
          subtitle="Resumo de empresas, vidas ativas e histórico de cobrança."
          actions={
            <Button
              variant="outline"
              onClick={() => exportSummaryCsv(filteredReports)}
              disabled={filteredReports.length === 0}
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          }
        />

        {error && <div className="p-4 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 via-card/90 to-secondary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empresas</p>
                <p className="text-xl font-semibold">{totals.companies}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vidas ativas</p>
                <p className="text-xl font-semibold">{totals.lives}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 via-card/90 to-secondary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Titulares ativos</p>
                <p className="text-xl font-semibold">{totals.titulars}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card padding="sm">
          <div className="p-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CNPJ..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="all">Todas</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>
        </Card>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : filteredReports.length === 0 ? (
          <Card>
            <EmptyState
              icon={BarChart3}
              title="Nenhuma empresa"
              description="Não há empresas cadastradas para exibir no relatório."
            />
          </Card>
        ) : (
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="w-8 p-3" />
                    <th className="text-left p-3 font-medium">Empresa</th>
                    <th className="text-left p-3 font-medium">CNPJ</th>
                    <th className="text-left p-3 font-medium">Plano</th>
                    <th className="text-center p-3 font-medium">Vidas</th>
                    <th className="text-center p-3 font-medium">Titulares</th>
                    <th className="text-left p-3 font-medium">Última fatura</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <Fragment key={report.id}>
                      <tr
                        className="border-b hover:bg-muted/20 cursor-pointer"
                        onClick={() => toggleExpand(report.id)}
                      >
                        <td className="p-3 text-muted-foreground">
                          {expandedId === report.id ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>
                        <td className="p-3 font-medium">{report.trade_name}</td>
                        <td className="p-3 text-muted-foreground">{formatCnpj(report.cnpj)}</td>
                        <td className="p-3">{report.plan?.name || '—'}</td>
                        <td className="p-3 text-center">{report.lives_active}</td>
                        <td className="p-3 text-center">{report.titulars_active}</td>
                        <td className="p-3">
                          {report.last_billing ? (
                            <span>
                              {formatCompetence(report.last_billing.competence)} —{' '}
                              {formatCurrency(report.last_billing.total_amount)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant={report.active ? 'success' : 'secondary'}>
                            {report.active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </td>
                      </tr>
                      {expandedId === report.id && (
                        <tr className="bg-muted/10">
                          <td colSpan={8} className="p-4">
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={detailTab === 'lives' ? 'default' : 'outline'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    loadDetail(report.id, 'lives');
                                  }}
                                >
                                  <Users className="w-4 h-4" />
                                  Vidas
                                </Button>
                                <Button
                                  size="sm"
                                  variant={detailTab === 'billings' ? 'default' : 'outline'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    loadDetail(report.id, 'billings');
                                  }}
                                >
                                  <Receipt className="w-4 h-4" />
                                  Faturas
                                </Button>
                              </div>

                              {detailLoading ? (
                                <p className="text-muted-foreground text-sm">Carregando detalhes...</p>
                              ) : detailTab === 'lives' && livesDetail ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left p-2 font-medium">Nome</th>
                                        <th className="text-left p-2 font-medium">CPF</th>
                                        <th className="text-left p-2 font-medium">Tipo</th>
                                        <th className="text-left p-2 font-medium">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {livesDetail.beneficiaries.length === 0 ? (
                                        <tr>
                                          <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                            Nenhuma vida cadastrada
                                          </td>
                                        </tr>
                                      ) : (
                                        livesDetail.beneficiaries.map((b) => (
                                          <tr key={b.id} className="border-b">
                                            <td className="p-2">{b.name}</td>
                                            <td className="p-2">{b.cpf}</td>
                                            <td className="p-2">{b.type}</td>
                                            <td className="p-2">
                                              <Badge variant={b.status === 'ACTIVE' ? 'success' : 'secondary'}>
                                                {b.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                                              </Badge>
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              ) : detailTab === 'billings' && billingsDetail ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left p-2 font-medium">Competência</th>
                                        <th className="text-left p-2 font-medium">Vidas</th>
                                        <th className="text-left p-2 font-medium">Valor</th>
                                        <th className="text-left p-2 font-medium">Vencimento</th>
                                        <th className="text-left p-2 font-medium">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {billingsDetail.billings.length === 0 ? (
                                        <tr>
                                          <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                            Nenhuma fatura registrada
                                          </td>
                                        </tr>
                                      ) : (
                                        billingsDetail.billings.map((b) => (
                                          <tr key={b.id} className="border-b">
                                            <td className="p-2">{formatCompetence(b.competence)}</td>
                                            <td className="p-2">{b.total_lives}</td>
                                            <td className="p-2">{formatCurrency(b.total_amount)}</td>
                                            <td className="p-2">
                                              {new Date(b.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="p-2">
                                              <Badge variant={BILLING_STATUS_VARIANTS[b.status]}>
                                                {BILLING_STATUS_LABELS[b.status]}
                                              </Badge>
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
