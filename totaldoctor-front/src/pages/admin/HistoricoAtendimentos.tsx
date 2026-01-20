import { useState, useEffect, useCallback } from 'react';
import { Layout } from '../../layout';
import { specialtyService } from '../../services/specialtyService';
import {
  AdminAppointmentsFilters,
  AdminAppointmentCard,
  AdminAppointmentDetailsModal,
  adminAppointmentsService,
} from '../../modules/adminAppointments';
import type {
  AdminAppointmentItem,
  AdminAppointmentsFiltersParams,
} from '../../modules/adminAppointments';
import type { Specialty } from '../../types/api';
import { HistoryEmptyState, HistoryPagination } from '../../modules/appointmentsHistory';

export function AdminHistoricoAtendimentos() {
  const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<AdminAppointmentsFiltersParams>({});
  const limit = 12;

  // Modal states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminAppointmentsService.listHistory({
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

  const loadSpecialties = async () => {
    try {
      const data = await specialtyService.listSpecialties();
      setSpecialties(data);
    } catch (err) {
      console.error('Erro ao carregar especialidades', err);
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleFilterChange = (newFilters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    specialtyId?: number;
    type?: 'ONLINE' | 'PRESENTIAL';
    search?: string;
  }) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (appointment: AdminAppointmentItem) => {
    setSelectedAppointmentId(appointment.id);
    setDetailsModalOpen(true);
  };

  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Historico de Atendimentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize consultas finalizadas e canceladas
          </p>
        </div>

        {/* Filters */}
        <AdminAppointmentsFilters
          onFilterChange={handleFilterChange}
          specialties={specialties}
          statusOptions={[
            { value: '', label: 'Todos' },
            { value: 'FINISHED', label: 'Finalizadas' },
            { value: 'CANCELED', label: 'Canceladas' },
          ]}
        />

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={() => setError(null)} className="text-sm text-red-700 underline mt-1">
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
          <HistoryEmptyState hasFilters={hasFilters} />
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-4">
              {total} {total === 1 ? 'atendimento encontrado' : 'atendimentos encontrados'}
            </p>

            {/* Appointments grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.map((appointment) => (
                <AdminAppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onViewDetails={handleViewDetails}
                  isHistory
                />
              ))}
            </div>

            {/* Pagination */}
            <HistoryPagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* Details Modal */}
        <AdminAppointmentDetailsModal
          isOpen={detailsModalOpen}
          appointmentId={selectedAppointmentId}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedAppointmentId(null);
          }}
        />
      </div>
    </Layout>
  );
}
