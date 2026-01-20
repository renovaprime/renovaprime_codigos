import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Video,
  MapPin,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Play,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { adminAppointmentsService } from '../services/adminAppointmentsService';
import type { AdminAppointmentDetails, AdminAppointmentLog } from '../types/adminAppointments.types';

interface AdminAppointmentDetailsModalProps {
  isOpen: boolean;
  appointmentId: number | null;
  onClose: () => void;
}

export function AdminAppointmentDetailsModal({
  isOpen,
  appointmentId,
  onClose,
}: AdminAppointmentDetailsModalProps) {
  const [appointment, setAppointment] = useState<AdminAppointmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      loadAppointment();
    } else {
      setAppointment(null);
      setError(null);
    }
  }, [isOpen, appointmentId]);

  const loadAppointment = async () => {
    if (!appointmentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await adminAppointmentsService.getById(appointmentId);
      setAppointment(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar detalhes';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return { variant: 'primary' as const, icon: Clock, label: 'Agendada' };
      case 'IN_PROGRESS':
        return { variant: 'warning' as const, icon: Play, label: 'Em andamento' };
      case 'FINISHED':
        return { variant: 'success' as const, icon: CheckCircle, label: 'Finalizada' };
      case 'CANCELED':
        return { variant: 'error' as const, icon: XCircle, label: 'Cancelada' };
      default:
        return { variant: 'default' as const, icon: AlertCircle, label: status };
    }
  };

  const getLogActionLabel = (action: AdminAppointmentLog['action']) => {
    switch (action) {
      case 'CREATED':
        return 'Consulta criada';
      case 'STARTED':
        return 'Consulta iniciada';
      case 'FINISHED':
        return 'Consulta finalizada';
      case 'CANCELED':
        return 'Consulta cancelada';
      default:
        return action;
    }
  };

  const getLogActionColor = (action: AdminAppointmentLog['action']) => {
    switch (action) {
      case 'CREATED':
        return 'bg-blue-500';
      case 'STARTED':
        return 'bg-amber-500';
      case 'FINISHED':
        return 'bg-emerald-500';
      case 'CANCELED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card rounded-2xl shadow-elevated-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-display font-semibold text-foreground">
                  Detalhes da Consulta
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                    <button
                      onClick={loadAppointment}
                      className="mt-4 text-sm text-primary hover:underline"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : appointment ? (
                  <div className="space-y-6">
                    {/* Status and Type */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {(() => {
                        const statusConfig = getStatusConfig(appointment.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <Badge variant={statusConfig.variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        );
                      })()}
                      <Badge variant={appointment.type === 'ONLINE' ? 'primary' : 'default'}>
                        {appointment.type === 'ONLINE' ? (
                          <>
                            <Video className="w-3 h-3 mr-1" />
                            Online
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3 mr-1" />
                            Presencial
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Date and Time */}
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span className="font-medium">{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="font-medium">
                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Doctor */}
                    <div className="border border-border rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Profissional</p>
                          <p className="font-medium text-foreground">
                            {appointment.doctor?.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                      {appointment.doctor?.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {appointment.doctor.email}
                        </div>
                      )}
                    </div>

                    {/* Beneficiary */}
                    <div className="border border-border rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Beneficiario</p>
                          <p className="font-medium text-foreground">
                            {appointment.beneficiary?.name || 'N/A'}
                          </p>
                          {appointment.beneficiary?.cpf && (
                            <p className="text-xs text-muted-foreground">
                              CPF: {appointment.beneficiary.cpf}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {appointment.beneficiary?.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {appointment.beneficiary.email}
                          </div>
                        )}
                        {appointment.beneficiary?.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            {appointment.beneficiary.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Specialty */}
                    {appointment.specialty && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Especialidade</p>
                          <p className="font-medium text-foreground">{appointment.specialty.name}</p>
                        </div>
                      </div>
                    )}

                    {/* Timeline / Logs */}
                    {appointment.logs && appointment.logs.length > 0 && (
                      <div className="border border-border rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-4">
                          Historico de acoes
                        </h3>
                        <div className="relative">
                          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
                          <div className="space-y-4">
                            {appointment.logs.map((log) => (
                              <div key={log.id} className="relative pl-8">
                                <div
                                  className={`absolute left-0 top-1 w-4 h-4 rounded-full ${getLogActionColor(
                                    log.action
                                  )} border-2 border-card`}
                                />
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {getLogActionLabel(log.action)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDateTime(log.created_at)}
                                    {log.performed_by && ` por ${log.performed_by.name}`}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Criado em: {formatDateTime(appointment.created_at)}</p>
                      <p>Atualizado em: {formatDateTime(appointment.updated_at)}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
