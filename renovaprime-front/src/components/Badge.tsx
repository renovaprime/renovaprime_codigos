import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  'data-cy'?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-muted text-muted-foreground',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  error: 'bg-red-50 text-red-600',
};

export function Badge({ variant = 'default', children, className = '', 'data-cy': dataCy }: BadgeProps) {
  return (
    <span
      data-cy={dataCy}
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-md
        text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
