import { pool, loadState } from '@/lib/db';
import { readJson, badRequest, serverError } from '@/lib/http';
import { requireUser } from '@/lib/auth';

export async function PUT(req: Request) {
  try { await requireUser(); } catch { return Response.json({ error: 'Login diperlukan' }, { status: 401 }); }
  const b = await readJson(req);
  if (!b) return badRequest('Body request tidak valid');
  const tare = Number(b.defaultTare);
  if (isNaN(tare) || tare < 0) return badRequest('Tara tidak valid');
  try {
  await pool.query(
    'UPDATE settings SET default_tare=?, auto_increment_crate=?, default_batch_prefix=? WHERE id=1',
    [
      tare,
      !!b.autoIncrementCrate,
      String(b.defaultBatchPrefix ?? '').slice(0, 80),
    ]
  );
  return Response.json(await loadState());
  } catch (e) {
    return serverError(e);
  }
}
