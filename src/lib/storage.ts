import type { FolioItem, FolioLifecycle, FolioFlags, ThemePreference } from '../types';
import { sampleItems } from './sampleData';

const ITEMS_KEY = 'folio.items.v2';
const THEME_KEY = 'folio.theme.v1';
const SEEDED_KEY = 'folio.seeded.v1';

type OldFolioItem = {
  id: string;
  title: string;
  type: 'Instruction' | 'Command' | 'Template' | 'Workflow' | 'Note' | 'Other';
  status: 'Saved' | 'Reading' | 'Testing' | 'Favorite' | 'Archived' | 'Production-ready';
  description: string;
  content: string;
  sourceUrl?: string;
  author?: string;
  license?: string;
  tags: string[];
  rating: {
    overall: number;
    clarity: number;
    usefulness: number;
    reusability: number;
    safety: number;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
};

function migrateFromV1(oldItems: OldFolioItem[]): FolioItem[] {
  return oldItems.map((item): FolioItem => {
    let lifecycle: FolioLifecycle = 'active';
    let flags: FolioFlags = { isFavorite: false, isProductionReady: false };

    if (item.status === 'Archived') {
      lifecycle = 'archived';
    } else if (item.status === 'Favorite') {
      flags.isFavorite = true;
    } else if (item.status === 'Production-ready') {
      flags.isProductionReady = true;
    }

    return {
      id: item.id,
      title: item.title,
      type: item.type,
      lifecycle,
      flags,
      description: item.description,
      content: item.content,
      sourceUrl: item.sourceUrl,
      author: item.author,
      license: item.license,
      tags: item.tags,
      rating: item.rating,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });
}

export function loadItems(): FolioItem[] {
  const raw = localStorage.getItem(ITEMS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as FolioItem[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall back to seed below
    }
  }

  const oldRaw = localStorage.getItem('folio.items.v1');
  if (oldRaw) {
    try {
      const oldParsed = JSON.parse(oldRaw) as OldFolioItem[];
      if (Array.isArray(oldParsed) && oldParsed.length > 0) {
        const migrated = migrateFromV1(oldParsed);
        saveItems(migrated);
        localStorage.removeItem('folio.items.v1');
        return migrated;
      }
    } catch {
      // fall through to seed
    }
  }

  if (!localStorage.getItem(SEEDED_KEY)) {
    localStorage.setItem(SEEDED_KEY, 'true');
    const oldSampleItems = sampleItems as unknown as OldFolioItem[];
    const newSampleItems = migrateFromV1(oldSampleItems);
    saveItems(newSampleItems);
    return newSampleItems;
  }

  return [];
}

export function saveItems(items: FolioItem[]): void {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function exportItems(items: FolioItem[]): void {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `folio-export-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importItemsFromFile(file: File): Promise<FolioItem[]> {
  const text = await file.text();
  const parsed = JSON.parse(text) as FolioItem[];
  if (!Array.isArray(parsed)) throw new Error('Import file must contain an array of Folio items.');
  return parsed;
}

export function loadThemePreference(): ThemePreference {
  const value = localStorage.getItem(THEME_KEY);
  if (value === 'system' || value === 'light' || value === 'dark') return value;
  return 'system';
}

export function saveThemePreference(theme: ThemePreference): void {
  localStorage.setItem(THEME_KEY, theme);
}
