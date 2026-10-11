import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost' | 'outline';

const variants: Record<Variant, string> = {
  primary: 'bg-duo-green border-duo-green-dark text-white hover:brightness-110',
  secondary: 'bg-duo-blue border-duo-blue-dark text-white hover:brightness-110',
  danger: 'bg-duo-red border-duo-red-dark text-white hover:brightness-110',
  warning: 'bg-duo-yellow border-duo-yellow-dark text-duo-bg hover:brightness-110',
  ghost: 'bg-transparent border-transparent text-duo-blue hover:bg-white/5',
  outline: 'bg-duo-bg border-2 border-duo-border text-duo-text hover:bg-duo-surface',
};

interface DuoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export function DuoButton({ variant = 'primary', fullWidth, className, disabled, children, ...rest }: DuoButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'select-none rounded-2xl px-6 py-3 text-sm font-extrabold uppercase tracking-wider transition-all duration-100 sm:text-base',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30',
        disabled
          ? 'cursor-not-allowed border-b-4 border-duo-border bg-duo-border text-duo-muted'
          : cn('border-b-4 active:mb-1 active:translate-y-1 active:border-b-0', variants[variant]),
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
