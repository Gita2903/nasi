import { pool, loadState } from '@/lib/db';
import { calculateNetWeight, validateCrateInput } from '@/lib/scale-calculator';

export async function POST(req: Request) {
  const b = await req.json();
  const gross = Number(b.grossWeight);
  const tare = Number(b.tareWeight);
  const crateNumber = Number(b.crateNumber);
  const v = validateCrateInput(crateNumber, gross, tare);
  if (!v.valid) return Response.json({ error: v.error }, { status: 400 });

  await pool.query(
    'INSERT INTO crates (id, crate_number, gross_weight, tare_weight, net_weight, rice_type, notes, timestamp) VALUES (?,?,?,?,?,?,?,?)',
    [
      `crate-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      crateNumber,
      gross,
      tare,
      calculateNetWeight(gross, tare),
      String(b.riceType || 'Nasi Putih Pulen').slice(0, 80),
      b.notes || null,
      Date.now(),
    ]
  );
  return Response.json(await loadState());
}

export async function DELETE() {
  await pool.query('DELETE FROM crates WHERE batch_id IS NULL');
  return Response.json(await loadState());
}
