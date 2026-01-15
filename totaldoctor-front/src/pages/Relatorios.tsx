import { BarChart3, Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Layout } from '../layout';
import { Card, EmptyState, Button, Badge } from '../components';

export function Relatorios() {
  return (
    <Layout title="Relatorios">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-foreground">Relatorios</h1>
            <p className="text-muted-foreground mt-1">Analise metricas e gere relatorios detalhados</p>
          </div>
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            Exportar Relatorio
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, label: 'Desempenho Geral', description: 'Metricas de performance da plataforma', badge: 'Mensal' },
            { icon: Users, label: 'Medicos', description: 'Analise de cadastros e atividade', badge: 'Semanal' },
            { icon: Calendar, label: 'Consultas', description: 'Estatisticas de agendamentos', badge: 'Diario' },
            { icon: DollarSign, label: 'Financeiro', description: 'Relatorio financeiro completo', badge: 'Mensal' },
            { icon: BarChart3, label: 'Especialidades', description: 'Distribuicao por especialidade', badge: 'Trimestral' },
          ].map((report) => (
            <Card key={report.label} interactive className="cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-accent group-hover:shadow-accent-lg transition-shadow">
                  <report.icon className="w-6 h-6 text-white" />
                </div>
                <Badge>{report.badge}</Badge>
              </div>
              <h3 className="font-display text-lg text-foreground mb-1">{report.label}</h3>
              <p className="text-sm text-muted-foreground">{report.description}</p>
            </Card>
          ))}
        </div>

        <Card>
          <EmptyState
            icon={BarChart3}
            title="Selecione um relatorio"
            description="Escolha um dos relatorios acima para visualizar dados detalhados."
          />
        </Card>
      </div>
    </Layout>
  );
}
