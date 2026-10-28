import { NextResponse } from 'next/server';
import { pool, loadState } from '@/lib/db';
import { createSession, verifyPassword } from '@/lib/auth';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  if (!username || !password) return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
  const [rows] = await pool.query<any[]>('SELECT id, password_hash FROM users WHERE username=? AND is_active=1 LIMIT 1', [username]);
  if (!rows[0] || !verifyPassword(password, rows[0].password_hash)) return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
  await createSession(rows[0].id);
  return NextResponse.json({ ok: true });
}
