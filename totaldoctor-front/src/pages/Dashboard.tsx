import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  XCircle,
  Video,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Layout } from '../layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { adminDashboardService } from '../services/adminDashboardService';
import type { AdminDashboard } from '../types/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  onClick
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'cyan';
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600',
    cyan: 'bg-cyan-50 text-cyan-600'
  };

  return (
    <Card
      interactive={!!onClick}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <CardContent className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-semibold text-foreground">
            {value.toLocaleString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

function MetricRow({
  label,
  value,
  icon: Icon,
  color
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-medium text-foreground">{value.toLocaleString('pt-BR')}</span>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    // Atualiza a cada 60 segundos
    const interval = setInterval(loadDashboard, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !dashboard) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error && !dashboard) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  // Calcular taxa de conclusao
  const completionRate = dashboard && dashboard.appointments.total > 0
    ? ((dashboard.appointments.finished / dashboard.appointments.total) * 100).toFixed(1)
    : '0';

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Visao geral da plataforma
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
        </motion.div>

        {/* Cards principais */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            title="Medicos Aprovados"
            value={dashboard?.doctors.approved || 0}
            icon={Stethoscope}
            color="blue"
            onClick={() => navigate('/admin/profissionais')}
          />
          <StatCard
            title="Medicos Pendentes"
            value={dashboard?.doctors.pending || 0}
            icon={UserPlus}
            color="yellow"
            onClick={() => navigate('/admin/profissionais/pendentes')}
          />
          <StatCard
            title="Beneficiarios Ativos"
            value={dashboard?.beneficiaries.active || 0}
            icon={Users}
            color="green"
            onClick={() => navigate('/admin/beneficiarios')}
          />
          <StatCard
            title="Taxa de Conclusao"
            value={parseFloat(completionRate)}
            icon={TrendingUp}
            color="purple"
          />
        </motion.div>

        {/* Consultas de Hoje */}
        <motion.div variants={itemVariants}>
          <SectionCard title="Consultas de Hoje" icon={Calendar}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-display font-semibold text-foreground">
                  {dashboard?.appointmentsToday.total || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-display font-semibold text-foreground">
                  {dashboard?.appointmentsToday.scheduled || 0}
                </p>
                <p className="text-sm text-muted-foreground">Agendadas</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <PlayCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-display font-semibold text-foreground">
                  {dashboard?.appointmentsToday.inProgress || 0}
                </p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-display font-semibold text-foreground">
                  {dashboard?.appointmentsToday.finished || 0}
                </p>
                <p className="text-sm text-muted-foreground">Finalizadas</p>
              </div>
            </div>
          </SectionCard>
        </motion.div>

        {/* Grid com 3 colunas */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Usuarios */}
          <SectionCard title="Usuarios" icon={Users}>
            <div className="space-y-1 divide-y divide-border">
              <MetricRow
                label="Ativos"
                value={dashboard?.users.active || 0}
                icon={UserCheck}
                color="text-green-500"
              />
              <MetricRow
                label="Pendentes"
                value={dashboard?.users.pending || 0}
                icon={Clock}
                color="text-yellow-500"
              />
              <MetricRow
                label="Bloqueados"
                value={dashboard?.users.blocked || 0}
                icon={UserX}
                color="text-red-500"
              />
            </div>
          </SectionCard>

          {/* Consultas Gerais */}
          <SectionCard title="Consultas (Total)" icon={Activity}>
            <div className="space-y-1 divide-y divide-border">
              <MetricRow
                label="Total"
                value={dashboard?.appointments.total || 0}
                icon={Calendar}
                color="text-blue-500"
              />
              <MetricRow
                label="Agendadas"
                value={dashboard?.appointments.scheduled || 0}
                icon={Clock}
                color="text-yellow-500"
              />
              <MetricRow
                label="Finalizadas"
                value={dashboard?.appointments.finished || 0}
                icon={CheckCircle}
                color="text-green-500"
              />
              <MetricRow
                label="Canceladas"
                value={dashboard?.appointments.canceled || 0}
                icon={XCircle}
                color="text-red-500"
              />
            </div>
          </SectionCard>

          {/* Teleconsultas */}
          <SectionCard title="Teleconsultas" icon={Video}>
            <div className="space-y-1 divide-y divide-border">
              <MetricRow
                label="Em Andamento"
                value={dashboard?.teleconsults.active || 0}
                icon={PlayCircle}
                color="text-green-500"
              />
              <MetricRow
                label="Finalizadas"
                value={dashboard?.teleconsults.finished || 0}
                icon={CheckCircle}
                color="text-gray-500"
              />
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigate('/historico')}
              >
                Ver Todas as Consultas
              </Button>
            </div>
          </SectionCard>
        </motion.div>

        {/* Resumo de Medicos e Beneficiarios */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Medicos */}
          <SectionCard title="Profissionais de Saude" icon={Stethoscope}>
            <div className="space-y-1 divide-y divide-border">
              <MetricRow
                label="Total Cadastrados"
                value={dashboard?.doctors.total || 0}
                icon={Users}
                color="text-blue-500"
              />
              <MetricRow
                label="Aprovados"
                value={dashboard?.doctors.approved || 0}
                icon={UserCheck}
                color="text-green-500"
              />
              <MetricRow
                label="Aguardando Aprovacao"
                value={dashboard?.doctors.pending || 0}
                icon={Clock}
                color="text-yellow-500"
              />
            </div>
            {dashboard && dashboard.doctors.pending > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/admin/profissionais/pendentes')}
                >
                  <UserPlus className="w-4 h-4" />
                  Aprovar Profissionais ({dashboard.doctors.pending})
                </Button>
              </div>
            )}
          </SectionCard>

          {/* Beneficiarios */}
          <SectionCard title="Beneficiarios" icon={Users}>
            <div className="space-y-1 divide-y divide-border">
              <MetricRow
                label="Ativos"
                value={dashboard?.beneficiaries.active || 0}
                icon={UserCheck}
                color="text-green-500"
              />
              <MetricRow
                label="Inativos"
                value={dashboard?.beneficiaries.inactive || 0}
                icon={UserX}
                color="text-gray-500"
              />
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigate('/beneficiarios')}
              >
                Gerenciar Beneficiarios
              </Button>
            </div>
          </SectionCard>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
