import { pool, loadState } from '@/lib/db';
import { serverError } from '@/lib/http';
import { requireUser } from '@/lib/auth';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireUser('admin'); } catch { return Response.json({ error: 'Akses admin diperlukan' }, { status: 403 }); }
  const { id } = await params;
  try {
    await pool.query('DELETE FROM batches WHERE id = ?', [id]);
    return Response.json(await loadState());
  } catch (e) {
    return serverError(e);
  }
}
