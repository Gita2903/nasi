'use client';

import { RotateCcw, AlertTriangle, X } from 'lucide-react';

interface ConfirmResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entryCount: number;
}

export default function ConfirmResetModal({
  isOpen,
  onClose,
  onConfirm,
  entryCount,
}: ConfirmResetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm ios-glass-bright rounded-3xl p-6 shadow-2xl border border-white/25 text-center relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup Dialog"
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center absolute right-4 top-4 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          Mulai Sesi Baru?
        </h3>
        <p className="text-xs text-white/60 mb-5 leading-relaxed">
          Tindakan ini akan mengosongkan <strong>{entryCount} data krat</strong> yang sudah tercatat.
          Pastikan Anda sudah menyalin atau mengekspor laporan jika diperlukan.
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
