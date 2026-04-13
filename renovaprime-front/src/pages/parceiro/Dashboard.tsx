import { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, CheckCircle, Clock, Building2, Users, AlertCircle, Link, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { LayoutParceiro } from '../../layout/LayoutParceiro';
import { Card } from '../../components';
import { partnerAreaService } from '../../services/partnerAreaService';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import type { PartnerDashboard as PartnerDashboardData } from '../../types/partner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ParceiroDashboard() {
  const { entity } = usePartnerAuth();
  const [dashboard, setDashboard] = useState<PartnerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await partnerAreaService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const getEntityLabel = () => {
    switch (entity?.type) {
      case 'partner': return 'Parceiro';
      case 'branch': return 'Filial';
      case 'reseller': return 'Revendedor';
      default: return '';
    }
  };

  const getSalesLink = () => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://site.renovaprime.com.br';
    return `${siteUrl}/?rev=${entity?.id}#planos`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getSalesLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <LayoutParceiro title="Dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </LayoutParceiro>
    );
  }

  if (error) {
    return (
      <LayoutParceiro title="Dashboard">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-600">{error}</p>
          <button onClick={loadDashboard} className="text-primary hover:underline text-sm">
            Tentar novamente
          </button>
        </div>
      </LayoutParceiro>
    );
  }

  return (
    <LayoutParceiro title="Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">
              Olá, {entity?.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {getEntityLabel()} — Resumo geral das suas vendas e comissões.
            </p>
          </div>
        </motion.div>

        {entity?.type === 'reseller' && (
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Link className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">Meu Link de Vendas</p>
                    <p className="text-xs text-muted-foreground truncate">{getSalesLink()}</p>
                  </div>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                    copied
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar link
                    </>
                  )}
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {dashboard && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-primary/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Vendas</p>
                      <p className="text-xl font-semibold text-foreground">{dashboard.totalSales}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-xl font-semibold text-foreground">{formatCurrency(dashboard.totalValue)}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-purple-500/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Minha Comissão</p>
                      <p className="text-xl font-semibold text-foreground">{formatCurrency(dashboard.totalCommission)}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confirmadas</p>
                      <p className="text-xl font-semibold text-foreground">{dashboard.confirmedCount}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-amber-500/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                      <p className="text-xl font-semibold text-foreground">{dashboard.pendingCount}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {dashboard.branchCount !== undefined && (
                <motion.div variants={itemVariants}>
                  <Card className="bg-gradient-to-br from-blue-500/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Filiais</p>
                        <p className="text-xl font-semibold text-foreground">{dashboard.branchCount}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {dashboard.resellerCount !== undefined && (
                <motion.div variants={itemVariants}>
                  <Card className="bg-gradient-to-br from-indigo-500/10 via-card/90 to-secondary/10 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Revendedores</p>
                        <p className="text-xl font-semibold text-foreground">{dashboard.resellerCount}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </LayoutParceiro>
  );
}
