import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? '').trim().toLowerCase();
  const displayName = String(body.displayName ?? '').trim();
  const password = String(body.password ?? '');
  const conn = await pool.getConnection();
  try {
    const [count] = await conn.query<any[]>('SELECT COUNT(*) AS n FROM users');
    if (Number(count[0].n) !== 0) return NextResponse.json({ error: 'Setup sudah selesai' }, { status: 409 });
    if (!/^[a-z0-9._-]{3,80}$/.test(username) || !displayName || password.length < 8) return NextResponse.json({ error: 'Username, nama, atau password tidak valid' }, { status: 400 });
    await conn.query('INSERT INTO users (username, display_name, password_hash, role) VALUES (?,?,?,?)', [username, displayName, hashPassword(password), 'admin']);
    return NextResponse.json({ ok: true });
  } finally { conn.release(); }
}
