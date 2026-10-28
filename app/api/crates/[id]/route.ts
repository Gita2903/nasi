import { pool, loadState } from '@/lib/db';
import { serverError } from '@/lib/http';
import { requireUser } from '@/lib/auth';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireUser(); } catch { return Response.json({ error: 'Login diperlukan' }, { status: 401 }); }
  const { id } = await params;
  try {
  // batch_id IS NULL: only active crates, never rows of a saved batch
  await pool.query('DELETE FROM crates WHERE id = ? AND batch_id IS NULL', [id]);
    return Response.json(await loadState());
  } catch (e) {
    return serverError(e);
  }
}
