'use client';

import { useState } from 'react';
import { BatchRecord } from '@/types/scale';
import {
  generateBatchWhatsAppSummary,
  generateAllBatchesWhatsAppSummary,
  generateBatchCSV,
} from '@/lib/scale-calculator';
import Modal from './Modal';

interface ReportModalProps {
  batches: BatchRecord[];
  selectedBatch: BatchRecord | null;
  onClose: () => void;
}

export default function ReportModal({ batches, selectedBatch, onClose }: ReportModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'selected' | 'all'>(selectedBatch ? 'selected' : 'all');

  const currentBatch = selectedBatch || (batches.length > 0 ? batches[0] : null);
  const showSelected = activeTab === 'selected' && currentBatch;
  const waText = showSelected
    ? generateBatchWhatsAppSummary(currentBatch)
    : generateAllBatchesWhatsAppSummary(batches);
  const isEmpty = batches.length === 0;

  const handleCopyWA = async () => {
    try {
      await navigator.clipboard.writeText(waText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = waText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank', 'noopener');
  };

  const handleDownloadCSV = () => {
    const batchesToExport = showSelected ? [currentBatch] : batches;
    const blob = new Blob([generateBatchCSV(batchesToExport)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timbangan-nasi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal onClose={onClose} labelledBy="report-title" widthClass="w-[36rem]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="report-title" className="font-cond text-2xl font-bold leading-tight">
            Rekap untuk WhatsApp
          </h2>
          <p className="text-sm text-muted">Teks siap kirim, berisi jumlah krat, kg, dan ton.</p>
        </div>
        <button type="button" className="btn btn-sm" onClick={onClose}>
          Tutup
        </button>
      </div>

      {selectedBatch && batches.length > 1 && (
        <div role="group" aria-label="Isi rekap" className="mb-3 flex gap-2">
          <button
            type="button"
            className="chip flex-1"
            aria-pressed={activeTab === 'selected'}
            onClick={() => setActiveTab('selected')}
          >
            Batch #{selectedBatch.batchNumber} saja
          </button>
          <button
            type="button"
            className="chip flex-1"
            aria-pressed={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
          >
            Semua {batches.length} batch
          </button>
        </div>
      )}

      {isEmpty ? (
        <p className="rounded-md bg-tile p-4 text-muted">Belum ada batch yang bisa direkap. Simpan satu batch dulu.</p>
      ) : (
        <pre
          tabIndex={0}
          aria-label="Pratinjau teks rekap"
          className="max-h-[45dvh] overflow-y-auto whitespace-pre-wrap rounded-md border border-rule bg-tile p-3 font-mono text-sm leading-relaxed"
        >
          {waText}
        </pre>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="btn" onClick={handleDownloadCSV} disabled={isEmpty}>
          Unduh CSV
        </button>
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={handleOpenWhatsApp} disabled={isEmpty}>
            Buka WhatsApp
          </button>
          <button type="button" className="btn btn-primary" onClick={handleCopyWA} disabled={isEmpty}>
            {copied ? 'Tersalin' : 'Salin teks'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
