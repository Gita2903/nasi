'use client';

import { useState } from 'react';
import { BatchRecord } from '@/types/scale';
import { formatWeightWithTon, generateBatchWhatsAppSummary } from '@/lib/scale-calculator';
import {
  Layers,
  Search,
  Trash2,
  Share2,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  User,
  Copy,
  Check,
  Calendar,
} from 'lucide-react';

interface BatchHistoryListProps {
  batches: BatchRecord[];
  onDeleteBatch: (id: string) => void;
  onClearAllBatches: () => void;
  onSeedSampleBatches: () => void;
  onShareBatch: (batch: BatchRecord) => void;
}

export default function BatchHistoryList({
  batches,
  onDeleteBatch,
  onClearAllBatches,
  onSeedSampleBatches,
  onShareBatch,
}: BatchHistoryListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [copiedBatchId, setCopiedBatchId] = useState<string | null>(null);

  const filtered = batches.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      `batch #${b.batchNumber}`.includes(q) ||
      b.batchName.toLowerCase().includes(q) ||
      b.riceType.toLowerCase().includes(q) ||
      (b.notes || '').toLowerCase().includes(q)
    );
  });

  const handleCopyWA = async (batch: BatchRecord) => {
    const text = generateBatchWhatsAppSummary(batch);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBatchId(batch.id);
      setTimeout(() => setCopiedBatchId(null), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedBatchId(batch.id);
      setTimeout(() => setCopiedBatchId(null), 2500);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedBatchId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="ios-glass rounded-3xl p-5 sm:p-6 shadow-xl border border-white/15">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/20 text-[#FBBF24] flex items-center justify-center border border-[#FBBF24]/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight">
                Riwayat Batch
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30 tabular-nums">
                {batches.length} Batch Selesai
              </span>
            </div>
            <p className="text-xs text-[#F8FAFC]/50">
              Kumpulan batch yang sudah selesai ditimbang dan disimpan
            </p>
          </div>
        </div>

        {batches.length > 0 && (
          <button
            type="button"
            onClick={onClearAllBatches}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-300/80 flex items-center gap-1 border border-rose-500/20 transition-all"
            title="Hapus Semua Riwayat Batch"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan Riwayat</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      {batches.length > 2 && (
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Cari nomor batch, varian nasi, atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl ios-glass-input text-white text-xs placeholder:text-white/40 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
            >
              Batal
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {batches.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-white/[0.03] border border-dashed border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#F8FAFC]/80">Belum Ada Batch di Riwayat</h3>
          <p className="text-xs text-[#F8FAFC]/50 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            Timbang krat sampai terkumpul (misal 10 krat), lalu klik tombol &ldquo;Simpan ke Riwayat Batch&rdquo; untuk menyimpan 1 batch lengkap.
          </p>
          <button
            type="button"
            onClick={onSeedSampleBatches}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#F97316] bg-[#F97316]/15 hover:bg-[#F97316]/25 border border-[#F97316]/30 active:scale-95 transition-all inline-flex items-center gap-1.5"
          >
            <span>Muat Contoh Riwayat (2 Batch, 15 Krat)</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#F8FAFC]/50">
          Tidak ditemukan batch dengan kata kunci &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        /* List of Batches */
        <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
          {filtered.map((batch) => {
            const isExpanded = expandedBatchId === batch.id;
            const isCopied = copiedBatchId === batch.id;
            const weight = formatWeightWithTon(batch.totalNetKg);

            const dateStr = new Date(batch.completedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const timeStr = new Date(batch.completedAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={batch.id}
                className="rounded-2xl ios-glass hover:bg-white/[0.11] transition-all duration-200 border border-white/10 hover:border-[#F97316]/30 overflow-hidden"
              >
                {/* Batch Header Bar */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Batch Number Icon in Amber/Orange */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F97316]/25 via-[#ea580c]/25 to-[#FBBF24]/25 border border-[#F97316]/30 flex flex-col items-center justify-center shrink-0 shadow-md">
                      <span className="text-[9px] uppercase tracking-wider text-orange-200 font-semibold leading-none">
                        BATCH
                      </span>
                      <span className="text-lg font-black text-white tabular-nums leading-tight">
                        #{batch.batchNumber}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#F8FAFC]">
                          {batch.batchName}
                        </span>
                        <span className="text-[11px] font-medium text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-md border border-[#10B981]/25">
                          {batch.riceType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-white/50 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-white/40" />
                          <span>{dateStr}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white/40" />
                          <span>{timeStr} WIB</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-white/40" />
                          <span>{batch.operatorName}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weight KPI + Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {/* Ton & Kg Highlight */}
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-[#10B981] font-bold uppercase tracking-wider block">
                        Total {batch.totalCrates} Krat
                      </span>
                      <div className="flex items-baseline sm:justify-end gap-1.5">
                        <span className="text-xl sm:text-2xl font-black text-white tabular-nums">
                          {weight.kgFormatted}
                        </span>
                        <span className="text-xs font-bold text-white/60">kg</span>
                        <span className="text-xs font-extrabold text-[#10B981] bg-[#10B981]/20 px-1.5 py-0.5 rounded border border-[#10B981]/30 tabular-nums">
                          {weight.tonFormatted} ton
                        </span>
                      </div>
                    </div>

                    {/* Quick Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyWA(batch)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 active:scale-95 transition-all"
                        title="Salin Laporan WhatsApp Batch"
                        aria-label={`Salin Laporan WA Batch #${batch.batchNumber}`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => onShareBatch(batch)}
                        className="p-2 rounded-xl bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30 active:scale-95 transition-all"
                        title="Buka Menu Laporan / WA"
                        aria-label={`Bagikan Batch #${batch.batchNumber}`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteBatch(batch.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300/80 hover:text-rose-200 border border-rose-500/20 active:scale-95 transition-all"
                        title="Hapus Batch"
                        aria-label={`Hapus Batch #${batch.batchNumber}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-bar with details & Accordion Trigger */}
                <div className="px-4 py-2.5 bg-black/25 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-white/60">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span>Bruto: <strong className="text-white/80 tabular-nums">{batch.totalGrossKg.toLocaleString('id-ID')} kg</strong></span>
                    <span>·</span>
                    <span>Tara: <strong className="text-white/80 tabular-nums">{batch.totalTareKg.toLocaleString('id-ID')} kg</strong></span>
                    <span>·</span>
                    <span>Rata-rata: <strong className="text-amber-300 tabular-nums">{batch.avgNetKg.toLocaleString('id-ID')} kg/krat</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(batch.id)}
                    className="flex items-center gap-1 font-semibold text-[#F97316] hover:text-orange-300 transition-colors py-1"
                  >
                    <span>{isExpanded ? 'Tutup Rincian' : `Lihat ${batch.crates.length} Krat`}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expanded Krat Detail Table */}
                {isExpanded && (
                  <div className="p-4 bg-black/45 border-t border-white/10 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px] font-bold text-white/40 uppercase tracking-wider px-2">
                      <span>No. Krat</span>
                      <span>Bruto - Tara</span>
                      <span>Netto (kg & ton)</span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                      {batch.crates.map((c) => {
                        const time = new Date(c.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return (
                          <div
                            key={c.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-md bg-[#F97316]/15 text-[#F97316] font-bold flex items-center justify-center text-[10px] tabular-nums border border-[#F97316]/25">
                                #{c.crateNumber}
                              </span>
                              <span className="text-[#F8FAFC]/90 font-medium">{c.riceType}</span>
                              <span className="text-[10px] text-white/40">({time})</span>
                            </div>

                            <div className="text-[11px] text-white/50">
                              {c.grossWeight} - {c.tareWeight} kg
                            </div>

                            <div className="text-right">
                              <span className="font-extrabold text-[#10B981] tabular-nums">
                                {c.netWeight.toFixed(2)} kg
                              </span>
                              <span className="text-[10px] text-white/40 ml-1.5 tabular-nums">
                                ({(c.netWeight / 1000).toFixed(3)} ton)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {batch.notes && (
                      <div className="mt-2 text-xs text-amber-200/90 bg-[#FBBF24]/10 px-3 py-1.5 rounded-xl border border-[#FBBF24]/20">
                        <strong>Catatan:</strong> {batch.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
