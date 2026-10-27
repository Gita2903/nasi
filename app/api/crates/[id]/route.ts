import { pool, loadState } from '@/lib/db';
import { serverError } from '@/lib/http';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
  // batch_id IS NULL: only active crates, never rows of a saved batch
  await pool.query('DELETE FROM crates WHERE id = ? AND batch_id IS NULL', [id]);
    return Response.json(await loadState());
  } catch (e) {
    return serverError(e);
  }
}
