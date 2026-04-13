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
    blue: { card: 'from-primary/10', icon: 'bg-primary/15 text-primary' },
    green: { card: 'from-emerald-500/10', icon: 'bg-emerald-500/15 text-emerald-600' },
    yellow: { card: 'from-amber-500/10', icon: 'bg-amber-500/15 text-amber-600' },
    red: { card: 'from-red-500/10', icon: 'bg-red-500/15 text-red-600' },
    purple: { card: 'from-purple-500/10', icon: 'bg-purple-500/15 text-purple-600' },
    gray: { card: 'from-slate-500/10', icon: 'bg-slate-500/15 text-slate-600' },
    cyan: { card: 'from-cyan-500/10', icon: 'bg-cyan-500/15 text-cyan-600' },
  };

  return (
    <Card
      interactive={!!onClick}
      onClick={onClick}
      className={`${onClick ? 'cursor-pointer' : ''} bg-gradient-to-br ${colorClasses[color].card} via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm`}
    >
      <CardContent className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color].icon}`}>
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

  // Calcular taxa de conclusão
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
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">
                Dashboard
              </h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Visão geral da plataforma.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadDashboard}
              disabled={loading}
              className="self-start md:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </motion.div>

        {/* Cards principais */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            title="Médicos Aprovados"
            value={dashboard?.doctors.approved || 0}
            icon={Stethoscope}
            color="blue"
            onClick={() => navigate('/profissionais')}
          />
          <StatCard
            title="Médicos Pendentes"
            value={dashboard?.doctors.pending || 0}
            icon={UserPlus}
            color="yellow"
            onClick={() => navigate('/solicitacoes-pendentes')}
          />
          <StatCard
            title="Beneficiários Ativos"
            value={dashboard?.beneficiaries.active || 0}
            icon={Users}
            color="green"
            onClick={() => navigate('/beneficiarios')}
          />
          <StatCard
            title="Taxa de Conclusão"
            value={parseFloat(completionRate)}
            icon={TrendingUp}
            color="purple"
          />
        </motion.div>

        {/* Consultas de Hoje */}
        <motion.div variants={itemVariants}>
          <SectionCard title="Consultas de Hoje" icon={Calendar}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center rounded-xl bg-gradient-to-br from-primary/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
                <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-display font-semibold text-foreground">
                  {dashboard?.appointmentsToday.total || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="text-center rounded-xl bg-gradient-to-br from-amber-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
                <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-display font-semibold text-foreground">
                  {dashboard?.appointmentsToday.scheduled || 0}
                </p>
                <p className="text-sm text-muted-foreground">Agendadas</p>
              </div>
              <div className="text-center rounded-xl bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
                <PlayCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-display font-semibold text-foreground">
                  {dashboard?.appointmentsToday.inProgress || 0}
                </p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
              <div className="text-center rounded-xl bg-gradient-to-br from-slate-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
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
          className="grid grid-cols-1 gap-6"
        >


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

        </motion.div>

      </motion.div>
    </Layout>
  );
}
