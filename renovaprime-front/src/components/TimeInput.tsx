import { forwardRef, InputHTMLAttributes } from 'react';

interface TimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="time"
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-card border border-border
            text-foreground placeholder:text-muted-foreground
            transition-all duration-200 ease-out
            hover:border-primary/30
            focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

TimeInput.displayName = 'TimeInput';
