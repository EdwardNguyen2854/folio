import { describe, it, expect, beforeEach } from 'vitest';
import type { FolioItem, FolioLifecycle, FolioFlags } from '../types';

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

const createOldItem = (status: 'Saved' | 'Reading' | 'Testing' | 'Favorite' | 'Archived' | 'Production-ready'): OldFolioItem => ({
  id: 'test-id',
  title: 'Test Item',
  type: 'Note',
  status,
  description: 'Test description',
  content: '# Test content',
  tags: ['test'],
  rating: { overall: 4, clarity: 4, usefulness: 4, reusability: 4, safety: 4 },
  notes: 'Test notes',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

describe('migrateFromV1', () => {
  it('migrates Archived status to lifecycle: archived with no flags', () => {
    const oldItem = createOldItem('Archived');
    const migrated = migrateFromV1([oldItem]);

    expect(migrated).toHaveLength(1);
    expect(migrated[0].lifecycle).toBe('archived');
    expect(migrated[0].flags.isFavorite).toBe(false);
    expect(migrated[0].flags.isProductionReady).toBe(false);
  });

  it('migrates Favorite status to lifecycle: active with isFavorite flag', () => {
    const oldItem = createOldItem('Favorite');
    const migrated = migrateFromV1([oldItem]);

    expect(migrated).toHaveLength(1);
    expect(migrated[0].lifecycle).toBe('active');
    expect(migrated[0].flags.isFavorite).toBe(true);
    expect(migrated[0].flags.isProductionReady).toBe(false);
  });

  it('migrates Production-ready status to lifecycle: active with isProductionReady flag', () => {
    const oldItem = createOldItem('Production-ready');
    const migrated = migrateFromV1([oldItem]);

    expect(migrated).toHaveLength(1);
    expect(migrated[0].lifecycle).toBe('active');
    expect(migrated[0].flags.isFavorite).toBe(false);
    expect(migrated[0].flags.isProductionReady).toBe(true);
  });

  it('migrates Saved status to lifecycle: active with no flags', () => {
    const oldItem = createOldItem('Saved');
    const migrated = migrateFromV1([oldItem]);

    expect(migrated).toHaveLength(1);
    expect(migrated[0].lifecycle).toBe('active');
    expect(migrated[0].flags.isFavorite).toBe(false);
    expect(migrated[0].flags.isProductionReady).toBe(false);
  });

  it('migrates Reading status to lifecycle: active with no flags', () => {
    const oldItem = createOldItem('Reading');
    const migrated = migrateFromV1([oldItem]);

    expect(migrated).toHaveLength(1);
    expect(migrated[0].lifecycle).toBe('active');
    expect(migrated[0].flags.isFavorite).toBe(false);
    expect(migrated[0].flags.isProductionReady).toBe(false);
  });

  it('migrates Testing status to lifecycle: active with no flags', () => {
    const oldItem = createOldItem('Testing');
    const migrated = migrateFromV1([oldItem]);

    expect(migrated).toHaveLength(1);
    expect(migrated[0].lifecycle).toBe('active');
    expect(migrated[0].flags.isFavorite).toBe(false);
    expect(migrated[0].flags.isProductionReady).toBe(false);
  });

  it('preserves all other item fields unchanged during migration', () => {
    const oldItem: OldFolioItem = {
      id: 'unique-id',
      title: 'My Title',
      type: 'Instruction',
      status: 'Favorite',
      description: 'My description',
      content: '# Markdown content',
      sourceUrl: 'https://example.com',
      author: 'Test Author',
      license: 'MIT',
      tags: ['tag1', 'tag2'],
      rating: { overall: 5, clarity: 4, usefulness: 3, reusability: 4, safety: 5 },
      notes: 'Some notes',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    const migrated = migrateFromV1([oldItem]);

    expect(migrated[0].id).toBe(oldItem.id);
    expect(migrated[0].title).toBe(oldItem.title);
    expect(migrated[0].type).toBe(oldItem.type);
    expect(migrated[0].description).toBe(oldItem.description);
    expect(migrated[0].content).toBe(oldItem.content);
    expect(migrated[0].sourceUrl).toBe(oldItem.sourceUrl);
    expect(migrated[0].author).toBe(oldItem.author);
    expect(migrated[0].license).toBe(oldItem.license);
    expect(migrated[0].tags).toEqual(oldItem.tags);
    expect(migrated[0].rating).toEqual(oldItem.rating);
    expect(migrated[0].notes).toBe(oldItem.notes);
    expect(migrated[0].createdAt).toBe(oldItem.createdAt);
    expect(migrated[0].updatedAt).toBe(oldItem.updatedAt);
  });
});
