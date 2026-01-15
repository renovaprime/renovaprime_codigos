import { History, Search, Download, Filter } from 'lucide-react';
import { Layout } from '../layout';
import { Card, EmptyState, Button, Input } from '../components';

export function Historico() {
  return (
    <Layout title="Historico de Atendimentos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-foreground">Historico de Atendimentos</h1>
            <p className="text-muted-foreground mt-1">Consulte o historico completo de atendimentos</p>
          </div>
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>

        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-3 p-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar no historico..."
                className="pl-10"
              />
            </div>
            <Input type="date" className="sm:w-40" />
            <Input type="date" className="sm:w-40" />
            <Button variant="secondary">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </Card>

        <Card>
          <EmptyState
            icon={History}
            title="Nenhum atendimento registrado"
            description="O historico de atendimentos sera exibido aqui conforme as consultas forem realizadas."
          />
        </Card>
      </div>
    </Layout>
  );
}
