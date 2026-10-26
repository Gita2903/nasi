'use client';

import { useState, useEffect } from 'react';
import { CrateEntry } from '@/types/scale';
import { calculateNetWeight, validateCrateInput } from '@/lib/scale-calculator';
import { X, Check } from 'lucide-react';

interface EditCrateModalProps {
  entry: CrateEntry | null;
  onClose: () => void;
  onSave: (updated: CrateEntry) => void;
}

export default function EditCrateModal({
  entry,
  onClose,
  onSave,
}: EditCrateModalProps) {
  const [prevEntryId, setPrevEntryId] = useState<string | null>(entry?.id || null);
  const [crateNumber, setCrateNumber] = useState<number>(entry?.crateNumber || 1);
  const [grossWeight, setGrossWeight] = useState<string>(entry?.grossWeight.toString() || '');
  const [tareWeight, setTareWeight] = useState<string>(entry?.tareWeight.toString() || '1.5');
  const [riceType, setRiceType] = useState<string>(entry?.riceType || 'Nasi Putih');
  const [notes, setNotes] = useState<string>(entry?.notes || '');
  const [error, setError] = useState<string | null>(null);

  if (entry && entry.id !== prevEntryId) {
    setPrevEntryId(entry.id);
    setCrateNumber(entry.crateNumber);
    setGrossWeight(entry.grossWeight.toString());
    setTareWeight(entry.tareWeight.toString());
    setRiceType(entry.riceType);
    setNotes(entry.notes || '');
    setError(null);
  }

  if (!entry) return null;

  const parsedGross = parseFloat(grossWeight) || 0;
  const parsedTare = parseFloat(tareWeight) || 0;
  const liveNetto = calculateNetWeight(parsedGross, parsedTare);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCrateInput(crateNumber, parsedGross, parsedTare);
    if (!validation.valid) {
      setError(validation.error || 'Input tidak valid');
      return;
    }

    onSave({
      ...entry,
      crateNumber,
      grossWeight: parsedGross,
      tareWeight: parsedTare,
      netWeight: liveNetto,
      riceType,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md ios-glass-bright rounded-3xl p-6 shadow-2xl border border-white/25 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Edit Krat #{entry.crateNumber}
            </h3>
            <p className="text-xs text-white/50">
              Perbarui berat atau detail krat timbangan
            </p>
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

        {error && (
          <div className="mb-4 px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-crate-number" className="block text-xs font-semibold text-white/80 mb-1">
                No. Krat
              </label>
              <input
                id="edit-crate-number"
                type="number"
                min="1"
                value={crateNumber}
                onChange={(e) => setCrateNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full h-10 px-3 rounded-xl ios-glass-input text-white text-sm font-bold tabular-nums focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-rice-type" className="block text-xs font-semibold text-white/80 mb-1">
                Jenis Nasi
              </label>
              <input
                id="edit-rice-type"
                type="text"
                value={riceType}
                onChange={(e) => setRiceType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl ios-glass-input text-white text-xs focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-gross-weight" className="block text-xs font-semibold text-white/80 mb-1">
                Berat Kotor (kg)
              </label>
              <input
                id="edit-gross-weight"
                type="number"
                step="0.01"
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value)}
                className="w-full h-10 px-3 rounded-xl ios-glass-input text-white text-sm font-bold tabular-nums focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-tare-weight" className="block text-xs font-semibold text-white/80 mb-1">
                Tara Krat (kg)
              </label>
              <input
                id="edit-tare-weight"
                type="number"
                step="0.01"
                value={tareWeight}
                onChange={(e) => setTareWeight(e.target.value)}
                className="w-full h-10 px-3 rounded-xl ios-glass-input text-white text-sm font-bold tabular-nums focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Recalculated Netto Preview */}
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-between">
            <span className="text-xs text-sky-200">Berat Bersih Baru (Netto):</span>
            <span className="text-lg font-black text-sky-300 tabular-nums">
              {liveNetto.toFixed(2)} kg
            </span>
          </div>

          <div>
            <label htmlFor="edit-notes" className="block text-xs font-semibold text-white/80 mb-1">
              Catatan
            </label>
            <input
              id="edit-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan (opsional)"
              className="w-full h-9 px-3 rounded-xl ios-glass-input text-white text-xs placeholder:text-white/30 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-white text-xs font-bold shadow-md shadow-sky-500/25 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
