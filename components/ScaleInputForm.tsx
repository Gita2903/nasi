'use client';

import { useRef, useState } from 'react';
import {
  CrateEntry,
  ScaleSettings,
  COMMON_RICE_TYPES,
  COMMON_TARE_PRESETS,
} from '@/types/scale';
import { calculateNetWeight, validateCrateInput } from '@/lib/scale-calculator';
import { kg } from '@/lib/format';

interface ScaleInputFormProps {
  nextCrateNumber: number;
  settings: ScaleSettings;
  activeBatchNumber: number;
  cratesInActiveBatch: number;
  onAddEntry: (entry: Omit<CrateEntry, 'id' | 'timestamp'>) => void;
}

export default function ScaleInputForm({
  nextCrateNumber,
  settings,
  activeBatchNumber,
  cratesInActiveBatch,
  onAddEntry,
}: ScaleInputFormProps) {
  const [prevNextCrateNumber, setPrevNextCrateNumber] = useState(nextCrateNumber);
  const [crateNumber, setCrateNumber] = useState<number>(nextCrateNumber);

  if (prevNextCrateNumber !== nextCrateNumber) {
    setPrevNextCrateNumber(nextCrateNumber);
    setCrateNumber(nextCrateNumber);
  }

  const [prevDefaultTare, setPrevDefaultTare] = useState(settings.defaultTare);
  const [tareWeight, setTareWeight] = useState<number>(settings.defaultTare);

  if (prevDefaultTare !== settings.defaultTare) {
    setPrevDefaultTare(settings.defaultTare);
    setTareWeight(settings.defaultTare);
  }

  const [grossInput, setGrossInput] = useState<string>('');
  const [riceType, setRiceType] = useState<string>(COMMON_RICE_TYPES[0]);
  const [customRiceType, setCustomRiceType] = useState<string>('');
  const [isCustomRice, setIsCustomRice] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const grossRef = useRef<HTMLInputElement>(null);

  const parsedGross = parseFloat(grossInput) || 0;
  const liveNetto = calculateNetWeight(parsedGross, tareWeight);

  // Gentle audio feedback using Web Audio API
  const playBeep = (freq: number = 587.33, duration: number = 0.08) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio restriction gracefully
    }
  };

  const handleQuickAdd = (val: number) => {
    playBeep(440, 0.04);
    const current = parseFloat(grossInput) || 0;
    const nextVal = Math.round((current + val) * 100) / 100;
    setGrossInput(nextVal.toString());
    setError(null);
  };

  const handleSetPreset = (val: number) => {
    playBeep(520, 0.05);
    setGrossInput(val.toString());
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRiceType = isCustomRice && customRiceType.trim() ? customRiceType.trim() : riceType;
    const validation = validateCrateInput(crateNumber, parsedGross, tareWeight);

    if (!validation.valid) {
      setError(validation.error || 'Input tidak valid');
      playBeep(220, 0.15);
      grossRef.current?.focus();
      return;
    }

    const netWeight = calculateNetWeight(parsedGross, tareWeight);
    onAddEntry({
      crateNumber,
      grossWeight: parsedGross,
      tareWeight,
      netWeight,
      riceType: finalRiceType,
      notes: notes.trim() || undefined,
    });

    playBeep(880, 0.12);
    setSuccessToast(`Krat #${crateNumber} tercatat di Batch #${activeBatchNumber}: netto ${kg(netWeight)} kg`);
    setTimeout(() => setSuccessToast(null), 3500);

    // Reset input for next crate, keep the cursor on the weight field
    setGrossInput('');
    setNotes('');
    setError(null);
    grossRef.current?.focus();
  };

  return (
    <section aria-labelledby="scale-heading" className="rounded-lg border border-ink bg-paper p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="scale-heading" className="font-cond text-2xl font-bold leading-tight">
            Timbang krat
          </h2>
          <p className="text-sm text-muted">
            Batch #{activeBatchNumber}, krat ke-{cratesInActiveBatch + 1}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-pressed={soundEnabled}
          className="link-btn mt-1"
        >
          Bunyi bip: {soundEnabled ? 'nyala' : 'mati'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Angka timbangan: bruto dikurangi tara sama dengan netto */}
        <div className="slab p-4">
          <label htmlFor="gross-weight" className="text-sm text-white/75">
            Bruto, angka di timbangan
          </label>
          <div className="flex items-baseline gap-2 border-b border-white/25 pb-2">
            <input
              id="gross-weight"
              ref={grossRef}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.1"
              placeholder="0,00"
              value={grossInput}
              onChange={(e) => {
                setGrossInput(e.target.value);
                setError(null);
              }}
              autoFocus
              className="w-full min-w-0 bg-transparent font-cond text-6xl font-semibold leading-none tabular-nums text-white placeholder:text-white/30 focus:outline-none"
            />
            <span className="font-cond text-2xl text-white/75">kg</span>
          </div>

          <div className="flex items-baseline justify-between pt-2 text-white/80">
            <span>Tara krat kosong</span>
            <span className="font-cond text-2xl tabular-nums">− {kg(tareWeight)} kg</span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-white/25 pt-3">
            <span className="text-lg font-semibold">Netto</span>
            <span className="font-cond text-6xl font-bold leading-none tabular-nums text-mint" aria-live="polite">
              {kg(liveNetto)}
              <span className="ml-2 text-2xl font-semibold">kg</span>
            </span>
          </div>
        </div>

        {/* Isi cepat bruto */}
        <div className="space-y-3">
          <div>
            <p id="add-label" className="mb-2 text-sm font-medium">
              Tambah ke bruto (kg)
            </p>
            <div role="group" aria-labelledby="add-label" className="flex flex-wrap gap-2">
              {[0.1, 0.5, 1, 5].map((delta) => (
                <button key={delta} type="button" className="chip" onClick={() => handleQuickAdd(delta)}>
                  +{String(delta).replace('.', ',')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p id="preset-label" className="mb-2 text-sm font-medium">
              Atau isi langsung
            </p>
            <div role="group" aria-labelledby="preset-label" className="flex flex-wrap gap-2">
              {[20, 25, 30].map((preset) => (
                <button key={preset} type="button" className="chip" onClick={() => handleSetPreset(preset)}>
                  {preset} kg
                </button>
              ))}
              <button type="button" className="chip" onClick={() => setGrossInput('')} disabled={!grossInput}>
                Kosongkan
              </button>
            </div>
          </div>
        </div>

        {/* Tara */}
        <div>
          <p id="tare-label" className="mb-2 text-sm font-medium">
            Tara krat kosong
          </p>
          <div role="group" aria-labelledby="tare-label" className="flex flex-wrap gap-2">
            {COMMON_TARE_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tareWeight === t}
                className="chip"
                onClick={() => {
                  setTareWeight(t);
                  playBeep(480, 0.04);
                }}
              >
                {t === 0 ? 'Tanpa tara' : `${kg(t)} kg`}
              </button>
            ))}
          </div>
        </div>

        {/* Nomor krat */}
        <div>
          <label htmlFor="crate-number" className="mb-2 block text-sm font-medium">
            Nomor krat
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCrateNumber((prev) => Math.max(1, prev - 1))}
              aria-label="Kurangi nomor krat"
              className="btn w-12 px-0 text-xl"
            >
              −
            </button>
            <input
              id="crate-number"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={crateNumber || ''}
              onChange={(e) => setCrateNumber(parseInt(e.target.value, 10) || 1)}
              className="field w-24 text-center text-lg font-semibold tabular-nums"
              required
            />
            <button
              type="button"
              onClick={() => setCrateNumber((prev) => prev + 1)}
              aria-label="Tambah nomor krat"
              className="btn w-12 px-0 text-xl"
            >
              +
            </button>
          </div>
        </div>

        {/* Jenis nasi */}
        <div>
          <p id="rice-label" className="mb-2 text-sm font-medium">
            Jenis nasi
          </p>
          <div role="group" aria-labelledby="rice-label" className="flex flex-wrap gap-2">
            {COMMON_RICE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={!isCustomRice && riceType === type}
                className="chip"
                onClick={() => {
                  setRiceType(type);
                  setIsCustomRice(false);
                  playBeep(500, 0.03);
                }}
              >
                {type}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={isCustomRice}
              className="chip"
              onClick={() => setIsCustomRice(true)}
            >
              Lainnya
            </button>
          </div>
          {isCustomRice && (
            <input
              type="text"
              aria-label="Nama jenis nasi"
              placeholder="Contoh: Nasi liwet"
              value={customRiceType}
              onChange={(e) => setCustomRiceType(e.target.value)}
              maxLength={80}
              className="field mt-2"
            />
          )}
        </div>

        {/* Catatan */}
        <div>
          <label htmlFor="notes" className="mb-2 block text-sm font-medium">
            Catatan krat <span className="font-normal text-muted">(boleh kosong)</span>
          </label>
          <input
            id="notes"
            type="text"
            placeholder="Contoh: krat seri B"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
            className="field"
          />
        </div>

        {successToast && (
          <p role="status" className="rounded-md border border-go bg-go-wash px-3 py-2 text-sm font-medium text-go">
            {successToast}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-md border border-danger bg-danger-wash px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary min-h-14 w-full text-lg">
          Catat krat #{crateNumber}
        </button>
      </form>
    </section>
  );
}
