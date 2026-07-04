import { useState } from 'react';
import type { FolioItem, ThemePreference } from '../../types';
import { exportItems } from '../../lib/storage';
import { Button } from '../ui/Button';
import { ArrowLineDown, ArrowLineUp, Sun, Moon, GearSix, ArrowClockwise } from '@phosphor-icons/react';

type SettingsViewProps = {
  items: FolioItem[];
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  onImportJson: (file?: File) => void;
  onResetSamples: () => void;
};

const themes: { value: ThemePreference; label: string; icon: typeof Sun; description: string }[] = [
  { value: 'system', label: 'System', icon: GearSix, description: 'Follows your device setting' },
  { value: 'light', label: 'Light', icon: Sun, description: 'Warm off-white background' },
  { value: 'dark', label: 'Dark', icon: Moon, description: 'Deep charcoal background' },
];

export function SettingsView({ items, theme, onThemeChange, onImportJson, onResetSamples }: SettingsViewProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="m-0 text-xs font-[750] tracking-[0.1em] uppercase text-accent">Preferences</p>
        <h1 className="m-0 mt-1 text-3xl md:text-5xl font-[700] tracking-tighter text-text">Settings</h1>
        <p className="m-0 mt-2 text-sm text-muted max-w-[65ch] leading-relaxed">Control appearance and move your local Folio library between browsers or devices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="border border-border rounded-[22px] bg-surface p-5">
          <h2 className="m-0 text-lg font-[650] tracking-tight text-text">Appearance</h2>
          <p className="m-0 mt-1 text-sm text-muted leading-relaxed">Folio uses system theme by default, then follows manual override when selected.</p>
          <div className="flex items-center gap-3 mt-4">
            {themes.map((t) => {
              const Icon = t.icon;
              const active = theme === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onThemeChange(t.value)}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-[14px] border text-center cursor-pointer transition-colors duration-150 ${
                    active
                      ? 'bg-accent-soft border-accent text-text'
                      : 'bg-surface-subtle border-border text-muted hover:text-text hover:border-border-strong'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-sm font-[650]">{t.label}</span>
                  <span className="text-[11px] text-muted leading-tight">{t.description}</span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="border border-border rounded-[22px] bg-surface p-5">
          <h2 className="m-0 text-lg font-[650] tracking-tight text-text">Backup</h2>
          <p className="m-0 mt-1 text-sm text-muted leading-relaxed">Export or import your full local library as JSON. Markdown export is available per item.</p>
          <div className="flex items-center gap-3 mt-4">
            <Button variant="secondary" onClick={() => exportItems(items)}>
              <ArrowLineUp size={16} />
              Export JSON
            </Button>

            <label
              className={`relative flex-1 flex items-center justify-center gap-2 min-h-[40px] px-[14px] rounded-[10px] text-sm font-[650] border border-dashed cursor-pointer transition-colors duration-150 ${
                dragOver
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border-strong text-muted hover:text-text hover:border-border'
              }`}
              onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                onImportJson(event.dataTransfer.files?.[0]);
              }}
            >
              <ArrowLineDown size={16} />
              Import JSON
              <input
                type="file"
                accept="application/json,.json"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(event) => onImportJson(event.target.files?.[0])}
              />
            </label>
          </div>
        </article>

        <article className="border border-border rounded-[22px] bg-surface p-5 col-span-1 md:col-span-2">
          <h2 className="m-0 text-lg font-[650] tracking-tight text-text">Sample data</h2>
          <p className="m-0 mt-1 text-sm text-muted leading-relaxed">Restore the built-in examples. This replaces your current local library.</p>
          <div className="mt-4">
            <Button variant="danger" onClick={onResetSamples}>
              <ArrowClockwise size={16} />
              Reset to samples
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}
