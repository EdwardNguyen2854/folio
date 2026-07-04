import { useMemo, useState } from 'react';
import type { FolioItem, FolioStatus, FolioType } from '../../types';
import { formatDate } from '../../lib/dates';
import { Stars } from '../ui/Stars';
import { Pill } from '../ui/Pill';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StaggerReveal } from '../motion/StaggerReveal';
import { StatsGrid } from '../sections/StatsGrid';
import { SearchToolbar } from '../sections/SearchToolbar';
import { EmptyState } from './EmptyState';
import { Plus } from '@phosphor-icons/react';

type LibraryViewProps = {
  items: FolioItem[];
  selectedId?: string;
  onSelect: (item: FolioItem) => void;
  onCreate: () => void;
};

export function LibraryView({ items, selectedId, onSelect, onCreate }: LibraryViewProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<FolioType | 'All'>('All');
  const [status, setStatus] = useState<FolioStatus | 'All'>('All');
  const [tag, setTag] = useState('All');

  const tags = useMemo(() => Array.from(new Set(items.flatMap((item) => item.tags))).sort(), [items]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery = !normalized || [
        item.title,
        item.description,
        item.content,
        item.notes,
        item.author ?? '',
        item.license ?? '',
        item.tags.join(' '),
      ].join('\n').toLowerCase().includes(normalized);
      const matchesType = type === 'All' || item.type === type;
      const matchesStatus = status === 'All' || item.status === status;
      const matchesTag = tag === 'All' || item.tags.includes(tag);
      return matchesQuery && matchesType && matchesStatus && matchesTag;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [items, query, type, status, tag]);

  const stats = useMemo(() => ({
    total: items.length,
    favorites: items.filter((item) => item.status === 'Favorite').length,
    production: items.filter((item) => item.status === 'Production-ready').length,
    averageRating: items.length ? items.reduce((sum, item) => sum + item.rating.overall, 0) / items.length : 0,
  }), [items]);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="m-0 text-xs font-[750] tracking-[0.1em] uppercase text-accent">Personal library</p>
          <h1 className="m-0 mt-1 text-3xl md:text-5xl font-[700] tracking-tighter text-text">Folio</h1>
          <p className="m-0 mt-2 text-sm text-muted max-w-[65ch] leading-relaxed">Save, compare, rate, and refine reusable Markdown resources in a focused workspace.</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="primary" onClick={onCreate}>
            <Plus size={18} weight="bold" />
            New item
          </Button>
        </div>
      </div>

      <StatsGrid {...stats} />

      <SearchToolbar
        query={query}
        onQueryChange={setQuery}
        type={type}
        onTypeChange={setType}
        status={status}
        onStatusChange={setStatus}
        tags={tags}
        tag={tag}
        onTagChange={setTag}
      />

      {!filtered.length ? (
        <EmptyState
          title="No matching items"
          description="Try a different filter or add a new Markdown resource to your library."
          action={<Button variant="primary" onClick={onCreate}>Add first item</Button>}
        />
      ) : (
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} onClick={() => onSelect(item)} tilt className="flex flex-col gap-3 min-h-[220px]">
              <div className="flex items-center justify-between gap-2">
                <Pill>{item.type}</Pill>
                <Stars value={item.rating.overall} compact />
              </div>
              <h3 className="m-0 text-base font-[650] tracking-tight text-text">{item.title}</h3>
              <p className="m-0 text-sm text-muted leading-relaxed flex-1">{item.description || 'No description yet.'}</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 4).map((t) => (
                  <span key={t} className="text-[11px] text-faint bg-surface-subtle rounded-full px-2 py-0.5">{t}</span>
                ))}
              </div>
              <small className="text-xs text-faint">Updated {formatDate(item.updatedAt)}</small>
            </Card>
          ))}
        </StaggerReveal>
      )}
    </section>
  );
}
