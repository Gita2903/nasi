export interface CrateEntry {
  id: string;
  crateNumber: number;
  grossWeight: number; // Berat Kotor (kg)
  tareWeight: number;  // Tara Krat Kosong (kg)
  netWeight: number;   // Berat Bersih (kg)
  riceType: string;    // Jenis Nasi
  notes?: string;      // Catatan
  timestamp: number;   // Waktu timbang
}

export interface BatchRecord {
  id: string;
  batchNumber: number;
  batchName: string;
  operatorName: string;
  riceType: string;
  crates: CrateEntry[];
  totalCrates: number;
  totalGrossKg: number;
  totalTareKg: number;
  totalNetKg: number;
  totalNetTon: number; // in metric tons
  avgNetKg: number;
  portionGrams: number;
  totalPortions: number;
  createdAt: number;
  completedAt: number;
  notes?: string;
}

export interface ScaleSettings {
  defaultTare: number;
  operatorName: string;
  autoIncrementCrate: boolean;
  defaultBatchPrefix: string;
}

export const DEFAULT_SETTINGS: ScaleSettings = {
  defaultTare: 1.5,
  operatorName: 'Operator Dapur',
  autoIncrementCrate: true,
  defaultBatchPrefix: 'Batch Produksi',
};

export const COMMON_RICE_TYPES = [
  'Frozen Nasi Putih',
  'Nasi Uduk',
  'Nasi Kuning',
  'Nasi Merah',
  'Nasi Biryani / Mandhi',
  'Beras / Gabah',
];

export const COMMON_TARE_PRESETS = [0, 1.2, 1.4, 1.5, 1.8, 2.0];
