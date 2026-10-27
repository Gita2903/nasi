'use client';

import { ScaleSettings } from '@/types/scale';

interface AppHeaderProps {
  settings: ScaleSettings;
  batchCount: number;
  onOpenSettings: () => void;
  onOpenReport: () => void;
}

export default function AppHeader({ settings, batchCount, onOpenSettings, onOpenReport }: AppHeaderProps) {
  return (
    <header className="border-b border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div>
          <h1 className="font-cond text-3xl font-bold leading-none tracking-tight">Timbangan Nasi</h1>
          <p className="mt-1 text-sm text-muted">Petugas: {settings.operatorName}</p>
        </div>
        <nav aria-label="Menu utama" className="flex gap-2">
          <button type="button" className="btn btn-sm" onClick={onOpenReport}>
            Rekap WA{batchCount > 0 ? ` (${batchCount})` : ''}
          </button>
          <button type="button" className="btn btn-sm" onClick={onOpenSettings}>
            Pengaturan
          </button>
        </nav>
      </div>
    </header>
  );
}
