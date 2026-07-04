import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { CompareMode, FolioItem } from '../../types';
import { diffLines } from '../../lib/diff';
import { MarkdownPreview } from '../MarkdownPreview';
import { Pill } from '../ui/Pill';
import { Button } from '../ui/Button';
import { EmptyState } from './EmptyState';
import { ArrowsLeftRight, CaretLeft, CaretRight, SelectionPlus } from '@phosphor-icons/react';

type CompareViewProps = {
  items: FolioItem[];
  initialLeftId?: string;
  initialRightId?: string;
  onSelectDetail: (item: FolioItem) => void;
};

const modes: CompareMode[] = ['preview', 'raw', 'diff'];

export function CompareView({ items, initialLeftId, initialRightId, onSelectDetail }: CompareViewProps) {
  const [leftId, setLeftId] = useState(initialLeftId ?? items[0]?.id ?? '');
  const [rightId, setRightId] = useState(initialRightId ?? items.find((item) => item.id !== leftId)?.id ?? '');
  const [mode, setMode] = useState<CompareMode>('preview');

  const left = items.find((item) => item.id === leftId);
  const right = items.find((item) => item.id === rightId);
  const diff = useMemo(() => diffLines(left?.content ?? '', right?.content ?? ''), [left?.content, right?.content]);

  if (items.length < 2) {
    return (
      <section className="compare-view">
        <EmptyState
          title="Add another item to compare"
          description="Comparison becomes useful when you have at least two Markdown resources in the library."
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="m-0 text-xs font-[750] tracking-[0.1em] uppercase text-accent">Comparison workspace</p>
          <h1 className="m-0 mt-1 text-3xl md:text-5xl font-[700] tracking-tighter text-text">Side-by-side review</h1>
          <p className="m-0 mt-2 text-sm text-muted max-w-[65ch] leading-relaxed">Compare raw Markdown, rendered preview, or line-level changes.</p>
        </div>
        <div className="flex items-center gap-1 p-1 border border-border rounded-[10px] bg-surface shrink-0">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`border-0 rounded-lg px-3 py-2 text-xs font-medium capitalize cursor-pointer transition-colors duration-150 ${
                mode === m ? 'bg-surface-subtle text-text' : 'bg-transparent text-muted hover:text-text'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="grid gap-1.5 text-muted text-sm font-[650]">
          Left item
          <select
            value={leftId}
            onChange={(event) => setLeftId(event.target.value)}
            className="w-full border border-border rounded-[10px] bg-surface text-text px-3 py-[10px] outline-none transition-[border,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)]"
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-muted text-sm font-[650]">
          Right item
          <select
            value={rightId}
            onChange={(event) => setRightId(event.target.value)}
            className="w-full border border-border rounded-[10px] bg-surface text-text px-3 py-[10px] outline-none transition-[border,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)]"
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </label>
      </div>

      {left && right && mode !== 'diff' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <article className="border border-border rounded-[22px] bg-surface p-5 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h2 className="m-0 text-base font-[650] tracking-tight text-text truncate">{left.title}</h2>
                  <p className="m-0 text-xs text-muted mt-0.5">{left.type} &middot; {left.status} &middot; {left.rating.overall ? `\u2605 ${left.rating.overall}` : '\u2014'}</p>
                </div>
                <Button variant="ghost" onClick={() => onSelectDetail(left)}>Open</Button>
              </div>
              {mode === 'preview' ? (
                <article className="markdown text-sm text-text leading-relaxed">
                  <MarkdownPreview content={left.content} />
                </article>
              ) : (
                <pre className="overflow-auto rounded-[14px] bg-code-bg text-code-text p-4 text-sm font-mono leading-relaxed"><code>{left.content}</code></pre>
              )}
            </article>

            <article className="border border-border rounded-[22px] bg-surface p-5 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h2 className="m-0 text-base font-[650] tracking-tight text-text truncate">{right.title}</h2>
                  <p className="m-0 text-xs text-muted mt-0.5">{right.type} &middot; {right.status} &middot; {right.rating.overall ? `\u2605 ${right.rating.overall}` : '\u2014'}</p>
                </div>
                <Button variant="ghost" onClick={() => onSelectDetail(right)}>Open</Button>
              </div>
              {mode === 'preview' ? (
                <article className="markdown text-sm text-text leading-relaxed">
                  <MarkdownPreview content={right.content} />
                </article>
              ) : (
                <pre className="overflow-auto rounded-[14px] bg-code-bg text-code-text p-4 text-sm font-mono leading-relaxed"><code>{right.content}</code></pre>
              )}
            </article>
          </motion.div>
        </AnimatePresence>
      )}

      {left && right && mode === 'diff' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="border border-border rounded-[22px] bg-surface overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-subtle">
            <strong className="flex-1 text-sm text-text truncate">{left.title}</strong>
            <strong className="flex-1 text-sm text-text truncate">{right.title}</strong>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            {diff.map((line, index) => (
              <div
                key={index}
                className={`grid grid-cols-2 border-b border-border ${
                  line.type === 'added' ? 'bg-added [&>:last-child]:bg-added' : ''
                } ${line.type === 'removed' ? 'bg-removed [&>:first-child]:bg-removed' : ''}`}
              >
                <code className="px-3 py-1.5 text-xs font-mono leading-relaxed border-r border-border whitespace-pre-wrap min-h-[28px]">
                  {line.type === 'added' ? '' : line.left}
                </code>
                <code className="px-3 py-1.5 text-xs font-mono leading-relaxed whitespace-pre-wrap min-h-[28px]">
                  {line.type === 'removed' ? '' : line.right}
                </code>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
