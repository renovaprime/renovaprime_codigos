import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  UserPlus,
  CalendarCheck,
} from 'lucide-react';
import { Layout } from '../layout';
import { Card } from '../components';

const mockPendingDoctors = 12;
const mockScheduledAppointments = 48;

const stats = [
  {
    label: 'Medicos Ativos',
    value: '2,547',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
  },
  {
    label: 'Consultas Agendadas',
    value: String(mockScheduledAppointments),
    change: '+8.2%',
    trend: 'up',
    icon: Calendar,
  },
  {
    label: 'Medicos Pendentes',
    value: String(mockPendingDoctors),
    change: '+5.4%',
    trend: 'up',
    icon: UserPlus,
  },
  {
    label: 'Taxa de Conclusao',
    value: '94.8%',
    change: '+2.4%',
    trend: 'up',
    icon: CalendarCheck,
  },
];

const recentActivity = [
  { type: 'new_doctor', name: 'Dr. Carlos Silva', specialty: 'Cardiologia', time: '2 min' },
  { type: 'consultation', name: 'Maria Santos', doctor: 'Dra. Ana Paula', time: '5 min' },
  { type: 'new_doctor', name: 'Dra. Julia Costa', specialty: 'Pediatria', time: '12 min' },
  { type: 'consultation', name: 'Joao Oliveira', doctor: 'Dr. Pedro Lima', time: '18 min' },
];

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
      ease: 'easeOut' as any,
    },
  },
};

export function Dashboard() {
  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {stats.map((stat) => (
            <Card key={stat.label} interactive className="relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-accent">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="font-display text-3xl text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          <motion.div variants={itemVariants}>
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl text-foreground">Atividade Recente</h2>
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'new_doctor' ? 'bg-emerald-50' : 'bg-primary/10'
                    }`}>
                      {activity.type === 'new_doctor' ? (
                        <UserPlus className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Calendar className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.type === 'new_doctor'
                          ? activity.specialty
                          : `com ${activity.doctor}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-4 py-2.5 text-sm font-medium text-primary hover:text-primary-600 transition-colors">
                Ver toda atividade
              </button>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
}
