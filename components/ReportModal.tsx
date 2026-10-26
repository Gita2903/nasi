'use client';

import { useState } from 'react';
import { BatchRecord } from '@/types/scale';
import {
  generateBatchWhatsAppSummary,
  generateAllBatchesWhatsAppSummary,
  generateBatchCSV,
} from '@/lib/scale-calculator';
import { X, Copy, Check, Download, MessageSquare, Share2 } from 'lucide-react';

interface ReportModalProps {
  batches: BatchRecord[];
  selectedBatch: BatchRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({
  batches,
  selectedBatch,
  isOpen,
  onClose,
}: ReportModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'selected' | 'all'>(selectedBatch ? 'selected' : 'all');

  if (!isOpen) return null;

  // Determine what text to show
  const currentBatch = selectedBatch || (batches.length > 0 ? batches[0] : null);
  const waText =
    activeTab === 'selected' && currentBatch
      ? generateBatchWhatsAppSummary(currentBatch)
      : generateAllBatchesWhatsAppSummary(batches);

  const handleCopyWA = async () => {
    try {
      await navigator.clipboard.writeText(waText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = waText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(waText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleDownloadCSV = () => {
    const batchesToExport = activeTab === 'selected' && currentBatch ? [currentBatch] : batches;
    const csvContent = generateBatchCSV(batchesToExport);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timbangan-nasi-batch-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg ios-glass-bright rounded-3xl p-6 shadow-2xl border border-white/25 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F97316]/20 text-[#F97316] flex items-center justify-center border border-[#F97316]/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">
                Laporan & Ekspor WhatsApp
              </h3>
              <p className="text-xs text-white/50">
                Format rapi berisi total krat, kg, dan ton siap kirim
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Dialog"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch if both selectedBatch and batches exist */}
        {selectedBatch && batches.length > 1 && (
          <div className="flex items-center gap-1 p-1 bg-black/35 rounded-xl my-3 shrink-0 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('selected')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'selected'
                  ? 'bg-[#F97316] text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Batch #{selectedBatch.batchNumber} Saja
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-[#F97316] text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Semua {batches.length} Batch
            </button>
          </div>
        )}

        {/* Formatted Text Preview */}
        <div className="flex-1 overflow-y-auto custom-scrollbar my-2 p-3.5 rounded-xl bg-black/45 border border-white/10 font-mono text-xs text-white/85 whitespace-pre-wrap leading-relaxed select-all">
          {waText}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-white/10 shrink-0 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDownloadCSV}
            disabled={batches.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center gap-1.5 transition-all border border-white/10"
          >
            <Download className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>Ekspor CSV</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              disabled={batches.length === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 active:scale-95 flex items-center gap-1.5 shadow-md shadow-[#10B981]/30 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Buka WA</span>
            </button>

            <button
              type="button"
              onClick={handleCopyWA}
              disabled={batches.length === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#F97316] hover:bg-[#ea580c] disabled:opacity-40 active:scale-95 flex items-center gap-1.5 shadow-md shadow-[#F97316]/30 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
