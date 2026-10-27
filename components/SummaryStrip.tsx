'use client';

import { GlobalBatchStats } from '@/lib/scale-calculator';
import { kg, ton } from '@/lib/format';

interface SummaryStripProps {
  stats: GlobalBatchStats;
  activeCrateCount: number;
}

function Stat({ label, value, unit, note }: { label: string; value: string; unit: string; note?: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-cond text-3xl font-semibold leading-tight tabular-nums">
        {value} <span className="font-sans text-base font-medium text-muted">{unit}</span>
      </dd>
      {note && <dd className="text-sm text-muted tabular-nums">{note}</dd>}
    </div>
  );
}

export default function SummaryStrip({ stats, activeCrateCount }: SummaryStripProps) {
  return (
    <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-4 border-b border-rule pb-5 sm:grid-cols-4">
      <Stat
        label="Total netto"
        value={kg(stats.totalNetKg)}
        unit="kg"
        note={`${ton(stats.totalNetKg)} ton, termasuk batch berjalan`}
      />
      <Stat label="Batch tersimpan" value={String(stats.totalBatches)} unit="batch" />
      <Stat
        label="Total krat"
        value={String(stats.totalCrates)}
        unit="krat"
        note={activeCrateCount > 0 ? `${activeCrateCount} di batch berjalan` : undefined}
      />
      <Stat label="Rata-rata per batch" value={kg(stats.avgBatchNetKg)} unit="kg" />
    </dl>
  );
}
