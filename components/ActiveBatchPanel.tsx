'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { CrateEntry } from '@/types/scale';
import { calculatePortions, calculateScaleStats } from '@/lib/scale-calculator';
import { kg, ton, timeId } from '@/lib/format';

interface ActiveBatchPanelProps {
  batchNumber: number;
  batchName: string;
  activeCrates: CrateEntry[];
  onRemoveCrate: (id: string) => void;
  onFinalizeBatch: (notes?: string) => void;
  onClearActiveCrates: () => void;
  portionGrams: number;
}

export default function ActiveBatchPanel({
  batchNumber,
  batchName,
  activeCrates,
  onRemoveCrate,
  onFinalizeBatch,
  onClearActiveCrates,
  portionGrams,
}: ActiveBatchPanelProps) {
  const [notes, setNotes] = useState<string>('');
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const stats = calculateScaleStats(activeCrates);
  const newestFirst = [...activeCrates].reverse();

  const handleConfirmFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCrates.length === 0) return;
    onFinalizeBatch(notes.trim() || undefined);
    setNotes('');
    setIsFinalizing(false);
  };

  return (
    <section aria-labelledby="active-heading" className="rounded-lg border border-ink bg-paper">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule p-4 sm:px-5">
        <div>
          <h2 id="active-heading" className="font-cond text-2xl font-bold leading-tight">
            Batch #{batchNumber} sedang berjalan
          </h2>
          <p className="text-sm text-muted">{batchName}</p>
        </div>

        {activeCrates.length > 0 &&
          (confirmClear ? (
            <div className="flex items-center gap-2" role="group" aria-label="Konfirmasi hapus semua krat">
              <span className="text-sm">Hapus {activeCrates.length} krat?</span>
              <button
                type="button"
                className="btn btn-sm btn-danger-solid"
                onClick={() => {
                  onClearActiveCrates();
                  setConfirmClear(false);
                }}
              >
                Ya, hapus
              </button>
              <button type="button" className="btn btn-sm" onClick={() => setConfirmClear(false)}>
                Batal
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-sm btn-danger" onClick={() => setConfirmClear(true)}>
              Hapus semua krat
            </button>
          ))}
      </div>

      <dl className="grid grid-cols-3 gap-4 border-b border-rule p-4 sm:px-5">
        <div>
          <dt className="text-sm text-muted">Krat</dt>
          <dd className="font-cond text-3xl font-semibold leading-tight tabular-nums">{stats.totalCrates}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Netto</dt>
          <dd className="font-cond text-3xl font-semibold leading-tight tabular-nums">
            {kg(stats.totalNet)} <span className="font-sans text-base font-medium text-muted">kg</span>
          </dd>
          <dd className="text-sm text-muted tabular-nums">{ton(stats.totalNet)} ton</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Rata-rata per krat</dt>
          <dd className="font-cond text-3xl font-semibold leading-tight tabular-nums">
            {kg(stats.avgNet)} <span className="font-sans text-base font-medium text-muted">kg</span>
          </dd>
        </div>
      </dl>

      {activeCrates.length === 0 ? (
        <p className="p-5 text-muted">
          Belum ada krat. Isi bruto di panel timbang, lalu tekan Catat krat. Krat yang tercatat muncul di sini.
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Krat di batch yang sedang berjalan, terbaru di atas</caption>
            <thead className="sticky top-0 bg-paper text-sm text-muted">
              <tr className="border-b border-rule">
                <th scope="col" className="py-2 pl-4 font-medium sm:pl-5">
                  Krat
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Netto (kg)
                </th>
                <th scope="col" className="w-14 pr-2">
                  <span className="sr-only">Hapus</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {newestFirst.map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5 pl-4 sm:pl-5">
                    <span className="font-cond text-xl font-semibold">#{c.crateNumber}</span>
                    <span className="ml-2">{c.riceType}</span>
                    <div className="text-sm text-muted tabular-nums">
                      Bruto {kg(c.grossWeight)} − tara {kg(c.tareWeight)}, {timeId(c.timestamp)}
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-cond text-2xl font-semibold tabular-nums">
                    {kg(c.netWeight)}
                  </td>
                  <td className="pr-2 text-right">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => onRemoveCrate(c.id)}
                      aria-label={`Hapus krat #${c.crateNumber}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-rule p-4 sm:px-5">
        {isFinalizing ? (
          <form onSubmit={handleConfirmFinalize} className="space-y-3">
            <p className="font-medium">
              Simpan Batch #{batchNumber}: {stats.totalCrates} krat, {kg(stats.totalNet)} kg ({ton(stats.totalNet)} ton), {calculatePortions(stats.totalNet, portionGrams).toLocaleString('id-ID')} porsi?
            </p>
            <label htmlFor="batch-notes" className="block text-sm font-medium">
              Catatan batch <span className="font-normal text-muted">(boleh kosong)</span>
            </label>
            <input
              id="batch-notes"
              type="text"
              placeholder="Contoh: kiriman toko A"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
              className="field"
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                Simpan batch
              </button>
              <button type="button" className="btn" onClick={() => setIsFinalizing(false)}>
                Kembali
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="btn btn-primary min-h-12 w-full text-base"
            disabled={activeCrates.length === 0}
            onClick={() => setIsFinalizing(true)}
          >
            Simpan batch ke riwayat
          </button>
        )}
      </div>
    </section>
  );
}
