import { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { LayoutBeneficiario } from '../../layout/LayoutBeneficiario';
import { Card } from '../../components/Card';
import {
  HistoryFilters,
  HistoryList,
  HistoryEmptyState,
  HistoryPagination,
  appointmentsHistoryService,
} from '../../modules/appointmentsHistory';
import type {
  AppointmentHistoryItem,
  AppointmentHistoryFilters,
} from '../../modules/appointmentsHistory';

export function BeneficiarioHistorico() {
  const [appointments, setAppointments] = useState<AppointmentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<AppointmentHistoryFilters>({});
  const limit = 12;

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await appointmentsHistoryService.listPatientHistory({
        ...filters,
        page,
        limit,
      });
      setAppointments(result.items);
      setTotal(result.total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar historico';
      setError(message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFilterChange = (newFilters: {
    status?: 'FINISHED' | 'CANCELED';
    startDate?: string;
    endDate?: string;
    specialtyId?: number;
    search?: string;
  }) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasFilters = Object.values(filters).some((v) => v !== undefined);
  const canceledCount = appointments.filter((item) => item.status === 'CANCELED').length;
  const finishedCount = appointments.filter((item) => item.status === 'FINISHED').length;

  return (
    <LayoutBeneficiario title="Histórico de Consultas">
      <div className="w-full mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">
              Histórico de Consultas
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Visualize suas consultas finalizadas e canceladas com filtros detalhados.
            </p>
          </div>
        </div>

        {!isLoading && appointments.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="bg-gradient-to-br from-primary/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total na pagina</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{appointments.length}</p>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Finalizadas</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                {finishedCount}
              </p>
            </Card>
            <Card className="bg-gradient-to-br from-rose-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Canceladas</p>
              <p className="mt-2 text-2xl font-semibold text-rose-700 dark:text-rose-400">
                {canceledCount}
              </p>
            </Card>
          </div>
        )}

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4 backdrop-blur-sm">
          <HistoryFilters
            onFilterChange={handleFilterChange}
            searchPlaceholder="Buscar por nome do profissional..."
          />
        </div>

        {error && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
              <h2 className="text-xl font-display text-foreground">Erro ao carregar historico</h2>
              <p className="max-w-md text-sm text-muted-foreground">{error}</p>
              <button
                onClick={loadHistory}
                className="mt-1 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Tentar novamente
              </button>
            </div>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-10">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          </Card>
        ) : appointments.length === 0 ? (
          <Card className="p-10">
            <HistoryEmptyState hasFilters={hasFilters} />
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'consulta encontrada' : 'consultas encontradas'}
            </p>

            <Card className="border-border/70 p-3">
              <HistoryList appointments={appointments} viewType="patient" />
            </Card>

            <Card className="border-border/70 p-3">
              <HistoryPagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={handlePageChange}
              />
            </Card>
          </div>
        )}
      </div>
    </LayoutBeneficiario>
  );
}
