import { MagnifyingGlass, Star } from '@phosphor-icons/react';
import type { FolioLifecycle, FolioType } from '../../types';

const allTypes: Array<FolioType | 'All'> = ['All', 'Instruction', 'Command', 'Template', 'Workflow', 'Note', 'Other'];
const allLifecycles: Array<FolioLifecycle | 'All'> = ['All', 'draft', 'active', 'archived'];

type SearchToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  type: FolioType | 'All';
  onTypeChange: (value: FolioType | 'All') => void;
  lifecycle: FolioLifecycle | 'All';
  onLifecycleChange: (value: FolioLifecycle | 'All') => void;
  filterFavorite: boolean;
  onFilterFavoriteChange: (value: boolean) => void;
  tags: string[];
  tag: string;
  onTagChange: (value: string) => void;
};

type ChipProps = {
  active: boolean;
  onClick: () => void;
  label: string;
  children?: React.ReactNode;
};

function Chip({ active, onClick, label, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center min-h-[28px] rounded-full px-3 text-xs font-medium border transition-colors duration-150 cursor-pointer whitespace-nowrap ${
        active
          ? 'bg-accent text-white border-accent'
          : 'bg-surface text-muted border-border hover:text-text hover:border-border-strong'
      }`}
    >
      {children}{label}
    </button>
  );
}

export function SearchToolbar({ query, onQueryChange, type, onTypeChange, lifecycle, onLifecycleChange, filterFavorite, onFilterFavoriteChange, tags, tag, onTagChange }: SearchToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 border border-border rounded-full bg-surface px-4 min-h-[44px]">
        <MagnifyingGlass size={18} className="text-faint shrink-0" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search title, tags, notes, content\u2026"
          className="flex-1 border-0 outline-0 bg-transparent text-text text-sm placeholder:text-faint"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-faint font-medium">Type</span>
        {allTypes.map((t) => (
          <Chip key={t} active={type === t} onClick={() => onTypeChange(t)} label={t} />
        ))}

        <span className="text-xs text-faint font-medium ml-1">Lifecycle</span>
        {allLifecycles.map((l) => (
          <Chip key={l} active={lifecycle === l} onClick={() => onLifecycleChange(l)} label={l} />
        ))}

        <span className="text-xs text-faint font-medium ml-1">Other</span>
        <Chip active={filterFavorite} onClick={() => onFilterFavoriteChange(!filterFavorite)} label="Favorite">
          <Star size={12} weight={filterFavorite ? 'fill' : 'regular'} className="mr-0.5" />
        </Chip>

        {tags.length > 0 && (
          <>
            <span className="text-xs text-faint font-medium ml-1">Tag</span>
            <Chip active={tag === 'All'} onClick={() => onTagChange('All')} label="All" />
            {tags.map((t) => (
              <Chip key={t} active={tag === t} onClick={() => onTagChange(t)} label={t} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
