import { Calendar, Clock, Video, User, Play, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import type { Appointment } from '../types/api';

interface DoctorConsultaCardProps {
  appointment: Appointment;
  onStart: (id: number) => void;
  onFinish: (id: number) => void;
  isLoading?: boolean;
}

export function DoctorConsultaCard({
  appointment,
  onStart,
  onFinish,
  isLoading = false
}: DoctorConsultaCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const getStatusVariant = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'IN_PROGRESS':
        return 'warning';
      case 'FINISHED':
        return 'success';
      case 'CANCELED':
        return 'error';
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

  const getPatientName = () => {
    if (appointment.patient?.User?.name) {
      return appointment.patient.User.name;
    }
    return 'Paciente';
  };

  const teleconsultRoom = appointment.TeleconsultRoom || appointment.teleconsult_room;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-4">
        {/* Header com especialidade e status */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {appointment.specialty?.name || 'Consulta'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(appointment.status)}>
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

        {/* Informacoes do paciente */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Paciente</p>
            <p className="font-medium text-foreground">{getPatientName()}</p>
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
              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </span>
          </div>
        </div>

        {/* Acoes */}
        <div className="flex items-center justify-end gap-2 pt-2">
          {appointment.status === 'SCHEDULED' && (
            <Button
              size="sm"
              onClick={() => onStart(appointment.id)}
              disabled={isLoading}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Iniciar Consulta
            </Button>
          )}

          {appointment.status === 'IN_PROGRESS' && (
            <>
              {appointment.type === 'ONLINE' && (
                <Link
                  to={`/profissional/teleconsulta/${appointment.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Entrar na Sala
                </Link>
              )}
              <Button
                size="sm"
                onClick={() => onFinish(appointment.id)}
                disabled={isLoading}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Finalizar
              </Button>
            </>
          )}

          {(appointment.status === 'FINISHED' || appointment.status === 'CANCELED') && (
            <span className="text-sm text-muted-foreground">
              {appointment.status === 'FINISHED' ? 'Consulta finalizada' : 'Consulta cancelada'}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
