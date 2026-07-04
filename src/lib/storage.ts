import type { FolioItem, ThemePreference } from '../types';
import { sampleItems } from './sampleData';

const ITEMS_KEY = 'folio.items.v1';
const THEME_KEY = 'folio.theme.v1';
const SEEDED_KEY = 'folio.seeded.v1';

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

  if (!localStorage.getItem(SEEDED_KEY)) {
    localStorage.setItem(SEEDED_KEY, 'true');
    saveItems(sampleItems);
    return sampleItems;
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
