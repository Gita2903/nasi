import { CrateEntry, BatchRecord } from '@/types/scale';

export { type CrateEntry, type BatchRecord } from '@/types/scale';

export interface ScaleStats {
  totalCrates: number;
  totalGross: number;
  totalTare: number;
  totalNet: number;
  totalNetTon: number;
  avgNet: number;
  minNet: number;
  maxNet: number;
}

export interface GlobalBatchStats {
  totalBatches: number;
  totalCrates: number;
  totalNetKg: number;
  totalNetTon: number;
  totalGrossKg: number;
  avgBatchNetKg: number;
}

/**
 * Calculates net weight given gross weight and tare weight.
 * Net weight cannot be negative. Rounded to 2 decimal places.
 */
export function calculateNetWeight(gross: number, tare: number): number {
  if (isNaN(gross) || gross <= 0) return 0;
  const safeTare = isNaN(tare) || tare < 0 ? 0 : tare;
  const net = Math.max(0, gross - safeTare);
  return Math.round(net * 100) / 100;
}

/**
 * Formats weight in Kg and Ton clearly.
 */
export function formatWeightWithTon(kg: number): {
  kgFormatted: string;
  tonFormatted: string;
  combined: string;
} {
  const safeKg = Math.max(0, isNaN(kg) ? 0 : kg);
  const ton = safeKg / 1000;

  const kgFormatted = safeKg.toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

  const tonFormatted = ton.toLocaleString('id-ID', {
    minimumFractionDigits: ton < 1 ? 3 : 2,
    maximumFractionDigits: 3,
  });

  const combined = `${kgFormatted} kg (${tonFormatted} ton)`;

  return { kgFormatted, tonFormatted, combined };
}

/**
 * Validates crate input before saving.
 */
export function validateCrateInput(
  crateNumber: number,
  grossWeight: number,
  tareWeight: number
): { valid: boolean; error?: string } {
  if (!crateNumber || crateNumber <= 0 || !Number.isInteger(crateNumber)) {
    return { valid: false, error: 'Nomor krat harus berupa bilangan bulat positif (> 0)' };
  }
  if (isNaN(grossWeight) || grossWeight <= 0) {
    return { valid: false, error: 'Berat kotor (bruto) harus lebih besar dari 0 kg' };
  }
  if (tareWeight < 0) {
    return { valid: false, error: 'Tara tidak boleh negatif' };
  }
  if (grossWeight <= tareWeight) {
    return { valid: false, error: 'Berat kotor harus lebih besar dari tara krat' };
  }
  return { valid: true };
}

/**
 * Calculates aggregate statistics for a list of crate entries.
 */
export function calculateScaleStats(entries: CrateEntry[]): ScaleStats {
  if (!entries || entries.length === 0) {
    return {
      totalCrates: 0,
      totalGross: 0,
      totalTare: 0,
      totalNet: 0,
      totalNetTon: 0,
      avgNet: 0,
      minNet: 0,
      maxNet: 0,
    };
  }

  let totalGross = 0;
  let totalTare = 0;
  let totalNet = 0;
  let minNet = Infinity;
  let maxNet = -Infinity;

  for (const entry of entries) {
    totalGross += entry.grossWeight;
    totalTare += entry.tareWeight;
    totalNet += entry.netWeight;

    if (entry.netWeight < minNet) minNet = entry.netWeight;
    if (entry.netWeight > maxNet) maxNet = entry.netWeight;
  }

  const totalCrates = entries.length;
  const avgNet = totalCrates > 0 ? totalNet / totalCrates : 0;
  const totalNetTon = Math.round((totalNet / 1000) * 1000) / 1000;

  return {
    totalCrates,
    totalGross: Math.round(totalGross * 100) / 100,
    totalTare: Math.round(totalTare * 100) / 100,
    totalNet: Math.round(totalNet * 100) / 100,
    totalNetTon,
    avgNet: Math.round(avgNet * 100) / 100,
    minNet: minNet === Infinity ? 0 : Math.round(minNet * 100) / 100,
    maxNet: maxNet === -Infinity ? 0 : Math.round(maxNet * 100) / 100,
  };
}

/**
 * Creates a finalized BatchRecord from active crates.
 */
export function finalizeBatchRecord(
  crates: CrateEntry[],
  batchNumber: number,
  batchName: string = `Batch #${batchNumber}`,
  operatorName: string = 'Operator',
  notes?: string
): BatchRecord {
  const stats = calculateScaleStats(crates);
  const dominantRice = crates[0]?.riceType || 'Nasi Putih Pulen';
  const now = Date.now();
  const startTime = crates.length > 0 ? Math.min(...crates.map((c) => c.timestamp)) : now;

  return {
    id: `batch-${now}-${Math.random().toString(36).substring(2, 7)}`,
    batchNumber,
    batchName,
    operatorName,
    riceType: dominantRice,
    crates: [...crates],
    totalCrates: stats.totalCrates,
    totalGrossKg: stats.totalGross,
    totalTareKg: stats.totalTare,
    totalNetKg: stats.totalNet,
    totalNetTon: stats.totalNetTon,
    avgNetKg: stats.avgNet,
    createdAt: startTime,
    completedAt: now,
    notes,
  };
}

/**
 * Calculates global stats across all saved batches.
 */
export function calculateGlobalBatchStats(
  batches: BatchRecord[],
  activeCrates: CrateEntry[] = []
): GlobalBatchStats {
  let totalCrates = 0;
  let totalNetKg = 0;
  let totalGrossKg = 0;

  for (const b of batches) {
    totalCrates += b.totalCrates;
    totalNetKg += b.totalNetKg;
    totalGrossKg += b.totalGrossKg;
  }

  // Also include active crates currently on scale
  for (const c of activeCrates) {
    totalCrates += 1;
    totalNetKg += c.netWeight;
    totalGrossKg += c.grossWeight;
  }

  const totalBatches = batches.length;
  const avgBatchNetKg = totalBatches > 0 ? totalNetKg / totalBatches : 0;
  const totalNetTon = Math.round((totalNetKg / 1000) * 1000) / 1000;

  return {
    totalBatches,
    totalCrates,
    totalNetKg: Math.round(totalNetKg * 100) / 100,
    totalNetTon,
    totalGrossKg: Math.round(totalGrossKg * 100) / 100,
    avgBatchNetKg: Math.round(avgBatchNetKg * 100) / 100,
  };
}

/**
 * Predicts next crate number based on the existing entries.
 */
export function getNextCrateNumber(entries: CrateEntry[]): number {
  if (!entries || entries.length === 0) return 1;
  const maxNumber = Math.max(...entries.map((e) => e.crateNumber || 0));
  return maxNumber + 1;
}

/**
 * Predicts next batch number based on existing saved batches.
 */
export function getNextBatchNumber(batches: BatchRecord[]): number {
  if (!batches || batches.length === 0) return 1;
  const maxNumber = Math.max(...batches.map((b) => b.batchNumber || 0));
  return maxNumber + 1;
}

/**
 * Formats a WhatsApp-ready summary message for a single Batch.
 */
export function generateBatchWhatsAppSummary(batch: BatchRecord): string {
  const now = new Date(batch.completedAt);
  const dateFormatted = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const weightInfo = formatWeightWithTon(batch.totalNetKg);

  const lines = [
    `🍚 *LAPORAN TIMBANGAN NASI - BATCH #${batch.batchNumber}*`,
    `----------------------------------------`,
    `🏷️ *Nama Batch:* ${batch.batchName}`,
    `📅 *Selesai:* ${dateFormatted} (${timeFormatted} WIB)`,
    `👤 *Operator:* ${batch.operatorName}`,
    `🍚 *Varian:* ${batch.riceType}`,
    `----------------------------------------`,
    `📊 *RINGKASAN BATCH:*`,
    `• Jumlah Krat: *${batch.totalCrates} krat*`,
    `• Total Bersih (Netto): *${weightInfo.combined}*`,
    `• Total Kotor (Bruto): *${batch.totalGrossKg.toLocaleString('id-ID')} kg*`,
    `• Total Tara Krat: *${batch.totalTareKg.toLocaleString('id-ID')} kg*`,
    `• Rata-rata/Krat: *${batch.avgNetKg.toLocaleString('id-ID')} kg*`,
  ];

  if (batch.notes) {
    lines.push(`• Catatan: _${batch.notes}_`);
  }

  lines.push(`----------------------------------------`);
  lines.push(`📝 *RINCIAN ${batch.crates.length} KRAT:*`);

  batch.crates.forEach((e) => {
    const time = new Date(e.timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    lines.push(
      `• Krat #${e.crateNumber}: *${e.netWeight} kg* [Bruto: ${e.grossWeight} | Tara: ${e.tareWeight}] (${time})`
    );
  });

  lines.push(`----------------------------------------`);
  lines.push(`_Dicatat via Aplikasi Timbangan Nasi iOS Glass_`);

  return lines.join('\n');
}

/**
 * Formats a WhatsApp-ready summary for ALL batches (All History).
 */
export function generateAllBatchesWhatsAppSummary(batches: BatchRecord[]): string {
  const stats = calculateGlobalBatchStats(batches);
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const lines = [
    `🍚 *REKAP KESELURUHAN BATCH TIMBANGAN NASI*`,
    `----------------------------------------`,
    `📅 *Tanggal Rekap:* ${dateFormatted}`,
    `📦 *Total Batch Selesai:* ${stats.totalBatches} batch`,
    `📦 *Total Krat Keseluruhan:* ${stats.totalCrates} krat`,
    `⚖️ *TOTAL BERSIH (NETTO):* *${stats.totalNetKg.toLocaleString('id-ID')} kg (${stats.totalNetTon.toLocaleString('id-ID')} ton)*`,
    `⚖️ *Total Kotor (Bruto):* ${stats.totalGrossKg.toLocaleString('id-ID')} kg`,
    `----------------------------------------`,
    `📋 *DAFTAR BATCH:*`,
  ];

  batches.forEach((b) => {
    const time = new Date(b.completedAt).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    lines.push(
      `• *Batch #${b.batchNumber} (${b.batchName})*: ${b.totalCrates} krat -> *${b.totalNetKg} kg (${b.totalNetTon} ton)* [${b.riceType} - ${time}]`
    );
  });

  lines.push(`----------------------------------------`);
  lines.push(`_Dicatat via Aplikasi Timbangan Nasi iOS Glass_`);

  return lines.join('\n');
}

/**
 * Generates CSV content for a single batch or all batches.
 */
export function generateBatchCSV(batches: BatchRecord[]): string {
  const headers = [
    'Batch #',
    'Nama Batch',
    'No Krat',
    'Jenis Nasi',
    'Bruto (kg)',
    'Tara (kg)',
    'Netto (kg)',
    'Netto (ton)',
    'Waktu Timbang',
    'Operator',
    'Catatan',
  ];

  const rows: string[] = [];

  batches.forEach((b) => {
    b.crates.forEach((c) => {
      const date = new Date(c.timestamp).toLocaleString('id-ID');
      const noteSafe = (c.notes || b.notes || '').replace(/"/g, '""');
      rows.push(
        [
          b.batchNumber,
          `"${b.batchName}"`,
          c.crateNumber,
          `"${c.riceType}"`,
          c.grossWeight,
          c.tareWeight,
          c.netWeight,
          (c.netWeight / 1000).toFixed(4),
          `"${date}"`,
          `"${b.operatorName}"`,
          `"${noteSafe}"`,
        ].join(',')
      );
    });
  });

  return [headers.join(','), ...rows].join('\n');
}
