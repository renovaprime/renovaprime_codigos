import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-accent">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-display text-foreground mb-2 text-center">
        {title}
      </h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
