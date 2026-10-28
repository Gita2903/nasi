'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function SetupPage() {
  const router = useRouter(); const [form, setForm] = useState({ username: '', displayName: '', password: '' }); const [error, setError] = useState('');
  async function submit(e: FormEvent) { e.preventDefault(); const r = await fetch('/api/auth/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const d = await r.json(); if (!r.ok) return setError(d.error); router.push('/login'); }
  return <main className="flex min-h-screen items-center justify-center px-4"><form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border border-rule bg-paper p-6"><h1 className="font-cond text-3xl font-bold">Setup Admin</h1><p className="text-sm text-muted">Buat akun admin pertama.</p><input className="field" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required /><input className="field" placeholder="Nama lengkap" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required /><input className="field" type="password" placeholder="Password min. 8 karakter" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />{error && <p className="text-danger">{error}</p>}<button className="btn btn-primary w-full">Buat admin</button></form></main>;
}
