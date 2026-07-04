import { Notepad } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="grid place-items-center text-center min-h-[360px] border-2 border-dashed border-border-strong rounded-[22px] bg-surface/60 px-8 py-8">
      <div className="grid place-items-center w-[54px] h-[54px] rounded-[18px] bg-surface-subtle text-accent mb-3">
        <Notepad size={24} />
      </div>
      <h3 className="m-0 text-lg font-[650] tracking-tight text-text">{title}</h3>
      <p className="m-0 mt-1 text-sm text-muted max-w-[520px] leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
