import { pool, loadState, toCrate } from '@/lib/db';
import { readJson, badRequest, serverError } from '@/lib/http';
import { finalizeBatchRecord } from '@/lib/scale-calculator';
import { requireUser } from '@/lib/auth';

export async function POST(req: Request) {
  try { await requireUser(); } catch { return Response.json({ error: 'Login diperlukan' }, { status: 401 }); }
  const body = (await readJson(req)) ?? {};
  const notes = body.notes ? String(body.notes).slice(0, 1000) : undefined;
  const portionGrams = Number(body.portionGrams);
  if (!Number.isFinite(portionGrams) || portionGrams <= 0) return badRequest('Satuan per porsi harus lebih besar dari 0 gram');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [cr] = await conn.query<any[]>(  
      'SELECT * FROM crates WHERE batch_id IS NULL ORDER BY timestamp, crate_number FOR UPDATE'
    );
    if (cr.length === 0) {
      await conn.rollback();
      return badRequest('Tidak ada krat aktif');
    }
    const [[{ n }]] = await conn.query<any[]>('SELECT COALESCE(MAX(batch_number),0)+1 AS n FROM batches FOR UPDATE');  
    const [[s]] = await conn.query<any[]>('SELECT * FROM settings WHERE id = 1');  

    const batch = finalizeBatchRecord(
      cr.map(toCrate),
      n,
      `${s.default_batch_prefix} #${n}`,
      s.operator_name,
      notes || undefined,
      portionGrams
    );
    await conn.query(
      'INSERT INTO batches (id, batch_number, batch_name, operator_name, rice_type, total_crates, total_gross_kg, total_tare_kg, total_net_kg, total_net_ton, avg_net_kg, portion_grams, total_portions, created_at, completed_at, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        batch.id, batch.batchNumber, batch.batchName, batch.operatorName, batch.riceType,
        batch.totalCrates, batch.totalGrossKg, batch.totalTareKg, batch.totalNetKg,
        batch.totalNetTon, batch.avgNetKg, batch.portionGrams, batch.totalPortions,
        batch.createdAt, batch.completedAt, batch.notes ?? null,
      ]
    );
    await conn.query('UPDATE crates SET batch_id = ? WHERE batch_id IS NULL', [batch.id]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    return serverError(e);
  } finally {
    conn.release();
  }
  return Response.json(await loadState());
}

export async function DELETE() {
  try { await requireUser('admin'); } catch { return Response.json({ error: 'Akses admin diperlukan' }, { status: 403 }); }
  try {
    await pool.query('DELETE FROM batches'); // crates of batches cascade
    await pool.query('DELETE FROM crates WHERE batch_id IS NULL');
    return Response.json(await loadState());
  } catch (e) {
    return serverError(e);
  }
}
