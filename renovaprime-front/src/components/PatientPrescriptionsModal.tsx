import { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { EmptyState } from './EmptyState';
import { useMemed } from '../hooks/useMemed';
import { doctorPrescriptionService } from '../services/doctorPrescriptionService';
import type { PrescriptionWithAppointment } from '../types/api';

interface PatientPrescriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  beneficiaryId?: number | null;
  patientId?: number | null;
}

export function PatientPrescriptionsModal({
  isOpen,
  onClose,
  patientName,
  beneficiaryId,
  patientId
}: PatientPrescriptionsModalProps) {
  const memed = useMemed();
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewingPrescription, setIsViewingPrescription] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [lastViewedPrescriptionId, setLastViewedPrescriptionId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && (beneficiaryId || patientId)) {
      loadPrescriptions();
    }
  }, [isOpen, beneficiaryId, patientId]);

  useEffect(() => {
    if (!isOpen) {
      setIsViewingPrescription(false);
      setViewError(null);
      setLastViewedPrescriptionId(null);
    }
  }, [isOpen]);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorPrescriptionService.listPrescriptionsByPatient(
        beneficiaryId,
        patientId
      );
      setPrescriptions(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar receitas';
      setError(message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const handleClose = () => {
    if (!isLoading && !isViewingPrescription) {
      onClose();
    }
  };

  const handleViewPrescription = async (prescriptionId: number) => {
    if (isViewingPrescription) return;

    setIsViewingPrescription(true);
    setViewError(null);
    setLastViewedPrescriptionId(prescriptionId);

    try {
      await memed.viewPrescription(prescriptionId);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Não foi possível carregar a receita. Tente novamente.';
      setViewError(message);
      console.error('Erro ao abrir receita:', err);
    } finally {
      setIsViewingPrescription(false);
    }
  };

  const handleRetryViewPrescription = () => {
    if (lastViewedPrescriptionId !== null) {
      handleViewPrescription(lastViewedPrescriptionId);
    }
  };

  if (!isOpen) return null;

  const isInteractionBlocked = isLoading || isViewingPrescription;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden={isViewingPrescription}
      />

      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Receitas do paciente: {patientName}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isInteractionBlocked}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative p-6">
          {isViewingPrescription && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-b-2xl">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="mt-4 text-sm font-medium text-foreground">Carregando receita...</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Erro ao carregar receitas</h3>
              <p className="text-muted-foreground max-w-md">{error}</p>
              <button
                onClick={loadPrescriptions}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                Tentar novamente
              </button>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={FileText}
                title="Nenhuma receita emitida"
                description="Este paciente não possui receitas emitidas ainda."
              />
            </div>
          ) : (
            <div className={isViewingPrescription ? 'pointer-events-none' : undefined}>
              {viewError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">
                        Não foi possível carregar a receita
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{viewError}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={handleRetryViewPrescription}
                          disabled={isViewingPrescription}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50"
                        >
                          Tentar novamente
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewError(null)}
                          disabled={isViewingPrescription}
                          className="px-3 py-1.5 bg-card border border-border text-foreground rounded-lg hover:bg-muted/50 transition-colors font-medium text-sm disabled:opacity-50"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-card">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Receita
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Especialidade
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Consulta
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Emissão
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((prescription) => (
                        <tr
                          key={prescription.id}
                          onClick={() => {
                            if (!isViewingPrescription) {
                              handleViewPrescription(prescription.memed_prescription_id);
                            }
                          }}
                          className={`border-b border-border last:border-b-0 transition-colors ${
                            isViewingPrescription
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-muted/30 cursor-pointer'
                          }`}
                        >
                          <td className="px-6 py-4 text-sm text-foreground font-medium">
                            #{prescription.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            {prescription.appointment.specialty?.name || '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            {formatDate(prescription.appointment.date)} às{' '}
                            {formatTime(prescription.appointment.start_time)}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            {formatDateTime(prescription.issued_at)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge
                              variant={prescription.signed ? 'success' : 'secondary'}
                              className="inline-flex items-center gap-1"
                            >
                              {prescription.signed ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Assinada
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  Pendente
                                </>
                              )}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
