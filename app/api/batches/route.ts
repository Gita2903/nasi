import { pool, loadState, toCrate } from '@/lib/db';
import { finalizeBatchRecord } from '@/lib/scale-calculator';

export async function POST(req: Request) {
  const { notes } = await req.json().catch(() => ({}));
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [cr] = await conn.query<any[]>(  
      'SELECT * FROM crates WHERE batch_id IS NULL ORDER BY timestamp, crate_number FOR UPDATE'
    );
    if (cr.length === 0) {
      await conn.rollback();
      return Response.json({ error: 'Tidak ada krat aktif' }, { status: 400 });
    }
    const [[{ n }]] = await conn.query<any[]>('SELECT COALESCE(MAX(batch_number),0)+1 AS n FROM batches FOR UPDATE');  
    const [[s]] = await conn.query<any[]>('SELECT * FROM settings WHERE id = 1');  

    const batch = finalizeBatchRecord(
      cr.map(toCrate),
      n,
      `${s.default_batch_prefix} #${n}`,
      s.operator_name,
      notes || undefined
    );
    await conn.query(
      'INSERT INTO batches (id, batch_number, batch_name, operator_name, rice_type, total_crates, total_gross_kg, total_tare_kg, total_net_kg, total_net_ton, avg_net_kg, created_at, completed_at, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        batch.id, batch.batchNumber, batch.batchName, batch.operatorName, batch.riceType,
        batch.totalCrates, batch.totalGrossKg, batch.totalTareKg, batch.totalNetKg,
        batch.totalNetTon, batch.avgNetKg, batch.createdAt, batch.completedAt, batch.notes ?? null,
      ]
    );
    await conn.query('UPDATE crates SET batch_id = ? WHERE batch_id IS NULL', [batch.id]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  return Response.json(await loadState());
}

export async function DELETE() {
  await pool.query('DELETE FROM batches'); // crates of batches cascade
  await pool.query('DELETE FROM crates WHERE batch_id IS NULL');
  return Response.json(await loadState());
}
