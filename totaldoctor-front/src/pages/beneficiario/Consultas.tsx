import { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { LayoutBeneficiario } from '../../layout/LayoutBeneficiario';
import { Button } from '../../components/Button';
import { ConsultaCard } from '../../components/ConsultaCard';
import { AgendarConsultaModal } from '../../components/AgendarConsultaModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';
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

  return (
    <LayoutBeneficiario title="Minhas Consultas">
      <div className="max-w-6xl mx-auto">
        {/* Header com botão de ação */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Minhas Consultas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas consultas agendadas
            </p>
          </div>
          <Button
            onClick={() => setShowAgendarModal(true)}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Agendar nova consulta
          </Button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
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
            title="Nenhuma consulta agendada"
            description="Você ainda não tem consultas agendadas. Clique no botão acima para agendar sua primeira consulta."
            action={
              <Button
                onClick={() => setShowAgendarModal(true)}
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Agendar consulta
              </Button>
            }
          />
        ) : (
          /* Grid de consultas */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Modal de agendar consulta */}
        <AgendarConsultaModal
          isOpen={showAgendarModal}
          onClose={() => setShowAgendarModal(false)}
          onSuccess={handleAgendarSuccess}
        />

        {/* Modal de confirmação de cancelamento */}
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
