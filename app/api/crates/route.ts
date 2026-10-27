import { pool, loadState } from '@/lib/db';
import { readJson, badRequest, serverError } from '@/lib/http';
import { calculateNetWeight, validateCrateInput } from '@/lib/scale-calculator';

export async function POST(req: Request) {
  const b = await readJson(req);
  if (!b) return badRequest('Body request tidak valid');
  const gross = Number(b.grossWeight);
  const tare = Number(b.tareWeight);
  const crateNumber = Number(b.crateNumber);
  const v = validateCrateInput(crateNumber, gross, tare);
  if (!v.valid) return Response.json({ error: v.error }, { status: 400 });

  try {
    const [dup] = await pool.query<any[]>(
      'SELECT 1 FROM crates WHERE batch_id IS NULL AND crate_number = ? LIMIT 1',
      [crateNumber]
    );
    if (dup.length > 0) return badRequest(`Krat #${crateNumber} sudah ada di batch aktif`);

    await pool.query(
      'INSERT INTO crates (id, crate_number, gross_weight, tare_weight, net_weight, rice_type, notes, timestamp) VALUES (?,?,?,?,?,?,?,?)',
      [
        `crate-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        crateNumber,
        gross,
        tare,
        calculateNetWeight(gross, tare),
        String(b.riceType || 'Frozen Nasi Putih').slice(0, 80),
        b.notes ? String(b.notes).slice(0, 1000) : null,
        Date.now(),
      ]
    );
    return Response.json(await loadState());
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE() {
  try {
    await pool.query('DELETE FROM crates WHERE batch_id IS NULL');
    return Response.json(await loadState());
  } catch (e) {
    return serverError(e);
  }
}
