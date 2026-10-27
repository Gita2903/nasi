export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await req.json();
    return b && typeof b === 'object' ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const badRequest = (error: string) => Response.json({ error }, { status: 400 });

export function serverError(e: unknown) {
  console.error(e);
  return Response.json({ error: 'Kesalahan server / database. Coba lagi.' }, { status: 500 });
}
