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
import AppHeader from '@/components/AppHeader';
import SummaryStrip from '@/components/SummaryStrip';
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
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portionGrams, setPortionGrams] = useState(150);

  const handlePortionGramsChange = (value: number) => setPortionGrams(value);

  const handleFinalizeBatch = (notes?: string) => {
    if (activeCrates.length === 0) return;
    return run('/api/batches', 'POST', { notes, portionGrams });
  };

  // Active Batch Number & Name
  const activeBatchNumber = getNextBatchNumber(batches);
  const activeBatchName = `${settings.defaultBatchPrefix} #${activeBatchNumber}`;

  // Modals are mounted only while open, so their form state starts from fresh props
  const [reportBatch, setReportBatch] = useState<BatchRecord | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const apply = (s: AppState) => {
    setBatches(s.batches);
    setActiveCrates(s.activeCrates);
    setSettings(s.settings);
  };

  // Run an API call, apply fresh state; on failure keep state and show the reason.
  const run = async (url: string, method?: string, body?: unknown) => {
    try {
      apply(await api(url, method, body));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    api('/api/state')
      .then((s) => {
        apply(s);
        setError(null);
      })
      .catch((e) => setError(`Tidak bisa membaca database: ${e.message}`))
      .finally(() => setLoaded(true));
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
  const handleDeleteBatch = (id: string) => run(`/api/batches/${id}`, 'DELETE');

  const handleClearAllBatches = () => run('/api/batches', 'DELETE');

  const openBatchReport = (batch: BatchRecord) => {
    setReportBatch(batch);
    setIsReportOpen(true);
  };

  const openGlobalReport = () => {
    setReportBatch(null);
    setIsReportOpen(true);
  };

  return (
    <>
      <AppHeader
        settings={settings}
        batchCount={batches.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenReport={openGlobalReport}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6" aria-busy={!loaded}>
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-md border border-danger bg-danger-wash px-4 py-3 text-danger"
          >
            <p className="font-medium">{error}</p>
            <button type="button" className="link-btn text-danger" onClick={() => setError(null)}>
              Tutup
            </button>
          </div>
        )}

        <SummaryStrip stats={globalStats} activeCrateCount={activeCrates.length} />

        <div className="grid items-start gap-6 lg:grid-cols-[26rem_minmax(0,1fr)]">
          <ScaleInputForm
            nextCrateNumber={nextCrateNumber}
            settings={settings}
            activeBatchNumber={activeBatchNumber}
            cratesInActiveBatch={activeCrates.length}
            portionGrams={portionGrams}
            onPortionGramsChange={handlePortionGramsChange}
            onAddEntry={handleAddCrate}
          />

          <div className="space-y-6">
            {loaded ? (
              <>
                <ActiveBatchPanel
                  batchNumber={activeBatchNumber}
                  batchName={activeBatchName}
                  activeCrates={activeCrates}
                  onRemoveCrate={handleRemoveActiveCrate}
                  onFinalizeBatch={handleFinalizeBatch}
                  onClearActiveCrates={handleClearActiveCrates}
                  portionGrams={portionGrams}
                />
                <BatchHistoryList
                  batches={batches}
                  onDeleteBatch={handleDeleteBatch}
                  onClearAllBatches={() => setIsResetConfirmOpen(true)}
                  onShareBatch={openBatchReport}
                />
              </>
            ) : (
              <p className="rounded-lg border border-rule bg-paper p-5 text-muted">Memuat data dari database...</p>
            )}
          </div>
        </div>
      </main>

      {isReportOpen && (
        <ReportModal batches={batches} selectedBatch={reportBatch} onClose={() => setIsReportOpen(false)} />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(newSettings) => run('/api/settings', 'PUT', newSettings)}
        />
      )}

      {isResetConfirmOpen && (
        <ConfirmResetModal
          batchCount={batches.length}
          onClose={() => setIsResetConfirmOpen(false)}
          onConfirm={handleClearAllBatches}
        />
      )}
    </>
  );
}
