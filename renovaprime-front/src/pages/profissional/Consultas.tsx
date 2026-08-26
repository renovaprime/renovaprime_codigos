import { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { LayoutProfissional } from '../../layout/LayoutProfissional';
import { PageHeader } from '../../components';
import { DoctorConsultaCard } from '../../components/DoctorConsultaCard';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmModal } from '../../components/ConfirmModal';
import { doctorAppointmentService, DoctorAppointmentFilters } from '../../services/doctorAppointmentService';
import type { Appointment } from '../../types/api';

type DateFilter = 'all' | 'today' | 'tomorrow' | 'week' | 'custom';

export function ProfissionalConsultas() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDate, setCustomDate] = useState<string>('');

  // Modal de confirmacao
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'start' | 'finish';
    id: number;
  } | null>(null);

  const getDateFilters = useCallback((): DoctorAppointmentFilters => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    switch (dateFilter) {
      case 'all':
        return {};
      case 'today':
        return { date: formatDate(today) };
      case 'tomorrow': {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { date: formatDate(tomorrow) };
      }
      case 'week': {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        return { from: formatDate(today), to: formatDate(endOfWeek) };
      }
      case 'custom':
        return customDate ? { date: customDate } : { date: formatDate(today) };
      default:
        return { date: formatDate(today) };
    }
  }, [dateFilter, customDate]);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = getDateFilters();
      const data = await doctorAppointmentService.listMyAppointments(filters);
      setAppointments(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar consultas';
      setError(message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [getDateFilters]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleStartAppointment = (id: number) => {
    setConfirmAction({ type: 'start', id });
    setShowConfirmModal(true);
  };

  const handleFinishAppointment = (id: number) => {
    setConfirmAction({ type: 'finish', id });
    setShowConfirmModal(true);
  };

  const confirmActionHandler = async () => {
    if (!confirmAction) return;

    setIsActionLoading(true);
    try {
      if (confirmAction.type === 'start') {
        await doctorAppointmentService.startAppointment(confirmAction.id);
      } else {
        await doctorAppointmentService.finishAppointment(confirmAction.id);
      }
      setShowConfirmModal(false);
      setConfirmAction(null);
      await loadAppointments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Erro ao ${confirmAction.type === 'start' ? 'iniciar' : 'finalizar'} consulta`;
      setError(message);
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getFilterLabel = () => {
    switch (dateFilter) {
      case 'all':
        return 'Todas';
      case 'today':
        return 'Hoje';
      case 'tomorrow':
        return 'Amanha';
      case 'week':
        return 'Proximos 7 dias';
      case 'custom':
        return customDate
          ? new Date(customDate + 'T00:00:00').toLocaleDateString('pt-BR')
          : 'Selecione uma data';
      default:
        return 'Hoje';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (dateFilter === 'custom' && customDate) {
      const current = new Date(customDate);
      current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
      setCustomDate(current.toISOString().split('T')[0]);
    } else if (dateFilter === 'today') {
      if (direction === 'next') {
        setDateFilter('tomorrow');
      }
    } else if (dateFilter === 'tomorrow') {
      if (direction === 'prev') {
        setDateFilter('today');
      }
    }
  };

  // Separar consultas por status
  const scheduledAppointments = appointments.filter(a => a.status === 'SCHEDULED');
  const inProgressAppointments = appointments.filter(a => a.status === 'IN_PROGRESS');
  const finishedAppointments = appointments.filter(a => a.status === 'FINISHED' || a.status === 'CANCELED');

  return (
    <LayoutProfissional title="Minhas Consultas">
      <div className="w-full mx-auto">
        <PageHeader
          title="Minhas Consultas"
          subtitle="Gerencie suas consultas agendadas."
          className="mb-6"
        />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center overflow-hidden rounded-xl border border-border bg-card">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                dateFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                dateFilter === 'today'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setDateFilter('tomorrow')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                dateFilter === 'tomorrow'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Amanha
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                dateFilter === 'week'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Semana
            </button>
          </div>

          <div className="relative">
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilter('custom');
              }}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Navegacao de data para hoje/amanha/custom */}
        {(dateFilter === 'today' || dateFilter === 'tomorrow' || dateFilter === 'custom') && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              disabled={dateFilter === 'today'}
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <span className="text-lg font-medium text-foreground">
              {getFilterLabel()}
            </span>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Mensagem de erro */}
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
          <EmptyState
            icon={Calendar}
            title="Nenhuma consulta encontrada"
            description={`Você não tem consultas ${
              dateFilter === 'all'
                ? 'cadastradas'
                : dateFilter === 'today'
                ? 'para hoje'
                : dateFilter === 'tomorrow'
                ? 'para amanhã'
                : 'neste período'
            }.`}
          />
        ) : (
          <div className="space-y-8">
            {/* Consultas em andamento */}
            {inProgressAppointments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  Em Andamento ({inProgressAppointments.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {inProgressAppointments.map((appointment) => (
                    <DoctorConsultaCard
                      key={appointment.id}
                      appointment={appointment}
                      onStart={handleStartAppointment}
                      onFinish={handleFinishAppointment}
                      isLoading={isActionLoading}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Consultas agendadas */}
            {scheduledAppointments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Agendadas ({scheduledAppointments.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scheduledAppointments.map((appointment) => (
                    <DoctorConsultaCard
                      key={appointment.id}
                      appointment={appointment}
                      onStart={handleStartAppointment}
                      onFinish={handleFinishAppointment}
                      isLoading={isActionLoading}
                    />
                  ))}
                </div>
              </div>
            )}

          
          </div>
        )}

        {/* Modal de confirmacao */}
        <ConfirmModal
          isOpen={showConfirmModal}
          title={confirmAction?.type === 'start' ? 'Iniciar Consulta' : 'Finalizar Consulta'}
          description={
            confirmAction?.type === 'start'
              ? 'Deseja iniciar esta consulta? O status sera alterado para "Em andamento".'
              : 'Deseja finalizar esta consulta? O status sera alterado para "Finalizada".'
          }
          confirmText={confirmAction?.type === 'start' ? 'Sim, iniciar' : 'Sim, finalizar'}
          cancelText="Cancelar"
          onConfirm={confirmActionHandler}
          onClose={() => {
            setShowConfirmModal(false);
            setConfirmAction(null);
          }}
          variant={confirmAction?.type === 'start' ? 'default' : 'default'}
        />
      </div>
    </LayoutProfissional>
  );
}
