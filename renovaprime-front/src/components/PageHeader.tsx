import { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  leading?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  leading,
  className = '',
}: PageHeaderProps) {
  const padding = actions
    ? 'px-6 py-5 md:px-8 md:py-6'
    : 'px-6 py-4 md:px-8 md:py-5';

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border/50 bg-card ${padding} ${className}`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-3xl bg-gradient-primary" />

      <div className="relative">
        {leading && <div className={actions || subtitle ? 'mb-4' : 'mb-3'}>{leading}</div>}

        <div
          className={
            actions
              ? 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'
              : undefined
          }
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground md:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-muted-foreground md:text-base">{subtitle}</p>
            )}
          </div>

          {actions && (
            <div className="flex flex-col gap-2 self-start sm:flex-row sm:flex-wrap sm:items-center sm:self-auto">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
