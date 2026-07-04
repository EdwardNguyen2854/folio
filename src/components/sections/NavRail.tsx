import { Files, FileText, ArrowsLeftRight, GearSix, Plus, GitBranch } from '@phosphor-icons/react';
import type { ViewMode } from '../../types';

type NavRailProps = {
  view: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onCreate: () => void;
};

const navItems: { id: ViewMode; label: string; icon: typeof Files }[] = [
  { id: 'workflows', label: 'Workflows', icon: GitBranch },
  { id: 'library', label: 'Library', icon: Files },
  { id: 'detail', label: 'Detail', icon: FileText },
  { id: 'compare', label: 'Compare', icon: ArrowsLeftRight },
  { id: 'settings', label: 'Settings', icon: GearSix },
];

export function NavRail({ view, onNavigate, onCreate }: NavRailProps) {
  return (
    <nav className="sticky top-0 h-screen w-[72px] flex flex-col items-center gap-3 py-5 border-r border-border bg-surface/85 backdrop-blur-md z-10">
      <div className="flex items-center justify-center w-[42px] h-[42px] rounded-[14px] bg-accent text-white font-[800] text-lg shadow-sm mb-2">
        F
      </div>

      <div className="flex flex-col items-center gap-1 flex-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center gap-1 w-[60px] py-2 rounded-[10px] border border-transparent text-xs font-medium transition-colors duration-150 cursor-pointer ${
              view === id
                ? 'bg-surface-subtle text-text border-border'
                : 'text-muted hover:text-text hover:bg-surface-subtle'
            }`}
            aria-label={label}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="flex items-center justify-center w-[42px] h-[42px] rounded-[14px] bg-accent text-white hover:bg-accent-strong shadow-sm transition-colors duration-150 cursor-pointer border-0"
        aria-label="New item"
      >
        <Plus size={20} />
      </button>
    </nav>
  );
}
