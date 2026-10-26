'use client';

import { useState } from 'react';
import { ScaleSettings, COMMON_TARE_PRESETS } from '@/types/scale';
import { X, Check, Sliders, User, Tag } from 'lucide-react';

interface SettingsModalProps {
  settings: ScaleSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSettings: ScaleSettings) => void;
}

export default function SettingsModal({
  settings,
  isOpen,
  onClose,
  onSave,
}: SettingsModalProps) {
  const [defaultTare, setDefaultTare] = useState<number>(settings.defaultTare);
  const [defaultBatchPrefix, setDefaultBatchPrefix] = useState<string>(settings.defaultBatchPrefix);
  const [operatorName, setOperatorName] = useState<string>(settings.operatorName);
  const [autoIncrementCrate, setAutoIncrementCrate] = useState<boolean>(settings.autoIncrementCrate);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      defaultTare: Math.max(0, defaultTare),
      defaultBatchPrefix: defaultBatchPrefix.trim() || 'Batch Produksi',
      operatorName: operatorName.trim() || 'Operator',
      autoIncrementCrate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md ios-glass-bright rounded-3xl p-6 shadow-2xl border border-white/25 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F97316]/20 text-[#F97316] flex items-center justify-center border border-[#F97316]/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">
                Pengaturan Timbangan
              </h3>
              <p className="text-xs text-white/50">
                Atur tara bawaan, nama default batch, dan operator
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Default Tare */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="default-tare-input" className="text-xs font-semibold text-[#F8FAFC]/80">
                Tara Standar Krat Kosong (kg)
              </label>
              <span className="text-xs font-bold text-[#F97316] tabular-nums">
                {defaultTare} kg
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input
                id="default-tare-input"
                type="number"
                step="0.05"
                min="0"
                value={defaultTare}
                onChange={(e) => setDefaultTare(parseFloat(e.target.value) || 0)}
                className="w-28 h-10 px-3 rounded-xl ios-glass-input text-white text-sm font-bold tabular-nums focus:outline-none"
              />
              <span className="text-xs text-white/50">kg per krat kosong</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TARE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDefaultTare(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    defaultTare === p
                      ? 'bg-[#F97316] text-white border border-orange-300/40 shadow-sm'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {p === 0 ? '0 kg' : `${p} kg`}
                </button>
              ))}
            </div>
          </div>

          {/* Default Batch Prefix */}
          <div>
            <label htmlFor="batch-prefix" className="block text-xs font-semibold text-[#F8FAFC]/80 mb-1.5">
              Awalan Nama Batch
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                id="batch-prefix"
                type="text"
                value={defaultBatchPrefix}
                onChange={(e) => setDefaultBatchPrefix(e.target.value)}
                placeholder="Contoh: Batch Masak Pagi, Produksi Nasi"
                className="w-full h-10 pl-10 pr-3 rounded-xl ios-glass-input text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Operator Name */}
          <div>
            <label htmlFor="operator-name" className="block text-xs font-semibold text-[#F8FAFC]/80 mb-1.5">
              Nama Petugas / Operator
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                id="operator-name"
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Contoh: Budi, Tim Dapur 1"
                className="w-full h-10 pl-10 pr-3 rounded-xl ios-glass-input text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Auto increment toggle */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Auto-Increment No. Krat</span>
              <span className="text-[11px] text-white/50">Otomatis tambah nomor krat saat menimbang</span>
            </div>
            <input
              type="checkbox"
              checked={autoIncrementCrate}
              onChange={(e) => setAutoIncrementCrate(e.target.checked)}
              className="w-4 h-4 accent-[#F97316] rounded"
            />
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#ea580c] hover:from-[#fb923c] hover:to-[#ea580c] active:scale-95 text-white text-xs font-bold shadow-md shadow-[#F97316]/30 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
