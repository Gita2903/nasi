import { pool, loadState } from '@/lib/db';
import { serverError } from '@/lib/http';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await pool.query('DELETE FROM batches WHERE id = ?', [id]);
    return Response.json(await loadState());
  } catch (e) {
    return serverError(e);
  }
}
