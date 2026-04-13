import { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen && (beneficiaryId || patientId)) {
      loadPrescriptions();
    }
  }, [isOpen, beneficiaryId, patientId]);

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
    if (!isLoading) {
      onClose();
    }
  };

  const handleViewPrescription = async (prescriptionId: number) => {
    try {
      await memed.viewPrescription(prescriptionId);
    } catch (err) {
      console.error('Erro ao abrir receita:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Receitas</h2>
            <p className="text-sm text-muted-foreground mt-1">{patientName}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <Card
                  key={prescription.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewPrescription(prescription.memed_prescription_id)}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-foreground">
                            Receita #{prescription.id}
                          </p>
                        </div>
                        {prescription.appointment.specialty && (
                          <p className="text-xs text-muted-foreground">
                            {prescription.appointment.specialty.name}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={prescription.signed ? 'success' : 'secondary'}
                        className="flex items-center gap-1"
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
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Data da Consulta</p>
                        <p className="text-sm text-foreground">
                          {formatDate(prescription.appointment.date)} às{' '}
                          {formatTime(prescription.appointment.start_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Data de Emissão</p>
                        <p className="text-sm text-foreground">
                          {formatDateTime(prescription.issued_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
