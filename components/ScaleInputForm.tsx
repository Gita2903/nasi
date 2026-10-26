'use client';

import { useState } from 'react';
import {
  CrateEntry,
  ScaleSettings,
  COMMON_RICE_TYPES,
  COMMON_TARE_PRESETS,
} from '@/types/scale';
import { calculateNetWeight, validateCrateInput } from '@/lib/scale-calculator';
import { Check, Scale, Tag, CornerDownLeft, Volume2, VolumeX } from 'lucide-react';

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
    setSuccessToast(`Krat #${crateNumber} dimasukkan ke Batch #${activeBatchNumber}! Netto: ${netWeight} kg`);
    setTimeout(() => setSuccessToast(null), 3000);

    // Reset input for next crate
    setGrossInput('');
    setNotes('');
    setError(null);
  };

  return (
    <div className="ios-glass-bright rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-2xl border border-white/20">
      {/* Subtle top glare effect matching Primary #F97316 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F97316]/50 to-transparent" />

      {/* Form Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F97316]/20 text-[#F97316] flex items-center justify-center border border-[#F97316]/30">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight">
                Input Krat
              </h2>
              <span className="text-[10px] font-bold text-[#F97316] bg-[#F97316]/15 px-2 py-0.5 rounded-full border border-[#F97316]/30">
                Batch #{activeBatchNumber}
              </span>
            </div>
            <p className="text-xs text-[#F8FAFC]/50">
              Krat ke-{cratesInActiveBatch + 1} dalam batch ini. Tara otomatis terpotong.
            </p>
          </div>
        </div>

        {/* Audio feedback toggle */}
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-label={soundEnabled ? 'Matikan Suara Beep' : 'Nyalakan Suara Beep'}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs flex items-center gap-1 border border-white/10"
          title={soundEnabled ? 'Suara aktif' : 'Suara bisu'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#10B981]" /> : <VolumeX className="w-4 h-4 text-white/40" />}
        </button>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-emerald-100 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Nomor Krat & Tara Krat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Crate Number */}
          <div>
            <label htmlFor="crate-number" className="block text-xs font-semibold text-[#F8FAFC]/80 mb-1.5">
              Nomor Urut Krat
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCrateNumber((prev) => Math.max(1, prev - 1))}
                aria-label="Kurangi Nomor Krat"
                className="w-10 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[#F8FAFC] font-bold text-lg flex items-center justify-center transition-all border border-white/10"
              >
                -
              </button>
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40">
                  Krat #
                </span>
                <input
                  id="crate-number"
                  type="number"
                  min="1"
                  step="1"
                  value={crateNumber || ''}
                  onChange={(e) => setCrateNumber(parseInt(e.target.value, 10) || 1)}
                  className="w-full h-11 pl-16 pr-3 rounded-xl ios-glass-input text-[#F8FAFC] text-base font-bold tabular-nums focus:outline-none transition-all"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setCrateNumber((prev) => prev + 1)}
                aria-label="Tambah Nomor Krat"
                className="w-10 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[#F8FAFC] font-bold text-lg flex items-center justify-center transition-all border border-white/10"
              >
                +
              </button>
            </div>
          </div>

          {/* Tara Krat Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="tare-weight" className="text-xs font-semibold text-[#F8FAFC]/80">
                Tara Krat Kosong
              </label>
              <span className="text-[11px] text-[#F97316] font-bold tabular-nums">
                {tareWeight} kg
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {COMMON_TARE_PRESETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTareWeight(t);
                    playBeep(480, 0.04);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tareWeight === t
                      ? 'bg-[#F97316] text-white shadow-md shadow-[#F97316]/30 border border-orange-300/40'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                  }`}
                >
                  {t === 0 ? 'Tanpa Tara' : `${t} kg`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Digital Scale Display (Berat Kotor & Hasil Bersih Netto) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="gross-weight" className="text-xs font-semibold text-[#F8FAFC]/90">
              Berat Kotor (Bruto Timbangan)
            </label>
            <span className="text-[11px] text-white/50">
              Satuan: Kilogram (kg)
            </span>
          </div>

          {/* Big LCD / iOS Glass Weight Visualizer */}
          <div className="relative rounded-2xl bg-black/45 border border-white/15 p-4 sm:p-5 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Gross Input Field */}
              <div className="flex-1">
                <span className="text-[10px] tracking-wider uppercase text-white/40 block mb-1">
                  Input Bruto
                </span>
                <div className="flex items-center gap-2">
                  <input
                    id="gross-weight"
                    type="number"
                    step="0.01"
                    min="0.1"
                    placeholder="0.00"
                    value={grossInput}
                    onChange={(e) => {
                      setGrossInput(e.target.value);
                      setError(null);
                    }}
                    autoFocus
                    className="w-full text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight bg-transparent tabular-nums placeholder:text-white/20 focus:outline-none"
                  />
                  <span className="text-lg font-bold text-white/50">kg</span>
                </div>
              </div>

              {/* Real-time Netto Calculation Preview (Secondary Emerald #10B981) */}
              <div className="sm:border-l sm:border-white/10 sm:pl-5 pt-3 sm:pt-0 border-t border-white/10">
                <span className="text-[10px] tracking-wider uppercase text-[#10B981] font-semibold block mb-0.5">
                  Hasil Bersih (Netto)
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#10B981] tabular-nums">
                    {liveNetto.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-[#10B981]">kg</span>
                </div>
                <span className="text-[10px] text-white/40 block mt-0.5">
                  Bruto ({parsedGross.toFixed(2)}) - Tara ({tareWeight.toFixed(2)})
                </span>
              </div>
            </div>

            {/* Quick Fast-Add Buttons */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {[0.1, 0.5, 1.0, 5.0].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleQuickAdd(delta)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#F97316]/20 active:scale-95 text-[11px] font-semibold text-[#F8FAFC] border border-white/10 hover:border-[#F97316]/40 transition-all"
                  >
                    +{delta} kg
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Standard crate weight presets (Tertiary Amber #FBBF24) */}
                <span className="text-[10px] text-white/40 hidden xs:inline">Preset:</span>
                {[20, 25, 30].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSetPreset(preset)}
                    className="px-2 py-1 rounded-lg bg-[#FBBF24]/15 hover:bg-[#FBBF24]/25 active:scale-95 text-[11px] font-semibold text-[#FBBF24] border border-[#FBBF24]/30 transition-all"
                  >
                    {preset}kg
                  </button>
                ))}
                {grossInput && (
                  <button
                    type="button"
                    onClick={() => setGrossInput('')}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[11px] font-medium text-white/60 hover:text-rose-200 transition-all"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Jenis Nasi */}
        <div>
          <label className="block text-xs font-semibold text-[#F8FAFC]/80 mb-1.5">
            Jenis Nasi / Varian
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_RICE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setRiceType(type);
                  setIsCustomRice(false);
                  playBeep(500, 0.03);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  !isCustomRice && riceType === type
                    ? 'bg-[#F97316] text-white border border-orange-300/40 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                }`}
              >
                <Tag className="w-3 h-3 text-[#FBBF24]" />
                <span>{type}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomRice(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isCustomRice
                  ? 'bg-[#F97316] text-white border border-orange-300/40'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
              }`}
            >
              + Lainnya
            </button>
          </div>

          {isCustomRice && (
            <input
              type="text"
              placeholder="Tulis jenis nasi (contoh: Nasi Kebuli, Nasi Liwet)..."
              value={customRiceType}
              onChange={(e) => setCustomRiceType(e.target.value)}
              className="mt-2 w-full h-10 px-3.5 rounded-xl ios-glass-input text-white text-xs placeholder:text-white/40 focus:outline-none"
            />
          )}
        </div>

        {/* Row 4: Catatan Opsional */}
        <div>
          <label htmlFor="notes" className="block text-xs font-medium text-white/60 mb-1">
            Catatan (Opsional)
          </label>
          <input
            id="notes"
            type="text"
            placeholder="Contoh: Krat nomor seri B, batch adonan 2, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-9 px-3.5 rounded-xl ios-glass-input text-white text-xs placeholder:text-white/30 focus:outline-none"
          />
        </div>

        {/* Action Button: Tambah Krat ke Batch (Primary Orange #F97316) */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#F97316] via-[#ea580c] to-[#c2410c] hover:from-[#fb923c] hover:to-[#ea580c] active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#F97316]/30 border border-white/30 transition-all duration-150 group"
          >
            <span>Tambah Krat #{crateNumber} ke Batch #{activeBatchNumber}</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <CornerDownLeft className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
