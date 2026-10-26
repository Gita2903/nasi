import { pool, loadState } from '@/lib/db';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query('DELETE FROM batches WHERE id = ?', [id]);
  return Response.json(await loadState());
}
