import { LayoutProfissional } from '../../layout/LayoutProfissional';
import { Card } from '../../components/Card';
import { Construction } from 'lucide-react';

export function ProfissionalReceitas() {
  return (
    <LayoutProfissional title="Receitas">
      <div className="max-w-4xl mx-auto">
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Construction className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display text-foreground">
              Receitas em Construção
            </h2>
            <p className="text-muted-foreground max-w-md">
              Esta página está sendo desenvolvida. Em breve você poderá criar e 
              gerenciar receitas médicas digitais.
            </p>
          </div>
        </Card>
      </div>
    </LayoutProfissional>
  );
}
