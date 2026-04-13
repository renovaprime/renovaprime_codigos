import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { LayoutParceiro } from '../../layout/LayoutParceiro';
import { Card, EmptyState, Badge } from '../../components';
import { partnerAreaService } from '../../services/partnerAreaService';
import type { PartnerBranchItem } from '../../types/partner';

export function ParceiroFiliais() {
  const [branches, setBranches] = useState<PartnerBranchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await partnerAreaService.getBranches();
      setBranches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar filiais');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutParceiro title="Filiais">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">Filiais</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">Lista de filiais vinculadas ao parceiro.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        {isLoading ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        ) : branches.length === 0 ? (
          <Card>
            <EmptyState
              icon={Building2}
              title="Nenhuma filial encontrada"
              description="Não há filiais cadastradas para este parceiro."
            />
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Apelido</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Endereço</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Revendedores</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr key={branch.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{branch.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{branch.alias || '-'}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{branch.email}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{branch.address || '-'}</td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">{branch.resellerCount}</td>
                      <td className="py-3 px-4">
                        <Badge variant={branch.active ? 'success' : 'default'}>
                          {branch.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </LayoutParceiro>
  );
}
