import type { ReactNode } from 'react';

type PillProps = {
  children: ReactNode;
  className?: string;
};

export function Pill({ children, className = '' }: PillProps) {
  return (
    <span className={`inline-flex items-center min-h-[24px] rounded-full px-[9px] text-xs font-[650] border border-border bg-surface-subtle text-muted whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}
