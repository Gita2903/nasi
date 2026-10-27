'use client';

import { useState } from 'react';
import { ScaleSettings, COMMON_TARE_PRESETS } from '@/types/scale';
import { kg } from '@/lib/format';
import Modal from './Modal';

interface SettingsModalProps {
  settings: ScaleSettings;
  onClose: () => void;
  onSave: (newSettings: ScaleSettings) => void;
}

export default function SettingsModal({ settings, onClose, onSave }: SettingsModalProps) {
  const [defaultTare, setDefaultTare] = useState<number>(settings.defaultTare);
  const [defaultBatchPrefix, setDefaultBatchPrefix] = useState<string>(settings.defaultBatchPrefix);
  const [operatorName, setOperatorName] = useState<string>(settings.operatorName);
  const [autoIncrementCrate, setAutoIncrementCrate] = useState<boolean>(settings.autoIncrementCrate);

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
    <Modal onClose={onClose} labelledBy="settings-title" widthClass="w-[28rem]">
      <h2 id="settings-title" className="mb-4 font-cond text-2xl font-bold leading-tight">
        Pengaturan
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="default-tare-input" className="mb-2 block text-sm font-medium">
            Tara bawaan krat kosong (kg)
          </label>
          <input
            id="default-tare-input"
            type="number"
            inputMode="decimal"
            step="0.05"
            min="0"
            value={defaultTare}
            onChange={(e) => setDefaultTare(parseFloat(e.target.value) || 0)}
            className="field w-32 font-semibold tabular-nums"
          />
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Pilihan tara cepat">
            {COMMON_TARE_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                className="chip"
                aria-pressed={defaultTare === p}
                onClick={() => setDefaultTare(p)}
              >
                {kg(p)} kg
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="batch-prefix" className="mb-2 block text-sm font-medium">
            Awalan nama batch
          </label>
          <input
            id="batch-prefix"
            type="text"
            value={defaultBatchPrefix}
            onChange={(e) => setDefaultBatchPrefix(e.target.value)}
            maxLength={80}
            placeholder="Contoh: Produksi Pagi"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="operator-name" className="mb-2 block text-sm font-medium">
            Nama petugas
          </label>
          <input
            id="operator-name"
            type="text"
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
            maxLength={80}
            placeholder="Contoh: Budi"
            className="field"
          />
        </div>

        <label className="flex min-h-11 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={autoIncrementCrate}
            onChange={(e) => setAutoIncrementCrate(e.target.checked)}
            className="mt-1 h-5 w-5 accent-go"
          />
          <span>
            <span className="block font-medium">Nomor krat naik otomatis</span>
            <span className="block text-sm text-muted">Setelah krat dicatat, nomor berikutnya terisi sendiri.</span>
          </span>
        </label>

        <div className="flex justify-end gap-2 border-t border-rule pt-4">
          <button type="button" className="btn" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Simpan pengaturan
          </button>
        </div>
      </form>
    </Modal>
  );
}
