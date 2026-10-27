import mysql from 'mysql2/promise';
import type { BatchRecord, CrateEntry, ScaleSettings } from '@/types/scale';

// cached on globalThis so dev HMR doesn't leak pools
const g = globalThis as unknown as { _pool?: mysql.Pool };
export const pool =
  g._pool ??
  (g._pool = mysql.createPool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'timbangan_nasi',
    decimalNumbers: true,
    connectionLimit: 10,
  }));

 
export const toCrate = (r: any): CrateEntry => ({
  id: r.id,
  crateNumber: r.crate_number,
  grossWeight: r.gross_weight,
  tareWeight: r.tare_weight,
  netWeight: r.net_weight,
  riceType: r.rice_type,
  notes: r.notes ?? undefined,
  timestamp: Number(r.timestamp),
});

const toBatch = (r: any, crates: CrateEntry[]): BatchRecord => ({
  id: r.id,
  batchNumber: r.batch_number,
  batchName: r.batch_name,
  operatorName: r.operator_name,
  riceType: r.rice_type,
  crates,
  totalCrates: r.total_crates,
  totalGrossKg: r.total_gross_kg,
  totalTareKg: r.total_tare_kg,
  totalNetKg: r.total_net_kg,
  totalNetTon: r.total_net_ton,
  avgNetKg: r.avg_net_kg,
  createdAt: Number(r.created_at),
  completedAt: Number(r.completed_at),
  notes: r.notes ?? undefined,
});

export async function loadState() {
  const [b] = await pool.query<any[]>('SELECT * FROM batches ORDER BY batch_number DESC');
  const [c] = await pool.query<any[]>('SELECT * FROM crates ORDER BY timestamp, crate_number');
  const [s] = await pool.query<any[]>('SELECT * FROM settings WHERE id = 1');

  const byBatch = new Map<string, CrateEntry[]>();
  const activeCrates: CrateEntry[] = [];
  for (const r of c) {
    if (!r.batch_id) activeCrates.push(toCrate(r));
    else byBatch.set(r.batch_id, [...(byBatch.get(r.batch_id) ?? []), toCrate(r)]);
  }
  const batches = b.map((r) => toBatch(r, byBatch.get(r.id) ?? []));

  const st = s[0];
  if (!st) throw new Error('Baris settings (id=1) tidak ada. Jalankan db/schema.sql');
  const settings: ScaleSettings = {
    defaultTare: st.default_tare,
    operatorName: st.operator_name,
    autoIncrementCrate: !!st.auto_increment_crate,
    defaultBatchPrefix: st.default_batch_prefix,
  };
  return { batches, activeCrates, settings };
}
