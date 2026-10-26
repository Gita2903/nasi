'use client';

import { useState, useEffect } from 'react';
import {
  CrateEntry,
  BatchRecord,
  ScaleSettings,
  DEFAULT_SETTINGS,
  COMMON_RICE_TYPES,
} from '@/types/scale';
import {
  calculateGlobalBatchStats,
  getNextCrateNumber,
  getNextBatchNumber,
  finalizeBatchRecord,
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

const STORAGE_KEY_BATCHES = 'timbangan_nasi_batches_v2';
const STORAGE_KEY_ACTIVE_CRATES = 'timbangan_nasi_active_crates_v2';
const STORAGE_KEY_SETTINGS = 'timbangan_nasi_settings_v2';

// Realistic sample: 10 crates in Batch #1
const SAMPLE_10_CRATES: CrateEntry[] = [
  { id: 'c-1', crateNumber: 1, grossWeight: 26.5, tareWeight: 1.5, netWeight: 25.0, riceType: 'Nasi Putih Pulen', timestamp: 1700000000000 },
  { id: 'c-2', crateNumber: 2, grossWeight: 25.8, tareWeight: 1.5, netWeight: 24.3, riceType: 'Nasi Putih Pulen', timestamp: 1700000100000 },
  { id: 'c-3', crateNumber: 3, grossWeight: 27.2, tareWeight: 1.5, netWeight: 25.7, riceType: 'Nasi Putih Pulen', timestamp: 1700000200000 },
  { id: 'c-4', crateNumber: 4, grossWeight: 26.0, tareWeight: 1.5, netWeight: 24.5, riceType: 'Nasi Putih Pulen', timestamp: 1700000300000 },
  { id: 'c-5', crateNumber: 5, grossWeight: 26.8, tareWeight: 1.5, netWeight: 25.3, riceType: 'Nasi Putih Pulen', timestamp: 1700000400000 },
  { id: 'c-6', crateNumber: 6, grossWeight: 25.9, tareWeight: 1.5, netWeight: 24.4, riceType: 'Nasi Putih Pulen', timestamp: 1700000500000 },
  { id: 'c-7', crateNumber: 7, grossWeight: 27.5, tareWeight: 1.5, netWeight: 26.0, riceType: 'Nasi Putih Pulen', timestamp: 1700000600000 },
  { id: 'c-8', crateNumber: 8, grossWeight: 26.3, tareWeight: 1.5, netWeight: 24.8, riceType: 'Nasi Putih Pulen', timestamp: 1700000700000 },
  { id: 'c-9', crateNumber: 9, grossWeight: 26.7, tareWeight: 1.5, netWeight: 25.2, riceType: 'Nasi Putih Pulen', timestamp: 1700000800000 },
  { id: 'c-10', crateNumber: 10, grossWeight: 26.9, tareWeight: 1.5, netWeight: 25.4, riceType: 'Nasi Putih Pulen', timestamp: 1700000900000 },
];

const INITIAL_BATCHES: BatchRecord[] = [
  finalizeBatchRecord(
    SAMPLE_10_CRATES,
    1,
    'Batch Produksi #1',
    'Operator Dapur',
    'Batch 10 krat nasi putih pulen matang sempurna'
  ),
];

const INITIAL_ACTIVE_CRATES: CrateEntry[] = [
  { id: 'ac-1', crateNumber: 1, grossWeight: 26.5, tareWeight: 1.5, netWeight: 25.0, riceType: 'Nasi Uduk', timestamp: 1700001000000 },
  { id: 'ac-2', crateNumber: 2, grossWeight: 25.8, tareWeight: 1.5, netWeight: 24.3, riceType: 'Nasi Uduk', timestamp: 1700001100000 },
];

export default function HomePage() {
  const [batches, setBatches] = useState<BatchRecord[]>(INITIAL_BATCHES);
  const [activeCrates, setActiveCrates] = useState<CrateEntry[]>(INITIAL_ACTIVE_CRATES);
  const [settings, setSettings] = useState<ScaleSettings>(DEFAULT_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Active Batch Number & Name
  const activeBatchNumber = getNextBatchNumber(batches);
  const activeBatchName = `${settings.defaultBatchPrefix} #${activeBatchNumber}`;

  // Modals state
  const [selectedBatchForReport, setSelectedBatchForReport] = useState<BatchRecord | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Load from local storage after mount safely
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedBatches = localStorage.getItem(STORAGE_KEY_BATCHES);
        const savedActiveCrates = localStorage.getItem(STORAGE_KEY_ACTIVE_CRATES);
        const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);

        if (savedBatches) {
          setBatches(JSON.parse(savedBatches));
        }
        if (savedActiveCrates) {
          setActiveCrates(JSON.parse(savedActiveCrates));
        }
        if (savedSettings) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
        }
      } catch {
        // Fallback
      } finally {
        setIsHydrated(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Sync to local storage after hydration
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(batches));
    } catch {
      // Ignore
    }
  }, [batches, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_CRATES, JSON.stringify(activeCrates));
    } catch {
      // Ignore
    }
  }, [activeCrates, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings, isHydrated]);

  // Derived global stats
  const globalStats = calculateGlobalBatchStats(batches, activeCrates);
  const nextCrateNumber = settings.autoIncrementCrate
    ? getNextCrateNumber(activeCrates)
    : activeCrates.length + 1;

  // Handlers
  const handleAddCrate = (crateData: Omit<CrateEntry, 'id' | 'timestamp'>) => {
    const newCrate: CrateEntry = {
      ...crateData,
      id: `crate-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    setActiveCrates((prev) => [...prev, newCrate]);
  };

  const handleRemoveActiveCrate = (id: string) => {
    setActiveCrates((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearActiveCrates = () => {
    setActiveCrates([]);
  };

  // The critical user requirement: "setelah simpan krat udah banyak contoh 10 krat terus klik simpan ke riwayat. jadi lah 1 batch yang berisi 10 krat"
  const handleFinalizeBatch = (notes?: string) => {
    if (activeCrates.length === 0) return;

    const newBatch = finalizeBatchRecord(
      activeCrates,
      activeBatchNumber,
      activeBatchName,
      settings.operatorName,
      notes
    );

    // Save batch to history
    setBatches((prev) => [newBatch, ...prev]);

    // Reset active crates for next batch
    setActiveCrates([]);
  };

  const handleDeleteBatch = (id: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== id));
  };

  const handleClearAllBatches = () => {
    setBatches([]);
    setActiveCrates([]);
  };

  const handleShareBatch = (batch: BatchRecord) => {
    setSelectedBatchForReport(batch);
    setIsReportOpen(true);
  };

  const handleOpenGlobalReport = () => {
    setSelectedBatchForReport(null);
    setIsReportOpen(true);
  };

  const handleSeedSampleBatches = () => {
    const batch1 = finalizeBatchRecord(
      SAMPLE_10_CRATES,
      1,
      'Batch Produksi #1',
      settings.operatorName,
      'Batch 10 krat nasi putih pulen (0.251 ton)'
    );

    const cratesBatch2: CrateEntry[] = [
      { id: 'b2-1', crateNumber: 1, grossWeight: 26.5, tareWeight: 1.5, netWeight: 25.0, riceType: 'Nasi Uduk', timestamp: Date.now() - 30 * 60000 },
      { id: 'b2-2', crateNumber: 2, grossWeight: 27.2, tareWeight: 1.5, netWeight: 25.7, riceType: 'Nasi Uduk', timestamp: Date.now() - 25 * 60000 },
      { id: 'b2-3', crateNumber: 3, grossWeight: 26.8, tareWeight: 1.5, netWeight: 25.3, riceType: 'Nasi Uduk', timestamp: Date.now() - 20 * 60000 },
      { id: 'b2-4', crateNumber: 4, grossWeight: 26.1, tareWeight: 1.5, netWeight: 24.6, riceType: 'Nasi Uduk', timestamp: Date.now() - 15 * 60000 },
      { id: 'b2-5', crateNumber: 5, grossWeight: 27.0, tareWeight: 1.5, netWeight: 25.5, riceType: 'Nasi Uduk', timestamp: Date.now() - 10 * 60000 },
    ];

    const batch2 = finalizeBatchRecord(
      cratesBatch2,
      2,
      'Batch Produksi #2',
      settings.operatorName,
      'Batch 5 krat nasi gurih uduk'
    );

    setBatches([batch2, batch1]);
    setActiveCrates([]);
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
              onSeedSampleBatches={handleSeedSampleBatches}
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
        onSave={(newSettings) => setSettings(newSettings)}
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
