import { describe, it, expect, beforeEach } from 'vitest';
import type { FolioItem, FolioLifecycle, FolioFlags } from '../types';
import { migrateFromV1, importItemsFromFile } from './storage';
import type { OldFolioItem } from './storage';

const createOldItem = (status: 'Saved' | 'Reading' | 'Testing' | 'Favorite' | 'Archived' | 'Production-ready'): OldFolioItem => ({
  id: 'test-id',
  title: 'Test Item',
  type: 'Note',
  status,
  description: 'Test description',
  content: '# Test content',
  tags: ['test'],
  rating: { overall: 4, clarity: 4, usefulness: 4 },
  notes: 'Test notes',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const createV2Item = (overrides?: Partial<FolioItem>): FolioItem => ({
  id: 'v2-id',
  title: 'V2 Item',
  type: 'Note',
  lifecycle: 'active',
  flags: { isFavorite: false, isProductionReady: false },
  description: 'V2 description',
  content: '# V2 content',
  tags: ['v2'],
  rating: { overall: 3, clarity: 3, usefulness: 3 },
  notes: '',
  createdAt: '2024-06-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
  ...overrides,
});

function toFile(data: unknown, name = 'import.json'): File {
  return new File([JSON.stringify(data)], name, { type: 'application/json' });
}

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
      rating: { overall: 5, clarity: 4, usefulness: 3 },
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

describe('importItemsFromFile', () => {
  it('imports v2 items as-is', async () => {
    const items = [createV2Item()];
    const file = toFile(items);
    const result = await importItemsFromFile(file);

    expect(result).toHaveLength(1);
    expect(result[0].lifecycle).toBe('active');
    expect(result[0].flags).toEqual({ isFavorite: false, isProductionReady: false });
  });

  it('migrates v1 items on import', async () => {
    const v1Item = createOldItem('Favorite');
    const file = toFile([v1Item]);
    const result = await importItemsFromFile(file);

    expect(result).toHaveLength(1);
    expect(result[0].lifecycle).toBe('active');
    expect(result[0].flags.isFavorite).toBe(true);
    expect(result[0].flags.isProductionReady).toBe(false);
  });

  it('handles mixed v1 and v2 items in one file', async () => {
    const v2Item = createV2Item({ id: 'v2-id', title: 'Already v2' });
    const v1Item = createOldItem('Archived');
    const file = toFile([v2Item, v1Item]);
    const result = await importItemsFromFile(file);

    expect(result).toHaveLength(2);
    expect(result[0].lifecycle).toBe('active');
    expect(result[0].id).toBe('v2-id');
    expect(result[1].lifecycle).toBe('archived');
    expect(result[1].flags.isFavorite).toBe(false);
  });

  it('preserves all fields when importing v2 items', async () => {
    const items = [
      createV2Item({
        id: 'keep-id',
        title: 'Original Title',
        type: 'Command',
        lifecycle: 'draft',
        flags: { isFavorite: true, isProductionReady: true },
        description: 'Original desc',
        content: '# Original',
        sourceUrl: 'https://example.com',
        author: 'Author',
        license: 'MIT',
        tags: ['a', 'b'],
        rating: { overall: 5, clarity: 5, usefulness: 5 },
        notes: 'Some notes',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-06-01T00:00:00.000Z',
      }),
    ];
    const file = toFile(items);
    const result = await importItemsFromFile(file);

    expect(result[0]).toEqual(items[0]);
  });

  it('throws for non-array input', async () => {
    const file = toFile({ not: 'an array' });
    await expect(importItemsFromFile(file)).rejects.toThrow('must contain an array');
  });

  it('treats items with neither status nor lifecycle as v1', async () => {
    const bare = { id: 'bare', title: 'No schema', type: 'Note', tags: [], rating: { overall: 0, clarity: 0, usefulness: 0 }, notes: '', createdAt: '', updatedAt: '' };
    const file = toFile([bare]);
    const result = await importItemsFromFile(file);

    expect(result).toHaveLength(1);
    expect(result[0].lifecycle).toBe('active');
    expect(result[0].flags).toEqual({ isFavorite: false, isProductionReady: false });
  });
});
