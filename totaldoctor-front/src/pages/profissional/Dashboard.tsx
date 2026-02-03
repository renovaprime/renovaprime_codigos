import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutProfissional } from '../../layout/LayoutProfissional';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { doctorAppointmentService } from '../../services/doctorAppointmentService';
import type { DoctorDashboard, DoctorDashboardAppointment } from '../../types/api';
import {
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  Video,
  User,
  Stethoscope,
  Phone,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

function StatCard({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'yellow' | 'green' | 'gray';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    gray: 'bg-gray-50 text-gray-600'
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentCard({
  appointment,
  type,
  onStartTeleconsult
}: {
  appointment: DoctorDashboardAppointment;
  type: 'current' | 'next';
  onStartTeleconsult?: () => void;
}) {
  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <Card className={type === 'current' ? 'border-primary/30 bg-primary/5' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {type === 'current' ? (
              <>
                <PlayCircle className="w-5 h-5 text-primary" />
                Consulta em Andamento
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-muted-foreground" />
                Proxima Consulta
              </>
            )}
          </CardTitle>
          {type === 'current' && appointment.type === 'ONLINE' && appointment.teleconsultRoom && (
            <Button size="sm" onClick={onStartTeleconsult}>
              <Video className="w-4 h-4" />
              Entrar na Sala
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {appointment.beneficiary?.name || 'Paciente nao informado'}
              </p>
              {appointment.beneficiary?.phone && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {appointment.beneficiary.phone}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {isToday(appointment.date) ? 'Hoje' : formatDate(appointment.date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </span>
            </div>
            {appointment.specialty && (
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <Stethoscope className="w-4 h-4" />
                <span>{appointment.specialty.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              ${appointment.type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}
            `}>
              {appointment.type === 'ONLINE' ? (
                <>
                  <Video className="w-3 h-3" />
                  Teleconsulta
                </>
              ) : (
                'Presencial'
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfissionalDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DoctorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await doctorAppointmentService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    // Atualiza a cada 30 segundos
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTeleconsult = () => {
    if (dashboard?.currentAppointment?.id) {
      navigate(`/profissional/teleconsulta/${dashboard.currentAppointment.id}`);
    }
  };

  if (loading && !dashboard) {
    return (
      <LayoutProfissional title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      </LayoutProfissional>
    );
  }

  if (error && !dashboard) {
    return (
      <LayoutProfissional title="Dashboard">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center text-center py-8">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-foreground font-medium mb-2">Erro ao carregar dashboard</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadDashboard}>
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </LayoutProfissional>
    );
  }

  return (
    <LayoutProfissional title="Dashboard">
      <div className="space-y-6">
        {/* Header com refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-foreground">
              Bem-vindo!
            </h1>
            <p className="text-muted-foreground">
              Acompanhe suas consultas de hoje
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Estatisticas do dia */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Hoje"
            value={dashboard?.today.total || 0}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Agendadas"
            value={dashboard?.today.scheduled || 0}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Em Andamento"
            value={dashboard?.today.inProgress || 0}
            icon={PlayCircle}
            color="green"
          />
          <StatCard
            title="Finalizadas"
            value={dashboard?.today.finished || 0}
            icon={CheckCircle}
            color="gray"
          />
        </div>

        {/* Consulta em andamento */}
        {dashboard?.currentAppointment && (
          <AppointmentCard
            appointment={dashboard.currentAppointment}
            type="current"
            onStartTeleconsult={handleStartTeleconsult}
          />
        )}

        {/* Proxima consulta */}
        {dashboard?.nextAppointment && (
          <AppointmentCard
            appointment={dashboard.nextAppointment}
            type="next"
          />
        )}

        {/* Estado vazio */}
        {!dashboard?.currentAppointment && !dashboard?.nextAppointment && dashboard?.today.total === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-display text-foreground mb-2">
                Nenhuma consulta hoje
              </h3>
              <p className="text-muted-foreground max-w-md">
                Voce nao tem consultas agendadas para hoje. Aproveite para revisar sua agenda ou verificar suas configuracoes.
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => navigate('/profissional/agenda')}
              >
                Ver Agenda
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Apenas proxima consulta quando nao tem nada em andamento */}
        {!dashboard?.currentAppointment && !dashboard?.nextAppointment && dashboard?.today.total > 0 && (
          <Card>
            <CardContent className="flex flex-col items-center text-center py-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-display text-foreground mb-2">
                Todas as consultas de hoje foram finalizadas
              </h3>
              <p className="text-muted-foreground">
                Bom trabalho! Voce completou {dashboard.today.finished} consulta(s) hoje.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutProfissional>
  );
}
