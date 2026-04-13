import { Calendar, Clock, User, Video, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import type { AppointmentHistoryItem } from '../types/appointmentsHistory.types';

interface HistoryCardProps {
  appointment: AppointmentHistoryItem;
  viewType: 'doctor' | 'patient';
  onViewDetails?: (appointment: AppointmentHistoryItem) => void;
}

export function HistoryCard({ appointment, viewType, onViewDetails }: HistoryCardProps) {
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

  const formatDateTime = (dateTimeStr: string | null) => {
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

  const isFinished = appointment.status === 'FINISHED';
  const StatusIcon = isFinished ? CheckCircle : XCircle;
  const statusText = isFinished ? 'Finalizada' : 'Cancelada';
  const statusVariant = isFinished ? 'success' : 'error';
  const statusDate = isFinished ? appointment.finished_at : appointment.canceled_at;

  // Para o médico, mostrar o beneficiário. Para o paciente, mostrar o médico.
  const otherPartyName = viewType === 'doctor'
    ? appointment.beneficiary?.name
    : appointment.doctor?.name;

  const otherPartyLabel = viewType === 'doctor' ? 'Paciente' : 'Profissional';

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header with status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusText}
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
          <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
        </div>
      </div>

      {/* Other party info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{otherPartyLabel}</p>
          <p className="text-sm font-medium text-foreground">
            {otherPartyName || 'N/A'}
          </p>
        </div>
      </div>

      {/* Specialty */}
      {appointment.specialty && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">Especialidade</p>
          <p className="text-sm text-foreground">{appointment.specialty.name}</p>
        </div>
      )}

      {/* Status date */}
      {statusDate && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {isFinished ? 'Finalizada em:' : 'Cancelada em:'}
          </p>
          <p className="text-xs text-foreground">{formatDateTime(statusDate)}</p>
        </div>
      )}

      {/* View details button */}
      {onViewDetails && (
        <button
          onClick={() => onViewDetails(appointment)}
          className="mt-3 w-full py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Ver detalhes
        </button>
      )}
    </div>
  );
}
