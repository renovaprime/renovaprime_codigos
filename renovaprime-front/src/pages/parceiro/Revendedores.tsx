import { useState, useEffect } from 'react';
import { Users, Copy, Check } from 'lucide-react';
import { LayoutParceiro } from '../../layout/LayoutParceiro';
import { Card, EmptyState, Badge } from '../../components';
import { partnerAreaService } from '../../services/partnerAreaService';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import type { PartnerResellerItem } from '../../types/partner';

export function ParceiroRevendedores() {
  const { entity } = usePartnerAuth();
  const [resellers, setResellers] = useState<PartnerResellerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadResellers();
  }, []);

  const loadResellers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await partnerAreaService.getResellers();
      setResellers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar revendedores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (reseller: PartnerResellerItem) => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://renovaprime.com.br';
    const link = `${siteUrl}/?rev=${reseller.id}#planos`;
    navigator.clipboard.writeText(link);
    setCopiedId(reseller.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <LayoutParceiro title="Revendedores">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">Revendedores</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {entity?.type === 'partner'
                ? 'Todos os revendedores das suas filiais'
                : 'Revendedores da sua filial'}
            </p>
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
        ) : resellers.length === 0 ? (
          <Card>
            <EmptyState
              icon={Users}
              title="Nenhum revendedor encontrado"
              description="Não há revendedores cadastrados."
            />
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">CPF</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Telefone</th>
                    {entity?.type === 'partner' && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Filial</th>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {resellers.map((reseller) => (
                    <tr key={reseller.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{reseller.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{reseller.cpf}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{reseller.email || '-'}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{reseller.phone || '-'}</td>
                      {entity?.type === 'partner' && (
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {reseller.PartnerBranch?.name || '-'}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <Badge variant={reseller.active ? 'success' : 'default'}>
                          {reseller.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleCopyLink(reseller)}
                          title="Copiar link de vendas"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            copiedId === reseller.id
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          }`}
                        >
                          {copiedId === reseller.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Link de vendas
                            </>
                          )}
                        </button>
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
