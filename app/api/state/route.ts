import { loadState } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireUser();
    return Response.json(await loadState());
  } catch {
    return Response.json({ error: 'Login diperlukan' }, { status: 401 });
  }
}
