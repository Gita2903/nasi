import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { hashPassword, requireUser } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireUser('admin');
    const id = Number((await params).id); const b = await req.json();
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'ID user tidak valid' }, { status: 400 });
    const fields: string[] = []; const values: unknown[] = [];
    if (b.displayName !== undefined) { const name = String(b.displayName).trim(); if (!name) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 }); fields.push('display_name=?'); values.push(name); }
    if (b.role === 'admin' || b.role === 'user') { fields.push('role=?'); values.push(b.role); }
    if (b.password !== undefined) { const password = String(b.password); if (password.length < 8) return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 }); fields.push('password_hash=?'); values.push(hashPassword(password)); }
    if (b.isActive !== undefined) { if (id === admin.id && !b.isActive) return NextResponse.json({ error: 'Tidak bisa menonaktifkan akun sendiri' }, { status: 400 }); fields.push('is_active=?'); values.push(Boolean(b.isActive)); }
    if (!fields.length) return NextResponse.json({ error: 'Tidak ada perubahan' }, { status: 400 });
    values.push(id); await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id=?`, values);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireUser('admin'); const id = Number((await params).id);
    if (id === admin.id) return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 });
    await pool.query('UPDATE users SET is_active=0 WHERE id=?', [id]);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 }); }
}
