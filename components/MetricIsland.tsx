'use client';

import { GlobalBatchStats, formatWeightWithTon } from '@/lib/scale-calculator';
import { Package, Scale, Layers, TrendingUp } from 'lucide-react';

interface MetricIslandProps {
  stats: GlobalBatchStats;
  activeCrateCount: number;
}

export default function MetricIsland({ stats, activeCrateCount }: MetricIslandProps) {
  const weight = formatWeightWithTon(stats.totalNetKg);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Netto in Kg & Ton (Primary Orange #F97316 & Emerald #10B981) */}
      <div className="col-span-2 sm:col-span-1 ios-glass rounded-2xl p-4 relative overflow-hidden group border border-[#F97316]/25">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-orange-200/90">Total Bersih (Netto)</span>
          <div className="w-7 h-7 rounded-lg bg-[#F97316]/20 text-[#F97316] flex items-center justify-center border border-[#F97316]/30">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC] tabular-nums">
            {weight.kgFormatted}
          </span>
          <span className="text-xs font-bold text-[#F97316]">kg</span>
          <span className="text-xs font-extrabold text-[#10B981] bg-[#10B981]/20 px-2 py-0.5 rounded-md border border-[#10B981]/30 tabular-nums">
            {weight.tonFormatted} ton
          </span>
        </div>
        <p className="text-[11px] text-[#F8FAFC]/50 mt-1.5">
          Berat bersih gabungan seluruh krat
        </p>
      </div>

      {/* 2. Total Batch Selesai (Tertiary Amber #FBBF24) */}
      <div className="ios-glass rounded-2xl p-4 relative overflow-hidden border border-[#FBBF24]/25">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-200/90">Batch Selesai</span>
          <div className="w-7 h-7 rounded-lg bg-[#FBBF24]/20 text-[#FBBF24] flex items-center justify-center border border-[#FBBF24]/30">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black tracking-tight text-[#F8FAFC] tabular-nums">
            {stats.totalBatches}
          </span>
          <span className="text-sm font-semibold text-[#FBBF24]">batch</span>
        </div>
        <p className="text-[11px] text-[#F8FAFC]/50 mt-1 truncate">
          Tersimpan dalam riwayat
        </p>
      </div>

      {/* 3. Total Krat Ditimbang (Secondary Emerald #10B981) */}
      <div className="ios-glass rounded-2xl p-4 relative overflow-hidden border border-[#10B981]/25">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-200/90">Total Krat</span>
          <div className="w-7 h-7 rounded-lg bg-[#10B981]/20 text-[#10B981] flex items-center justify-center border border-[#10B981]/30">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black tracking-tight text-[#F8FAFC] tabular-nums">
            {stats.totalCrates}
          </span>
          <span className="text-sm font-semibold text-[#10B981]">krat</span>
        </div>
        <p className="text-[11px] text-[#F8FAFC]/50 mt-1 truncate">
          {activeCrateCount > 0 ? `${activeCrateCount} krat di batch aktif` : 'Semua batch rapi'}
        </p>
      </div>

      {/* 4. Rata-rata / Batch (Neutral with Orange accent) */}
      <div className="col-span-2 sm:col-span-1 ios-glass rounded-2xl p-4 relative overflow-hidden border border-white/15">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-100/90">Rata-rata / Batch</span>
          <div className="w-7 h-7 rounded-lg bg-white/10 text-amber-300 flex items-center justify-center border border-white/15">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC] tabular-nums">
            {stats.avgBatchNetKg.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
          </span>
          <span className="text-sm font-semibold text-orange-300">kg</span>
          <span className="text-[11px] text-[#F8FAFC]/40 tabular-nums">
            ({(stats.avgBatchNetKg / 1000).toFixed(3)} ton)
          </span>
        </div>
        <p className="text-[11px] text-[#F8FAFC]/50 mt-1 truncate">
          Rata-rata bobot per batch produksi
        </p>
      </div>
    </div>
  );
}
