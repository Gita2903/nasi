import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { hashPassword, requireUser } from '@/lib/auth';

export async function GET() {
  try { await requireUser('admin'); const [rows] = await pool.query('SELECT id, username, display_name AS displayName, role, is_active AS isActive, created_at AS createdAt FROM users ORDER BY username'); return NextResponse.json(rows); } catch (e) { return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 }); }
}

export async function POST(req: Request) {
  try {
    await requireUser('admin'); const b = await req.json();
    const username = String(b.username ?? '').trim().toLowerCase(); const displayName = String(b.displayName ?? '').trim(); const password = String(b.password ?? ''); const role = b.role === 'admin' ? 'admin' : 'user';
    if (!/^[a-z0-9._-]{3,80}$/.test(username) || !displayName || password.length < 8) return NextResponse.json({ error: 'Username, nama, atau password tidak valid' }, { status: 400 });
    await pool.query('INSERT INTO users (username, display_name, password_hash, role) VALUES (?,?,?,?)', [username, displayName, hashPassword(password), role]);
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.code === 'ER_DUP_ENTRY' ? 'Username sudah dipakai' : 'Gagal membuat user' }, { status: 400 }); }
}
