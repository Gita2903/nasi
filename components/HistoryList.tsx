'use client';

import { useState } from 'react';
import { CrateEntry } from '@/types/scale';
import { History, Search, Trash2, Edit3, ArrowUpDown, Clock, FileText, CheckCircle2 } from 'lucide-react';

interface HistoryListProps {
  entries: CrateEntry[];
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: CrateEntry) => void;
  onSeedSampleData: () => void;
  onClearAll: () => void;
}

export default function HistoryList({
  entries,
  onDeleteEntry,
  onEditEntry,
  onSeedSampleData,
  onClearAll,
}: HistoryListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter entries
  const filtered = entries.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchNumber = `krat ${e.crateNumber}`.includes(q) || e.crateNumber.toString().includes(q);
    const matchRice = e.riceType.toLowerCase().includes(q);
    const matchNotes = (e.notes || '').toLowerCase().includes(q);
    return matchNumber || matchRice || matchNotes;
  });

  // Sort entries: by timestamp or crateNumber
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.timestamp - a.timestamp;
    }
    return a.crateNumber - b.crateNumber;
  });

  return (
    <div className="ios-glass rounded-3xl p-5 sm:p-6 shadow-xl border border-white/15">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/20">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Riwayat Input
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80 tabular-nums border border-white/10">
                {entries.length} Krat
              </span>
            </div>
            <p className="text-xs text-white/50">
              Daftar catatan timbangan setiap krat
            </p>
          </div>
        </div>

        {/* Sort & Batch Controls */}
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white/80 flex items-center gap-1 border border-white/10 transition-all"
              title="Ganti Urutan"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
              <span>{sortOrder === 'desc' ? 'Terbaru' : 'No. Urut'}</span>
            </button>
          )}

          {entries.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-300/80 flex items-center gap-1 border border-rose-500/20 transition-all"
              title="Hapus Semua Riwayat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kosongkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar (if has entries) */}
      {entries.length > 3 && (
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Cari nomor krat atau jenis nasi..."
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
      {entries.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-white/[0.03] border border-dashed border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white/80">Belum Ada Timbangan Krat</h3>
          <p className="text-xs text-white/50 max-w-xs mx-auto mt-1 mb-4">
            Masukkan berat kotor di formulir atas dan klik &ldquo;Simpan Krat&rdquo; untuk mulai mencatat.
          </p>
          <button
            type="button"
            onClick={onSeedSampleData}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/20 active:scale-95 transition-all inline-flex items-center gap-1.5"
          >
            <span>Muat Contoh Data (5 Krat)</span>
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-8 text-center text-xs text-white/50">
          Tidak ada krat yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        /* List of Crates */
        <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
          {sorted.map((item) => {
            const timeString = new Date(item.timestamp).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="group p-3.5 sm:p-4 rounded-2xl ios-glass hover:bg-white/[0.12] transition-all duration-200 border border-white/10 hover:border-white/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                {/* Left: Krat badge + details */}
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <span className="text-[9px] uppercase tracking-wider text-white/50 font-semibold leading-none">
                      KRAT
                    </span>
                    <span className="text-base font-extrabold text-white tabular-nums leading-tight">
                      #{item.crateNumber}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">
                        {item.riceType}
                      </span>
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="tabular-nums">{timeString} WIB</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                      <span>Bruto: <strong className="text-white/80 tabular-nums">{item.grossWeight} kg</strong></span>
                      <span aria-hidden="true" className="text-white/20">·</span>
                      <span>Tara: <strong className="text-white/80 tabular-nums">{item.tareWeight} kg</strong></span>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-amber-200/80 mt-1 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block border border-amber-400/20">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Netto weight & Action triggers */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-sky-400/80 uppercase font-semibold block leading-none">
                      Netto Bersih
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl font-black text-sky-300 tabular-nums">
                        {item.netWeight.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-sky-400">kg</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditEntry(item)}
                      aria-label={`Edit Krat #${item.crateNumber}`}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 active:scale-95 transition-all"
                      title="Edit Data"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(item.id)}
                      aria-label={`Hapus Krat #${item.crateNumber}`}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300/80 hover:text-rose-200 border border-rose-500/20 active:scale-95 transition-all"
                      title="Hapus Krat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
