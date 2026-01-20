import { Calendar, Clock, Video, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import type { Appointment } from '../types/api';

interface ConsultaCardProps {
  appointment: Appointment;
  onCancel: (id: number) => void;
  onDetails: (id: number) => void;
}

export function ConsultaCard({ appointment, onCancel, onDetails }: ConsultaCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'FINISHED':
        return 'default';
      case 'CANCELED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Agendada';
      case 'IN_PROGRESS':
        return 'Em andamento';
      case 'FINISHED':
        return 'Finalizada';
      case 'CANCELED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-4">
        {/* Header com especialidade e status */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {appointment.specialty?.name || 'Especialidade'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(appointment.status)}>
              {getStatusLabel(appointment.status)}
            </Badge>
            {appointment.type === 'ONLINE' && (
              <Badge variant="default">
                <Video className="w-3 h-3 mr-1" />
                Online
              </Badge>
            )}
          </div>
        </div>

        {/* Informações do médico */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profissional</p>
            <p className="font-medium text-foreground">
              {appointment.doctor?.name || 'A confirmar'}
            </p>
          </div>
        </div>

        {/* Data e hora */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-2 text-foreground">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatDate(appointment.date)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatTime(appointment.start_time)}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col items-end justify-end w-full gap-2 pt-2">
          {appointment.status === 'IN_PROGRESS' && appointment.type === 'ONLINE' && (
            <Link
              to={`/beneficiario/teleconsulta/${appointment.id}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <Video className="w-4 h-4" />
              Entrar na Teleconsulta
            </Link>
          )}

          {appointment.status === 'SCHEDULED' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(appointment.id)}
              className="flex-1 border border-destructive text-destructive"
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
