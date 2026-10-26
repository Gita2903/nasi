'use client';

import { useState } from 'react';
import { CrateEntry } from '@/types/scale';
import { calculateScaleStats, formatWeightWithTon } from '@/lib/scale-calculator';
import {
  PackageCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface ActiveBatchPanelProps {
  batchNumber: number;
  batchName: string;
  activeCrates: CrateEntry[];
  onRemoveCrate: (id: string) => void;
  onFinalizeBatch: (notes?: string) => void;
  onClearActiveCrates: () => void;
}

export default function ActiveBatchPanel({
  batchNumber,
  batchName,
  activeCrates,
  onRemoveCrate,
  onFinalizeBatch,
  onClearActiveCrates,
}: ActiveBatchPanelProps) {
  const [isListExpanded, setIsListExpanded] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);

  const stats = calculateScaleStats(activeCrates);
  const weight = formatWeightWithTon(stats.totalNet);

  const handleConfirmFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCrates.length === 0) return;
    onFinalizeBatch(notes.trim() || undefined);
    setNotes('');
    setIsFinalizing(false);
  };

  return (
    <div className="ios-glass-bright rounded-3xl p-5 sm:p-6 shadow-xl border border-[#F97316]/25 relative overflow-hidden mb-6">
      {/* Glow highlight in Warm Orange #F97316 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F97316] via-[#ea580c] to-[#FBBF24] text-white flex items-center justify-center shadow-md shadow-[#F97316]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FBBF24] px-2 py-0.5 rounded-md bg-[#FBBF24]/15 border border-[#FBBF24]/30">
                Batch #{batchNumber} Aktif
              </span>
              <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight">
                {batchName}
              </h3>
            </div>
            <p className="text-xs text-[#F8FAFC]/50">
              Sedang menimbang krat. Simpan semua krat ini ke riwayat saat selesai.
            </p>
          </div>
        </div>

        {activeCrates.length > 0 && (
          <button
            type="button"
            onClick={onClearActiveCrates}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose-300/80 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Batalkan Sesi</span>
          </button>
        )}
      </div>

      {/* Live Batch Totals Display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 my-4">
        {/* Total Krat */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-[11px] font-medium text-white/60 block">Krat Terkumpul</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-[#F8FAFC] tabular-nums">
              {stats.totalCrates}
            </span>
            <span className="text-xs font-semibold text-white/60">krat</span>
          </div>
        </div>

        {/* Total Bersih (kg) - Primary Orange #F97316 */}
        <div className="p-3 rounded-2xl bg-[#F97316]/15 border border-[#F97316]/30">
          <span className="text-[11px] font-semibold text-orange-200 block">Total Netto (Kg)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-[#F97316] tabular-nums">
              {weight.kgFormatted}
            </span>
            <span className="text-xs font-semibold text-[#F97316]">kg</span>
          </div>
        </div>

        {/* Total Bersih (Ton) - Secondary Emerald #10B981 */}
        <div className="p-3 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30">
          <span className="text-[11px] font-semibold text-emerald-200 block">Total Netto (Ton)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-[#10B981] tabular-nums">
              {weight.tonFormatted}
            </span>
            <span className="text-xs font-semibold text-[#10B981]">ton</span>
          </div>
        </div>

        {/* Rata-rata / Krat - Tertiary Amber #FBBF24 */}
        <div className="p-3 rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/20">
          <span className="text-[11px] font-medium text-amber-200/80 block">Rata-rata/Krat</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-[#FBBF24] tabular-nums">
              {stats.avgNet.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[#FBBF24]">kg</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button: SIMPAN KE RIWAYAT BATCH (Secondary Emerald #10B981) */}
      <div className="mt-2">
        {activeCrates.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-dashed border-white/15 text-center text-xs text-white/50">
            Mulai masukkan berat krat di formulir atas. Setelah krat terkumpul (contoh 10 krat), klik tombol simpan ke riwayat batch di sini.
          </div>
        ) : isFinalizing ? (
          <form
            onSubmit={handleConfirmFinalize}
            className="p-4 rounded-2xl bg-emerald-950/40 border border-[#10B981]/40 space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#10B981]">
                Konfirmasi Simpan Batch #{batchNumber} ({stats.totalCrates} Krat - {weight.combined})
              </span>
              <button
                type="button"
                onClick={() => setIsFinalizing(false)}
                className="text-xs text-white/50 hover:text-white"
              >
                Batal
              </button>
            </div>

            <input
              type="text"
              placeholder="Catatan batch (opsional, contoh: Pengiriman Supermarket A, Matang Sempurna)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl ios-glass-input text-white text-xs placeholder:text-white/40 focus:outline-none"
              autoFocus
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFinalizing(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white/70 hover:bg-white/10"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34d399] hover:to-[#059669] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#10B981]/25 flex items-center justify-center gap-1.5 transition-all"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Ya, Simpan ke Riwayat Batch Sekarang</span>
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsFinalizing(true)}
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] hover:from-[#34d399] hover:to-[#059669] active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#10B981]/25 border border-[#10B981]/40 transition-all duration-150 group"
          >
            <PackageCheck className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span>Simpan ke Riwayat ({stats.totalCrates} Krat · {weight.combined})</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Accordion / List of currently weighed crates in this active batch */}
      {activeCrates.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => setIsListExpanded(!isListExpanded)}
            className="w-full flex items-center justify-between text-xs text-white/60 hover:text-white font-semibold py-1"
          >
            <span>Daftar Krat dalam Batch Berjalan ({activeCrates.length})</span>
            <div className="flex items-center gap-1">
              <span>{isListExpanded ? 'Sembunyikan' : 'Tampilkan'}</span>
              {isListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isListExpanded && (
            <div className="space-y-1.5 mt-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {activeCrates.map((c) => {
                const timeStr = new Date(c.timestamp).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[#F97316]/20 text-[#F97316] font-bold flex items-center justify-center text-[11px] tabular-nums">
                        #{c.crateNumber}
                      </span>
                      <div>
                        <span className="font-semibold text-white">{c.riceType}</span>
                        <div className="text-[10px] text-white/50 flex items-center gap-1.5">
                          <span>Bruto: {c.grossWeight} kg</span>
                          <span>·</span>
                          <span>Tara: {c.tareWeight} kg</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {timeStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="font-black text-[#10B981] tabular-nums">
                          {c.netWeight.toFixed(2)} kg
                        </span>
                        <span className="text-[9px] text-white/40 block">
                          {(c.netWeight / 1000).toFixed(3)} ton
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveCrate(c.id)}
                        className="p-1.5 rounded-lg text-rose-300/60 hover:text-rose-200 hover:bg-rose-500/20 transition-all"
                        title="Hapus Krat Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
