import { useMemo, useState } from 'react';
import type { FolioItem, FolioLifecycle, FolioType, FolioFlags } from '../../types';
import { createId } from '../../lib/id';
import { nowIso } from '../../lib/dates';
import { emptyRating } from '../../lib/ratings';
import { extractTitle } from '../../lib/markdown';
import { fetchMarkdownFromUrl } from '../../lib/github';
import { Modal } from '../ui/Modal';
import { Stars } from '../ui/Stars';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { ArrowLineDown, CloudArrowUp, FileArrowUp } from '@phosphor-icons/react';

const types: { value: FolioType; label: string }[] = [
  { value: 'Instruction', label: 'Instruction' },
  { value: 'Command', label: 'Command' },
  { value: 'Template', label: 'Template' },
  { value: 'Workflow', label: 'Workflow' },
  { value: 'Note', label: 'Note' },
  { value: 'Other', label: 'Other' },
];

const lifecycles: { value: FolioLifecycle; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export type ItemDraft = Omit<FolioItem, 'id' | 'createdAt' | 'updatedAt'>;

function createEmptyDraft(): ItemDraft {
  return {
    title: '',
    type: 'Instruction' as FolioType,
    lifecycle: 'active' as FolioLifecycle,
    flags: { isFavorite: false, isProductionReady: false } as FolioFlags,
    description: '',
    content: '',
    sourceUrl: '',
    author: '',
    license: '',
    tags: [],
    rating: emptyRating,
    notes: '',
  };
}

function fromItem(item: FolioItem): ItemDraft {
  return {
    title: item.title,
    type: item.type,
    lifecycle: item.lifecycle,
    flags: item.flags,
    description: item.description,
    content: item.content,
    sourceUrl: item.sourceUrl ?? '',
    author: item.author ?? '',
    license: item.license ?? '',
    tags: item.tags,
    rating: item.rating,
    notes: item.notes,
  };
}

type ItemFormProps = {
  item?: FolioItem;
  open: boolean;
  onCancel: () => void;
  onSave: (item: FolioItem) => void;
};

export function ItemForm({ item, open, onCancel, onSave }: ItemFormProps) {
  const [draft, setDraft] = useState<ItemDraft>(() => (item ? fromItem(item) : createEmptyDraft()));
  const [tagInput, setTagInput] = useState(() => draft.tags.join(', '));
  const [importUrl, setImportUrl] = useState(item?.sourceUrl ?? '');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  const title = useMemo(() => (item ? 'Edit item' : 'New item'), [item]);

  const update = <Key extends keyof ItemDraft>(key: Key, value: ItemDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    const content = await file.text();
    const inferredTitle = extractTitle(content) ?? file.name.replace(/\.md$/i, '');
    setDraft((current) => ({
      ...current,
      title: current.title || inferredTitle,
      content,
    }));
  };

  const importFromUrl = async () => {
    setError('');
    setIsImporting(true);
    try {
      const content = await fetchMarkdownFromUrl(importUrl);
      const inferredTitle = extractTitle(content) ?? importUrl.split('/').pop()?.replace(/\.md$/i, '') ?? 'Imported item';
      setDraft((current) => ({
        ...current,
        title: current.title || inferredTitle,
        content,
        sourceUrl: importUrl,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const submit = () => {
    setError('');
    const cleanedTags = tagInput.split(',').map((tag) => tag.trim()).filter(Boolean);
    const createdAt = item?.createdAt ?? nowIso();
    const id = item?.id ?? createId();
    const finalTitle = draft.title.trim() || extractTitle(draft.content) || 'Untitled item';

    if (!draft.content.trim()) {
      setError('Content is required. Paste Markdown, upload a file, or import from URL.');
      return;
    }

    onSave({
      id,
      createdAt,
      updatedAt: nowIso(),
      ...draft,
      title: finalTitle,
      tags: cleanedTags,
      sourceUrl: draft.sourceUrl?.trim() || undefined,
      author: draft.author?.trim() || undefined,
      license: draft.license?.trim() || undefined,
    });
  };

  return (
    <Modal open={open} onClose={onCancel} title={title} eyebrow="Folio item">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <input
            value={importUrl}
            onChange={(event) => setImportUrl(event.target.value)}
            placeholder="Paste GitHub file URL or raw Markdown URL"
            className="w-full border border-border rounded-[10px] bg-surface text-text px-3 py-[10px] text-sm outline-none transition-[border,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)]"
          />
        </div>
        <Button variant="secondary" onClick={importFromUrl} disabled={!importUrl.trim() || isImporting}>
          <CloudArrowUp size={16} />
          {isImporting ? 'Importing\u2026' : 'Import URL'}
        </Button>
        <label className="relative inline-flex items-center justify-center gap-2 min-h-[40px] px-[14px] rounded-[10px] text-sm font-[650] border border-border bg-surface-subtle text-text hover:bg-surface-hover cursor-pointer transition-colors duration-150">
          <FileArrowUp size={16} />
          Upload .md
          <input type="file" accept=".md,.markdown,text/markdown,text/plain" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(event) => handleFile(event.target.files?.[0])} />
        </label>
      </div>

      {error && (
        <div className="border border-danger/35 rounded-[10px] text-sm text-danger bg-danger-soft px-3 py-3 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Input
          label="Title"
          value={draft.title}
          onChange={(event) => update('title', event.target.value)}
          placeholder="Example: Research Brief Builder"
        />
        <Select
          label="Type"
          value={draft.type}
          onChange={(value) => update('type', value as FolioType)}
          options={types}
        />
        <Select
          label="Lifecycle"
          value={draft.lifecycle}
          onChange={(value) => update('lifecycle', value as FolioLifecycle)}
          options={lifecycles}
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={draft.flags.isFavorite}
            onChange={(e) => update('flags', { ...draft.flags, isFavorite: e.target.checked })}
            className="w-4 h-4 rounded border-border accent-accent"
          />
          <span>Favorite</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={draft.flags.isProductionReady}
            onChange={(e) => update('flags', { ...draft.flags, isProductionReady: e.target.checked })}
            className="w-4 h-4 rounded border-border accent-accent"
          />
          <span>Production-ready</span>
        </label>
        <Input
          label="Tags"
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          placeholder="research, coding, markdown"
        />
        <Input
          label="Source URL"
          value={draft.sourceUrl ?? ''}
          onChange={(event) => update('sourceUrl', event.target.value)}
          placeholder="https://github.com/\u2026"
        />
        <Input
          label="Author"
          value={draft.author ?? ''}
          onChange={(event) => update('author', event.target.value)}
          placeholder="Optional"
        />
        <Input
          label="License"
          value={draft.license ?? ''}
          onChange={(event) => update('license', event.target.value)}
          placeholder="MIT, Apache-2.0, Unknown\u2026"
        />
        <Input
          label="Description"
          value={draft.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="What is this useful for?"
          className="sm:col-span-2"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {(['overall', 'clarity', 'usefulness', 'reusability', 'safety'] as const).map((key) => (
          <div key={key} className="border border-border rounded-[10px] bg-surface-subtle p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted capitalize">{key}</span>
              <strong className="text-xs text-text">{draft.rating[key]}</strong>
            </div>
            <Stars
              value={draft.rating[key]}
              onChange={(val) => {
                setDraft((current) => ({ ...current, rating: { ...current.rating, [key]: val } }));
              }}
            />
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={draft.rating[key]}
              onChange={(event) => {
                const val = Number(event.target.value);
                setDraft((current) => ({ ...current, rating: { ...current.rating, [key]: val } }));
              }}
              className="w-full mt-2 h-1.5 rounded-full appearance-none bg-border cursor-pointer accent-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        ))}
      </div>

      <label className="grid gap-1.5 text-muted text-sm font-[650] mb-4">
        Markdown content
        <textarea
          value={draft.content}
          onChange={(event) => update('content', event.target.value)}
          placeholder="# Paste your Markdown here"
          rows={12}
          className="w-full border border-border rounded-[10px] bg-surface text-text px-3 py-[10px] text-sm font-mono outline-none transition-[border,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)] resize-y"
        />
      </label>

      <label className="grid gap-1.5 text-muted text-sm font-[650] mb-5">
        Review notes
        <textarea
          value={draft.notes}
          onChange={(event) => update('notes', event.target.value)}
          placeholder="What is good, weak, or worth improving?"
          rows={3}
          className="w-full border border-border rounded-[10px] bg-surface text-text px-3 py-[10px] text-sm outline-none transition-[border,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)] resize-y"
        />
      </label>

      <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={submit}>{item ? 'Save changes' : 'Create item'}</Button>
      </div>
    </Modal>
  );
}
