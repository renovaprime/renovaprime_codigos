import { useState, useEffect, useCallback } from 'react';
import { LayoutBeneficiario } from '../../layout/LayoutBeneficiario';
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

  return (
    <LayoutBeneficiario title="Historico de Consultas">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Historico de Consultas
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize suas consultas finalizadas e canceladas
          </p>
        </div>

        {/* Filters */}
        <HistoryFilters
          onFilterChange={handleFilterChange}
          searchPlaceholder="Buscar por nome do profissional..."
        />

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-700 underline mt-1"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : appointments.length === 0 ? (
          /* Empty state */
          <HistoryEmptyState hasFilters={hasFilters} />
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-4">
              {total} {total === 1 ? 'consulta encontrada' : 'consultas encontradas'}
            </p>

            {/* Appointments list */}
            <HistoryList
              appointments={appointments}
              viewType="patient"
            />

            {/* Pagination */}
            <HistoryPagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </LayoutBeneficiario>
  );
}
