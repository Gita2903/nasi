'use client';

import { useState, useEffect } from 'react';
import { Wifi, Battery, Sparkles, SlidersHorizontal, Share2, RotateCcw } from 'lucide-react';
import { ScaleSettings } from '@/types/scale';

interface IPhoneHeaderProps {
  settings: ScaleSettings;
  activeBatchNumber: number;
  batchCount: number;
  activeCrateCount: number;
  onOpenSettings: () => void;
  onOpenReport: () => void;
  onResetSession: () => void;
}

export default function IPhoneHeader({
  settings,
  activeBatchNumber,
  batchCount,
  activeCrateCount,
  onOpenSettings,
  onOpenReport,
  onResetSession,
}: IPhoneHeaderProps) {
  const [time, setTime] = useState<string>('09:41');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090d16]/80 backdrop-blur-2xl border-b border-white/10 shadow-lg mb-6 pb-3">
      {/* iOS Status Bar */}
      <div className="flex items-center justify-between px-6 pt-2 pb-1 text-xs font-semibold tracking-tight text-[#F8FAFC]/80 max-w-6xl mx-auto">
        <span className="tabular-nums tracking-wide font-medium">{time}</span>
        {/* Dynamic Island pill */}
        <div className="h-5 px-3 bg-black/85 rounded-full border border-white/15 flex items-center justify-center gap-1.5 shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[10px] font-medium text-[#F8FAFC]/90">
            Batch #{activeBatchNumber} ({activeCrateCount} Krat)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#F8FAFC]/80">
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] tabular-nums font-medium">100%</span>
            <Battery className="w-4 h-4 fill-[#10B981] text-[#10B981]" />
          </div>
        </div>
      </div>

      {/* Main Glass Header Bar */}
      <div className="mx-auto max-w-6xl px-3 sm:px-6 mt-1">
        <div className="ios-glass-bright rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md border border-white/20">
          {/* Brand & Batch Info with Primary Orange #F97316 & Amber #FBBF24 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F97316] via-[#ea580c] to-[#FBBF24] flex items-center justify-center text-white shadow-md shadow-[#F97316]/25 ring-1 ring-white/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight">
                  Timbangan Nasi
                </h1>
                <span className="text-[11px] font-semibold text-[#10B981] px-2 py-0.5 rounded-md bg-[#10B981]/15 border border-[#10B981]/30">
                  Sistem Batch
                </span>
              </div>
              <p className="text-xs text-[#F8FAFC]/60 truncate max-w-[200px] sm:max-w-xs">
                {settings.operatorName} · Sedang: Batch #{activeBatchNumber}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onOpenReport}
              aria-label="Laporan dan Bagikan"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#F97316]/20 to-[#FBBF24]/20 hover:from-[#F97316]/30 hover:to-[#FBBF24]/30 active:scale-95 transition-all flex items-center gap-1.5 border border-[#F97316]/35 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Rekap WA</span>
              {batchCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#F97316] text-[10px] text-white flex items-center justify-center font-bold">
                  {batchCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenSettings}
              aria-label="Pengaturan Tara dan Petugas"
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#F8FAFC]/80 bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center gap-1.5 border border-white/15"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#F8FAFC]/70" />
              <span className="hidden sm:inline">Pengaturan</span>
            </button>

            <button
              onClick={onResetSession}
              aria-label="Reset Semua Data"
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-300/80 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 transition-all flex items-center gap-1 border border-rose-500/20"
              title="Reset Semua Data Batch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
