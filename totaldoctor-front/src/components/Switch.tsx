import { motion } from 'framer-motion';
import { forwardRef } from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled = false, className = '' }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          disabled:opacity-50 disabled:pointer-events-none
          ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}
          ${className}
        `}
      >
        <motion.span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-colors duration-200 ease-in-out
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
          initial={false}
          animate={{
            x: checked ? 20 : 4,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';