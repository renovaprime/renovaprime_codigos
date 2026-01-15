import { Calendar, Plus, Search, Filter, CalendarDays } from 'lucide-react';
import { Layout } from '../layout';
import { Card, EmptyState, Button, Input, Badge } from '../components';

export function Consultas() {
  return (
    <Layout title="Consultas">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-foreground">Consultas</h1>
            <p className="text-muted-foreground mt-1">Gerencie agendamentos e consultas</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="primary">Hoje: 0</Badge>
            <Button>
              <Plus className="w-4 h-4" />
              Nova Consulta
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Agendadas', value: '0', color: 'bg-primary' },
            { label: 'Em andamento', value: '0', color: 'bg-amber-400' },
            { label: 'Concluidas', value: '0', color: 'bg-emerald-500' },
            { label: 'Canceladas', value: '0', color: 'bg-red-400' },
          ].map((stat) => (
            <Card key={stat.label} interactive>
              <div className="flex items-center gap-3">
                <div className={`w-1 h-12 rounded-full ${stat.color}`} />
                <div>
                  <p className="text-2xl font-display text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-3 p-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente, medico ou data..."
                className="pl-10"
              />
            </div>
            <Button variant="secondary">
              <CalendarDays className="w-4 h-4" />
              Selecionar Data
            </Button>
            <Button variant="secondary">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </Card>

        <Card>
          <EmptyState
            icon={Calendar}
            title="Nenhuma consulta encontrada"
            description="Consultas agendadas e realizadas aparecerão aqui."
            action={
              <Button variant="secondary">
                <Plus className="w-4 h-4" />
                Agendar Consulta
              </Button>
            }
          />
        </Card>
      </div>
    </Layout>
  );
}
