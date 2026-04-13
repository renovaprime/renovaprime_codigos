import { motion } from 'framer-motion';
import { History } from 'lucide-react';

interface HistoryEmptyStateProps {
  hasFilters?: boolean;
}

export function HistoryEmptyState({ hasFilters = false }: HistoryEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-accent">
        <History className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-display text-foreground mb-2 text-center">
        {hasFilters ? 'Nenhum resultado encontrado' : 'Nenhuma consulta no historico'}
      </h3>
      <p className="text-muted-foreground text-center max-w-sm">
        {hasFilters
          ? 'Tente ajustar os filtros para encontrar o que procura.'
          : 'As consultas finalizadas ou canceladas aparecerao aqui.'}
      </p>
    </motion.div>
  );
}
