'use client';

import { useState, useEffect } from 'react';
import {
  CrateEntry,
  BatchRecord,
  ScaleSettings,
  DEFAULT_SETTINGS,
} from '@/types/scale';
import {
  calculateGlobalBatchStats,
  getNextCrateNumber,
  getNextBatchNumber,
} from '@/lib/scale-calculator';
import BackgroundOrbs from '@/components/BackgroundOrbs';
import IPhoneHeader from '@/components/IPhoneHeader';
import MetricIsland from '@/components/MetricIsland';
import ScaleInputForm from '@/components/ScaleInputForm';
import ActiveBatchPanel from '@/components/ActiveBatchPanel';
import BatchHistoryList from '@/components/BatchHistoryList';
import ReportModal from '@/components/ReportModal';
import SettingsModal from '@/components/SettingsModal';
import ConfirmResetModal from '@/components/ConfirmResetModal';

interface AppState {
  batches: BatchRecord[];
  activeCrates: CrateEntry[];
  settings: ScaleSettings;
}

// Every endpoint returns the full fresh state from MySQL.
async function api(url: string, method = 'GET', body?: unknown): Promise<AppState> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal menghubungi server');
  return data;
}

export default function HomePage() {
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [activeCrates, setActiveCrates] = useState<CrateEntry[]>([]);
  const [settings, setSettings] = useState<ScaleSettings>(DEFAULT_SETTINGS);

  // Active Batch Number & Name
  const activeBatchNumber = getNextBatchNumber(batches);
  const activeBatchName = `${settings.defaultBatchPrefix} #${activeBatchNumber}`;

  // Modals state
  const [selectedBatchForReport, setSelectedBatchForReport] = useState<BatchRecord | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const apply = (s: AppState) => {
    setBatches(s.batches);
    setActiveCrates(s.activeCrates);
    setSettings(s.settings);
  };

  // Run an API call, apply fresh state; on failure keep state and tell the user.
  const run = async (url: string, method?: string, body?: unknown) => {
    try {
      apply(await api(url, method, body));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  useEffect(() => {
    api('/api/state')
      .then(apply)
      .catch((e) => alert(`Database error: ${e.message}`));
  }, []);

  // Derived global stats
  const globalStats = calculateGlobalBatchStats(batches, activeCrates);
  const nextCrateNumber = settings.autoIncrementCrate
    ? getNextCrateNumber(activeCrates)
    : activeCrates.length + 1;

  // Handlers
  const handleAddCrate = (crateData: Omit<CrateEntry, 'id' | 'timestamp'>) =>
    run('/api/crates', 'POST', crateData);

  const handleRemoveActiveCrate = (id: string) => run(`/api/crates/${id}`, 'DELETE');

  const handleClearActiveCrates = () => run('/api/crates', 'DELETE');

  // Batch number/name/operator are decided server-side inside one transaction
  const handleFinalizeBatch = (notes?: string) => {
    if (activeCrates.length === 0) return;
    return run('/api/batches', 'POST', { notes });
  };

  const handleDeleteBatch = (id: string) => run(`/api/batches/${id}`, 'DELETE');

  const handleClearAllBatches = () => run('/api/batches', 'DELETE');

  const handleShareBatch = (batch: BatchRecord) => {
    setSelectedBatchForReport(batch);
    setIsReportOpen(true);
  };

  const handleOpenGlobalReport = () => {
    setSelectedBatchForReport(null);
    setIsReportOpen(true);
  };

  return (
    <main className="min-h-screen text-[#F8FAFC] relative pb-16 selection:bg-[#F97316]/30 selection:text-white">
      {/* Background with iOS blur lighting */}
      <BackgroundOrbs />

      {/* Top Header styled like iPhone status bar + glass navigation */}
      <IPhoneHeader
        settings={settings}
        activeBatchNumber={activeBatchNumber}
        batchCount={batches.length}
        activeCrateCount={activeCrates.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenReport={handleOpenGlobalReport}
        onResetSession={() => setIsResetConfirmOpen(true)}
      />

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        {/* iOS Dynamic Island Metric Cards (Global Stats in Kg and Ton) */}
        <MetricIsland stats={globalStats} activeCrateCount={activeCrates.length} />

        {/* 2-Column Responsive Layout:
            Left: Scale Input Form + Active Batch Progress
            Right: Batch History (Riwayat Batch yang berisi kumpulan krat, total kg & ton)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left Column: Form Timbang & Panel Batch Berjalan */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            {/* Form Input Timbangan Per Krat */}
            <ScaleInputForm
              nextCrateNumber={nextCrateNumber}
              settings={settings}
              activeBatchNumber={activeBatchNumber}
              cratesInActiveBatch={activeCrates.length}
              onAddEntry={handleAddCrate}
            />

            {/* Active Batch Summary & "Simpan ke Riwayat Batch" Button */}
            <ActiveBatchPanel
              batchNumber={activeBatchNumber}
              batchName={activeBatchName}
              activeCrates={activeCrates}
              onRemoveCrate={handleRemoveActiveCrate}
              onFinalizeBatch={handleFinalizeBatch}
              onClearActiveCrates={handleClearActiveCrates}
            />
          </div>

          {/* Right Column: Riwayat Batch (1 Baris = 1 Batch lengkap dengan rincian krat) */}
          <div className="lg:col-span-6">
            <BatchHistoryList
              batches={batches}
              onDeleteBatch={handleDeleteBatch}
              onClearAllBatches={() => setIsResetConfirmOpen(true)}
              onShareBatch={handleShareBatch}
            />
          </div>
        </div>

        {/* Clean Footer Metadata (No pill badges) */}
        <footer className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span>Timbangan Nasi Krat</span>
            <span aria-hidden="true">·</span>
            <span>Sistem Input Per Batch</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{batches.length} batch tersimpan ({globalStats.totalCrates} krat)</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Total Produksi: <strong className="text-white/80 tabular-nums">{globalStats.totalNetKg} kg ({globalStats.totalNetTon} ton)</strong></span>
            <span aria-hidden="true">·</span>
            <span>Ekspor WhatsApp & CSV</span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <ReportModal
        batches={batches}
        selectedBatch={selectedBatchForReport}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newSettings) => run('/api/settings', 'PUT', newSettings)}
      />

      <ConfirmResetModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleClearAllBatches}
        entryCount={batches.length}
      />
    </main>
  );
}
