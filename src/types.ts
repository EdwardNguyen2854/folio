export type FolioType = 'Instruction' | 'Command' | 'Template' | 'Workflow' | 'Note' | 'Other';
export type FolioLifecycle = 'draft' | 'active' | 'archived';
export type FolioFlags = {
  isFavorite: boolean;
  isProductionReady: boolean;
};
export type ThemePreference = 'system' | 'light' | 'dark';

export type Rating = {
  overall: number;
  clarity: number;
  usefulness: number;
  reusability: number;
  safety: number;
};

export type FolioItem = {
  id: string;
  title: string;
  type: FolioType;
  lifecycle: FolioLifecycle;
  flags: FolioFlags;
  description: string;
  content: string;
  sourceUrl?: string;
  author?: string;
  license?: string;
  tags: string[];
  rating: Rating;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ViewMode = 'library' | 'detail' | 'compare' | 'settings' | 'workflows';
export type CompareMode = 'raw' | 'preview' | 'diff';
