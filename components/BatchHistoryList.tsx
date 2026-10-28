'use client';

import { useState } from 'react';
import { BatchRecord } from '@/types/scale';
import { generateBatchWhatsAppSummary } from '@/lib/scale-calculator';
import { kg, ton, timeId, dateId } from '@/lib/format';

interface BatchHistoryListProps {
  batches: BatchRecord[];
  onDeleteBatch: (id: string) => void;
  onClearAllBatches: () => void;
  onShareBatch: (batch: BatchRecord) => void;
}

export default function BatchHistoryList({
  batches,
  onDeleteBatch,
  onClearAllBatches,
  onShareBatch,
}: BatchHistoryListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [copiedBatchId, setCopiedBatchId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const markCopied = (id: string) => {
    setCopiedBatchId(id);
    setTimeout(() => setCopiedBatchId(null), 2500);
  };

  const handleCopyWA = async (batch: BatchRecord) => {
    const text = generateBatchWhatsAppSummary(batch);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    markCopied(batch.id);
  };

  return (
    <section aria-labelledby="history-heading" className="rounded-lg border border-ink bg-paper">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule p-4 sm:px-5">
        <div>
          <h2 id="history-heading" className="font-cond text-2xl font-bold leading-tight">
            Riwayat batch
          </h2>
          <p className="text-sm text-muted">{batches.length} batch tersimpan</p>
        </div>
        {batches.length > 0 && (
          <button type="button" className="btn btn-sm btn-danger" onClick={onClearAllBatches}>
            Kosongkan riwayat
          </button>
        )}
      </div>

      {batches.length > 2 && (
        <div className="border-b border-rule p-4 sm:px-5">
          <label htmlFor="history-search" className="sr-only">
            Cari batch
          </label>
          <input
            id="history-search"
            type="search"
            placeholder="Cari nomor batch, jenis nasi, atau catatan"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field"
          />
        </div>
      )}

      {batches.length === 0 ? (
        <p className="p-5 text-muted">
          Belum ada batch. Setelah krat terkumpul, tekan Simpan batch ke riwayat. Batch yang disimpan tampil di sini.
        </p>
      ) : filtered.length === 0 ? (
        <p className="p-5 text-muted">Tidak ada batch yang cocok dengan &ldquo;{searchQuery}&rdquo;.</p>
      ) : (
        <ul className="divide-y divide-rule">
          {filtered.map((batch) => {
            const isExpanded = expandedBatchId === batch.id;
            const isCopied = copiedBatchId === batch.id;
            const isConfirming = confirmDeleteId === batch.id;

            return (
              <li key={batch.id} className="p-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <h3 className="font-cond text-xl font-bold leading-tight">{batch.batchName}</h3>
                    <p>{batch.riceType}</p>
                    <p className="text-sm text-muted">
                      {dateId(batch.completedAt)}, {timeId(batch.completedAt)} WIB, oleh {batch.operatorName}
                    </p>
                  </div>
                  <p className="text-right">
                    <span className="font-cond text-3xl font-semibold leading-tight tabular-nums">
                      {kg(batch.totalNetKg)}
                    </span>{' '}
                    <span className="text-muted">kg</span>
                    <br />
                    <span className="text-sm text-muted tabular-nums">
                      {ton(batch.totalNetKg)} ton dari {batch.totalCrates} krat
                    </span>
                    <br />
                    <span className="text-sm font-semibold text-go tabular-nums">
                      {batch.totalPortions.toLocaleString('id-ID')} porsi ({batch.portionGrams} gram/porsi)
                    </span>
                  </p>
                </div>

                <p className="mt-2 text-sm text-muted tabular-nums">
                  Bruto {kg(batch.totalGrossKg)} kg, tara {kg(batch.totalTareKg)} kg, rata-rata {kg(batch.avgNetKg)} kg per krat
                </p>
                {batch.notes && <p className="mt-1 text-sm">Catatan: {batch.notes}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button type="button" className="btn btn-sm" onClick={() => handleCopyWA(batch)}>
                    {isCopied ? 'Tersalin' : 'Salin teks WA'}
                  </button>
                  <button type="button" className="btn btn-sm" onClick={() => onShareBatch(batch)}>
                    Rekap & ekspor
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    aria-expanded={isExpanded}
                    aria-controls={`crates-${batch.id}`}
                    onClick={() => setExpandedBatchId(isExpanded ? null : batch.id)}
                  >
                    {isExpanded ? 'Tutup rincian' : `Rincian ${batch.crates.length} krat`}
                  </button>

                  {isConfirming ? (
                    <span className="ml-auto flex items-center gap-2" role="group" aria-label="Konfirmasi hapus batch">
                      <span className="text-sm">Hapus batch ini?</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger-solid"
                        onClick={() => {
                          onDeleteBatch(batch.id);
                          setConfirmDeleteId(null);
                        }}
                      >
                        Ya, hapus
                      </button>
                      <button type="button" className="btn btn-sm" onClick={() => setConfirmDeleteId(null)}>
                        Batal
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger ml-auto"
                      onClick={() => setConfirmDeleteId(batch.id)}
                      aria-label={`Hapus ${batch.batchName}`}
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div id={`crates-${batch.id}`} className="mt-3 max-h-72 overflow-y-auto rounded-md border border-rule">
                    <table className="w-full text-left">
                      <caption className="sr-only">Rincian krat {batch.batchName}</caption>
                      <thead className="sticky top-0 bg-tile text-sm text-muted">
                        <tr>
                          <th scope="col" className="px-3 py-2 font-medium">
                            Krat
                          </th>
                          <th scope="col" className="px-3 py-2 text-right font-medium">
                            Netto (kg)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rule">
                        {batch.crates.map((c) => (
                          <tr key={c.id}>
                            <td className="px-3 py-2">
                              <span className="font-cond text-lg font-semibold">#{c.crateNumber}</span>
                              <span className="ml-2">{c.riceType}</span>
                              <div className="text-sm text-muted tabular-nums">
                                Bruto {kg(c.grossWeight)} − tara {kg(c.tareWeight)}, {timeId(c.timestamp)}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right font-cond text-xl font-semibold tabular-nums">
                              {kg(c.netWeight)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
