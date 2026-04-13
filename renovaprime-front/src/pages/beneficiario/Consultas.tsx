import { useState, useEffect } from 'react';
import { Plus, Calendar, AlertCircle } from 'lucide-react';
import { LayoutBeneficiario } from '../../layout/LayoutBeneficiario';
import { Button } from '../../components/Button';
import { ConsultaCard } from '../../components/ConsultaCard';
import { AgendarConsultaModal } from '../../components/AgendarConsultaModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';
import { Card } from '../../components/Card';
import { appointmentService } from '../../services/appointmentService';
import type { Appointment } from '../../types/api';

export function BeneficiarioConsultas() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAgendarModal, setShowAgendarModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await appointmentService.listMyAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar consultas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    setSelectedAppointmentId(id);
    setShowCancelModal(true);
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointmentId) return;

    try {
      await appointmentService.cancelAppointment(selectedAppointmentId);
      setShowCancelModal(false);
      setSelectedAppointmentId(null);
      await loadAppointments();
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar consulta');
      console.error(err);
    }
  };

  const handleDetails = (id: number) => {
    // TODO: Implementar visualização de detalhes da consulta
    console.log('Ver detalhes da consulta:', id);
  };

  const handleAgendarSuccess = async () => {
    setShowAgendarModal(false);
    await loadAppointments();
  };

  const upcomingCount = appointments.filter((appointment) => appointment.status === 'SCHEDULED').length;
  const finishedCount = appointments.filter((appointment) => appointment.status === 'FINISHED').length;

  return (
    <LayoutBeneficiario title="Minhas Consultas">
      <div className="w-full mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">
                Minhas Consultas
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                Gerencie seus agendamentos e acompanhe seu historico de consultas.
              </p>
            </div>
            <Button onClick={() => setShowAgendarModal(true)} className="gap-2 self-start md:self-auto">
              <Plus className="h-5 w-5" />
              Agendar nova consulta
            </Button>
          </div>
        </div>

        {!isLoading && appointments.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="bg-gradient-to-br from-primary/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{appointments.length}</p>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Agendadas</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-700 dark:text-cyan-400">
                {upcomingCount}
              </p>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Finalizadas</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                {finishedCount}
              </p>
            </Card>
          </div>
        )}

        {error && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
              <h2 className="text-xl font-display text-foreground">Erro ao carregar consultas</h2>
              <p className="max-w-md text-sm text-muted-foreground">{error}</p>
              <Button onClick={loadAppointments}>Tentar novamente</Button>
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
            <EmptyState
              icon={Calendar}
              title="Nenhuma consulta agendada"
              description="Você ainda não tem consultas agendadas. Clique no botao acima para agendar sua primeira consulta."
              action={
                <Button onClick={() => setShowAgendarModal(true)} className="gap-2">
                  <Plus className="h-5 w-5" />
                  Agendar consulta
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {appointments.map((appointment) => (
              <ConsultaCard
                key={appointment.id}
                appointment={appointment}
                onCancel={handleCancelAppointment}
                onDetails={handleDetails}
              />
            ))}
          </div>
        )}

        <AgendarConsultaModal
          isOpen={showAgendarModal}
          onClose={() => setShowAgendarModal(false)}
          onSuccess={handleAgendarSuccess}
        />

        <ConfirmModal
          isOpen={showCancelModal}
          title="Cancelar Consulta"
          description="Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita."
          confirmText="Sim, cancelar"
          cancelText="Não, manter"
          onConfirm={confirmCancelAppointment}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedAppointmentId(null);
          }}
          variant="danger"
        />
      </div>
    </LayoutBeneficiario>
  );
}
