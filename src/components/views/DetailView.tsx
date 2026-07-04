import { useMemo, useState } from 'react';
import type { FolioItem } from '../../types';
import { formatDate } from '../../lib/dates';
import { downloadMarkdown } from '../../lib/exportMarkdown';
import { MarkdownPreview } from '../MarkdownPreview';
import { Stars } from '../ui/Stars';
import { Pill } from '../ui/Pill';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { EmptyState } from './EmptyState';
import { ArrowDown, ArrowsLeftRight, Copy, PencilSimple } from '@phosphor-icons/react';

type DetailViewProps = {
  item?: FolioItem;
  onEdit: (item: FolioItem) => void;
  onDelete: (item: FolioItem) => void;
  onDuplicate: (item: FolioItem) => void;
  onCompare: (item: FolioItem) => void;
  onCreate: () => void;
};

const tabs = [
  { id: 'preview', label: 'Preview' },
  { id: 'raw', label: 'Raw' },
  { id: 'review', label: 'Review' },
  { id: 'metadata', label: 'Metadata' },
];

export function DetailView({ item, onEdit, onDelete, onDuplicate, onCompare, onCreate }: DetailViewProps) {
  const [tab, setTab] = useState('preview');

  const lineCount = useMemo(() => item?.content.split(/\r?\n/).length ?? 0, [item]);
  const wordCount = useMemo(() => item?.content.split(/\s+/).filter(Boolean).length ?? 0, [item]);

  if (!item) {
    return (
      <div className="border border-border rounded-[22px] bg-surface p-6 min-h-[calc(100vh-56px)]">
        <EmptyState
          title="Select an item"
          description="Choose an item from the library to inspect its Markdown, metadata, rating, and notes."
          action={<Button variant="primary" onClick={onCreate}>New item</Button>}
        />
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted mb-3">
            <Pill>{item.type}</Pill>
            <Pill>{item.lifecycle}</Pill>
            {item.flags.isFavorite && <span title="Favorite" className="text-warning">&#11088;</span>}
            {item.flags.isProductionReady && <span title="Production-ready" className="text-success">&#10003;</span>}
            <span>{formatDate(item.updatedAt)}</span>
          </div>
          <h2 className="m-0 text-2xl font-[700] tracking-tight text-text break-words">{item.title}</h2>
          <p className="m-0 mt-1 text-sm text-muted leading-relaxed">{item.description || 'No description yet.'}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.tags.map((t) => (
              <span key={t} className="text-[11px] text-faint bg-surface-subtle rounded-full px-2 py-0.5">{t}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button variant="ghost" onClick={() => downloadMarkdown(item)}>
            <ArrowDown size={16} />
            Export
          </Button>
          <Button variant="ghost" onClick={() => onDuplicate(item)}>
            <Copy size={16} />
            Duplicate
          </Button>
          <Button variant="secondary" onClick={() => onCompare(item)}>
            <ArrowsLeftRight size={16} />
            Compare
          </Button>
          <Button variant="primary" onClick={() => onEdit(item)}>
            <PencilSimple size={16} />
            Edit
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <Tabs tabs={tabs} active={tab} onChange={setTab} />

          {tab === 'preview' && (
            <article className="markdown mt-4 max-w-[920px] leading-relaxed text-sm text-text">
              <MarkdownPreview content={item.content} />
            </article>
          )}
          {tab === 'raw' && (
            <pre className="mt-4 overflow-auto rounded-[14px] bg-code-bg text-code-text p-4 text-sm font-mono leading-relaxed">
              <code>{item.content}</code>
            </pre>
          )}
          {tab === 'review' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border rounded-[14px] bg-surface p-4">
                <h3 className="m-0 text-sm font-[650] tracking-tight text-text mb-3">Ratings</h3>
                <div className="flex flex-col gap-3">
                  {Object.entries(item.rating).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-[90px_1fr_30px] gap-3 items-center">
                      <span className="text-xs text-muted capitalize">{key}</span>
                      <meter min={0} max={5} value={val} className="w-full h-2 rounded-full [&::-webkit-meter-bar]:border-0 [&::-webkit-meter-bar]:rounded-full [&::-webkit-meter-bar]:bg-surface-subtle [&::-webkit-meter-optimum-value]:rounded-full [&::-webkit-meter-optimum-value]:bg-accent" />
                      <strong className="text-xs text-text">{val}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-border rounded-[14px] bg-surface p-4">
                <h3 className="m-0 text-sm font-[650] tracking-tight text-text mb-3">Notes</h3>
                <p className="m-0 text-sm text-muted leading-relaxed">{item.notes || 'No review notes yet.'}</p>
              </div>
            </div>
          )}
          {tab === 'metadata' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border rounded-[14px] bg-surface p-4">
                <span className="block text-xs text-muted mb-1.5">Source</span>
                {item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-sm text-accent break-words">Open source</a>
                ) : (
                  <strong className="text-sm text-text">None</strong>
                )}
              </div>
              <div className="border border-border rounded-[14px] bg-surface p-4">
                <span className="block text-xs text-muted mb-1.5">Author</span>
                <strong className="text-sm text-text">{item.author || 'Unknown'}</strong>
              </div>
              <div className="border border-border rounded-[14px] bg-surface p-4">
                <span className="block text-xs text-muted mb-1.5">Created</span>
                <strong className="text-sm text-text">{formatDate(item.createdAt)}</strong>
              </div>
              <div className="border border-border rounded-[14px] bg-surface p-4">
                <span className="block text-xs text-muted mb-1.5">Updated</span>
                <strong className="text-sm text-text">{formatDate(item.updatedAt)}</strong>
              </div>
              <div className="border border-border rounded-[14px] bg-surface p-4 col-span-1 md:col-span-2">
                <span className="block text-xs text-muted mb-1.5">ID</span>
                <code className="text-xs text-text break-all">{item.id}</code>
              </div>
              <div className="border border-danger/30 rounded-[14px] bg-danger-soft p-4 col-span-1 md:col-span-2">
                <span className="block text-xs text-danger mb-3">Danger zone</span>
                <Button variant="danger" onClick={() => onDelete(item)}>Delete item</Button>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:w-[240px] shrink-0 flex flex-col gap-3">
          <div className="border border-border rounded-[14px] bg-surface p-4">
            <span className="block text-xs text-muted mb-1.5">Overall</span>
            <Stars value={item.rating.overall} />
          </div>
          <div className="border border-border rounded-[14px] bg-surface p-4">
            <span className="block text-xs text-muted mb-1.5">Lines</span>
            <strong className="text-lg text-text">{lineCount}</strong>
          </div>
          <div className="border border-border rounded-[14px] bg-surface p-4">
            <span className="block text-xs text-muted mb-1.5">Words</span>
            <strong className="text-lg text-text">{wordCount}</strong>
          </div>
          <div className="border border-border rounded-[14px] bg-surface p-4">
            <span className="block text-xs text-muted mb-1.5">License</span>
            <strong className="text-sm text-text">{item.license || 'Unknown'}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
