import { Handshake, Plus } from 'lucide-react';
import { Layout } from '../layout';
import { Card, EmptyState, Button } from '../components';

export function Parceiros() {
  return (
    <Layout title="Parceiros">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-foreground">Parceiros</h1>
            <p className="text-muted-foreground mt-1">Gerencie parcerias e integrações</p>
          </div>
          <Button>
            <Plus className="w-4 h-4" />
            Novo Parceiro
          </Button>
        </div>

        <Card>
          <EmptyState
            icon={Handshake}
            title="Nenhum parceiro cadastrado"
            description="Adicione parceiros para começar a gerenciar suas integrações e colaborações."
            action={
              <Button variant="secondary">
                <Plus className="w-4 h-4" />
                Adicionar Parceiro
              </Button>
            }
          />
        </Card>
      </div>
    </Layout>
  );
}
