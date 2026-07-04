import { MagneticButton } from '../motion/MagneticButton';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white border-accent hover:bg-accent-strong shadow-sm',
  secondary:
    'bg-surface-subtle text-text border-border hover:bg-surface-hover',
  ghost:
    'bg-transparent text-muted border-transparent hover:text-text hover:bg-surface-subtle',
  danger:
    'bg-danger-soft text-danger border-danger/30 hover:bg-danger-soft/80',
};

export function Button({ variant = 'ghost', children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 min-h-[40px] px-[14px] rounded-[10px] font-[650] text-sm border transition-colors duration-150';

  if (variant === 'primary') {
    return (
      <MagneticButton className={`${base} ${variantStyles[variant]} ${className}`} {...props}>
        {children}
      </MagneticButton>
    );
  }

  return (
    <button type="button" className={`${base} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
