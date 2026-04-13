import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from './Button';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string | React.ReactNode;
  actionText?: string;
  variant?: 'success' | 'info' | 'warning' | 'error';
}

const variantStyles = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    bg: 'bg-emerald-50 border-emerald-200',
    buttonVariant: 'primary' as const
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    bg: 'bg-blue-50 border-blue-200',
    buttonVariant: 'primary' as const
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    bg: 'bg-amber-50 border-amber-200',
    buttonVariant: 'primary' as const
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-500',
    bg: 'bg-red-50 border-red-200',
    buttonVariant: 'primary' as const
  }
};

export function InfoModal({
  isOpen,
  onClose,
  title,
  description,
  actionText = 'Entendi',
  variant = 'info'
}: InfoModalProps) {
  if (!isOpen) return null;

  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4 mb-6">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.bg} flex items-center justify-center`}>
            <IconComponent className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {title}
            </h2>
            <div className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant={styles.buttonVariant}
          onClick={onClose}
          className="w-full"
        >
          {actionText}
        </Button>
      </div>
    </div>
  );
}
