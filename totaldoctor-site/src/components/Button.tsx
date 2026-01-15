import { ButtonHTMLAttributes, ReactNode } from 'react';
import { siteConfig } from '../config/content';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantStyles = {
    primary: {
      backgroundColor: siteConfig.colors.cta,
      color: 'white',
    },
    secondary: {
      backgroundColor: siteConfig.colors.secondary,
      color: 'white',
    },
    outline: {
      backgroundColor: 'transparent',
      color: siteConfig.colors.primary,
      border: `2px solid ${siteConfig.colors.primary}`,
    },
  };

  return (
    <button
      className={`${sizeClasses[size]} font-semibold rounded-lg transition-all hover:scale-105 shadow-md ${className}`}
      style={variantStyles[variant]}
      {...props}
    >
      {children}
    </button>
  );
}
