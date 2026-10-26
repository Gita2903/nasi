import { pool, loadState } from '@/lib/db';

export async function PUT(req: Request) {
  const b = await req.json();
  const tare = Number(b.defaultTare);
  if (isNaN(tare) || tare < 0) return Response.json({ error: 'Tara tidak valid' }, { status: 400 });
  await pool.query(
    'UPDATE settings SET default_tare=?, operator_name=?, auto_increment_crate=?, default_batch_prefix=? WHERE id=1',
    [
      tare,
      String(b.operatorName ?? '').slice(0, 80),
      !!b.autoIncrementCrate,
      String(b.defaultBatchPrefix ?? '').slice(0, 80),
    ]
  );
  return Response.json(await loadState());
}
