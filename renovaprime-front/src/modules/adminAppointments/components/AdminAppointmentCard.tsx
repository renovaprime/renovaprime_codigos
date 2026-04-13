import { Calendar, Clock, User, Stethoscope, Video, MapPin, Play, CheckCircle, XCircle, AlertCircle, Eye, X } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import type { AdminAppointmentItem } from '../types/adminAppointments.types';

interface AdminAppointmentCardProps {
  appointment: AdminAppointmentItem;
  onViewDetails?: (appointment: AdminAppointmentItem) => void;
  onCancel?: (appointment: AdminAppointmentItem) => void;
  isHistory?: boolean;
}

export function AdminAppointmentCard({
  appointment,
  onViewDetails,
  onCancel,
  isHistory = false,
}: AdminAppointmentCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const formatDateTime = (dateTimeStr: string | null | undefined) => {
    if (!dateTimeStr) return null;
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
        return {
          variant: 'primary' as const,
          icon: Clock,
          label: 'Agendada',
        };
      case 'IN_PROGRESS':
        return {
          variant: 'warning' as const,
          icon: Play,
          label: 'Em andamento',
        };
      case 'FINISHED':
        return {
          variant: 'success' as const,
          icon: CheckCircle,
          label: 'Finalizada',
        };
      case 'CANCELED':
        return {
          variant: 'error' as const,
          icon: XCircle,
          label: 'Cancelada',
        };
      default:
        return {
          variant: 'default' as const,
          icon: AlertCircle,
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;
  const canCancel = appointment.status === 'SCHEDULED';

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header with status and type */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusConfig.variant}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
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
      </div>

      {/* Date and time */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-1.5 text-foreground">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{formatDate(appointment.date)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-foreground">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>
            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
          </span>
        </div>
      </div>

      {/* Doctor info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Profissional</p>
          <p className="text-sm font-medium text-foreground">
            {appointment.doctor?.name || 'N/A'}
          </p>
        </div>
      </div>

      {/* Beneficiary info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-secondary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Beneficiario</p>
          <p className="text-sm font-medium text-foreground">
            {appointment.beneficiary?.name || 'N/A'}
          </p>
          {appointment.beneficiary?.cpf && (
            <p className="text-xs text-muted-foreground">{appointment.beneficiary.cpf}</p>
          )}
        </div>
      </div>

      {/* Specialty */}
      {appointment.specialty && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">Especialidade</p>
          <p className="text-sm text-foreground">{appointment.specialty.name}</p>
        </div>
      )}

      {/* Status date for history */}
      {isHistory && (appointment.finished_at || appointment.canceled_at) && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {appointment.status === 'FINISHED' ? 'Finalizada em:' : 'Cancelada em:'}
          </p>
          <p className="text-xs text-foreground">
            {formatDateTime(appointment.finished_at || appointment.canceled_at)}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(appointment)}
            className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver detalhes
          </button>
        )}
        {onCancel && canCancel && (
          <button
            onClick={() => onCancel(appointment)}
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
