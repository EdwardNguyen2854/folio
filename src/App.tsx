import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { FolioItem, ThemePreference, ViewMode } from './types';
import { createId } from './lib/id';
import { nowIso } from './lib/dates';
import { importItemsFromFile, loadItems, loadThemePreference, saveItems, saveThemePreference } from './lib/storage';
import { sampleItems } from './lib/sampleData';
import { NavRail } from './components/sections/NavRail';
import { PageTransition } from './components/motion/PageTransition';
import { LibraryView } from './components/views/LibraryView';
import { DetailView } from './components/views/DetailView';
import { CompareView } from './components/views/CompareView';
import { SettingsView } from './components/views/SettingsView';
import { WorkflowsView } from './components/views/WorkflowsView';
import { ItemForm } from './components/views/ItemForm';

function useThemePreference() {
  const [theme, setTheme] = useState<ThemePreference>(() => loadThemePreference());

  useEffect(() => {
    saveThemePreference(theme);
    document.documentElement.dataset.themePreference = theme;
    const applyTheme = () => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
      document.documentElement.dataset.theme = resolved;
    };
    applyTheme();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  return [theme, setTheme] as const;
}

function App() {
  const [items, setItems] = useState<FolioItem[]>(() => loadItems());
  const [selectedId, setSelectedId] = useState<string>(() => loadItems()[0]?.id ?? '');
  const [view, setView] = useState<ViewMode>('library');
  const [formItem, setFormItem] = useState<FolioItem | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [compareLeftId, setCompareLeftId] = useState<string | undefined>();
  const [compareRightId, setCompareRightId] = useState<string | undefined>();
  const [theme, setTheme] = useThemePreference();

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const selectedItem = useMemo(() => items.find((item) => item.id === selectedId), [items, selectedId]);

  const saveItem = (item: FolioItem) => {
    setItems((current) => {
      const exists = current.some((entry) => entry.id === item.id);
      return exists ? current.map((entry) => (entry.id === item.id ? item : entry)) : [item, ...current];
    });
    setSelectedId(item.id);
    setIsFormOpen(false);
    setFormItem(undefined);
    setView('detail');
  };

  const deleteItem = (item: FolioItem) => {
    const confirmed = window.confirm(`Delete \u201c${item.title}\u201d? This only removes the local copy.`);
    if (!confirmed) return;
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    setSelectedId((current) => {
      if (current !== item.id) return current;
      return items.find((entry) => entry.id !== item.id)?.id ?? '';
    });
    setView('library');
  };

  const duplicateItem = (item: FolioItem) => {
    const createdAt = nowIso();
    const copy: FolioItem = {
      ...item,
      id: createId('copy'),
      title: `${item.title} copy`,
      createdAt,
      updatedAt: createdAt,
      lifecycle: 'active',
      flags: { isFavorite: false, isProductionReady: false },
    };
    setItems((current) => [copy, ...current]);
    setSelectedId(copy.id);
    setView('detail');
  };

  const openCompareWith = (item: FolioItem) => {
    const other = items.find((entry) => entry.id !== item.id);
    setCompareLeftId(item.id);
    setCompareRightId(other?.id);
    setView('compare');
  };

  const importJson = async (file?: File) => {
    if (!file) return;
    try {
      const imported = await importItemsFromFile(file);
      setItems(imported);
      setSelectedId(imported[0]?.id ?? '');
      setView('library');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Import failed.');
    }
  };

  const resetSamples = () => {
    const confirmed = window.confirm('Replace the current library with sample data?');
    if (!confirmed) return;
    setItems(sampleItems);
    setSelectedId(sampleItems[0]?.id ?? '');
    setView('library');
  };

  return (
    <div className="flex min-h-[100dvh]">
      <NavRail
        view={view}
        onNavigate={setView}
        onCreate={() => { setFormItem(undefined); setIsFormOpen(true); }}
      />

      <main className="flex-1 min-w-0 p-7 max-sm:p-4">
        <AnimatePresence mode="wait">
          {view === 'library' && (
            <PageTransition key="library">
              <LibraryView
                items={items}
                selectedId={selectedId}
                onSelect={(item) => { setSelectedId(item.id); setView('detail'); }}
                onCreate={() => { setFormItem(undefined); setIsFormOpen(true); }}
              />
            </PageTransition>
          )}
          {view === 'detail' && (
            <PageTransition key="detail">
              <DetailView
                item={selectedItem}
                onCreate={() => { setFormItem(undefined); setIsFormOpen(true); }}
                onEdit={(item) => { setFormItem(item); setIsFormOpen(true); }}
                onDelete={deleteItem}
                onDuplicate={duplicateItem}
                onCompare={openCompareWith}
              />
            </PageTransition>
          )}
          {view === 'compare' && (
            <PageTransition key="compare">
              <CompareView
                items={items}
                initialLeftId={compareLeftId}
                initialRightId={compareRightId}
                onSelectDetail={(item) => { setSelectedId(item.id); setView('detail'); }}
              />
            </PageTransition>
          )}
          {view === 'workflows' && (
            <PageTransition key="workflows" className="h-full">
              <WorkflowsView
                onAddToLibrary={(workflowId, phaseId, label, description) => {
                  const item: FolioItem = {
                    id: createId('wf'),
                    title: label,
                    type: 'Command',
                    lifecycle: 'active',
                    flags: { isFavorite: false, isProductionReady: false },
                    description,
                    content: `## ${label}\n\n**Workflow:** ${workflowId}\n**Phase:** ${phaseId}\n\n${description}`,
                    tags: [workflowId, phaseId],
                    rating: { overall: 0, clarity: 0, usefulness: 0, reusability: 0, safety: 0 },
                    notes: '',
                    sourceUrl: '',
                    author: '',
                    license: '',
                    createdAt: nowIso(),
                    updatedAt: nowIso(),
                  };
                  saveItem(item);
                }}
              />
            </PageTransition>
          )}
          {view === 'settings' && (
            <PageTransition key="settings">
              <SettingsView
                items={items}
                theme={theme}
                onThemeChange={setTheme}
                onImportJson={importJson}
                onResetSamples={resetSamples}
              />
            </PageTransition>
          )}
        </AnimatePresence>
      </main>

      <ItemForm
        item={formItem}
        open={isFormOpen}
        onCancel={() => { setIsFormOpen(false); setFormItem(undefined); }}
        onSave={saveItem}
      />
    </div>
  );
}

export default App;
