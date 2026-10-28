'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'Login gagal'); else router.push('/');
    setBusy(false);
  }

  return <main className="flex min-h-screen items-center justify-center px-4"><form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border border-rule bg-paper p-6 shadow-sm"><h1 className="font-cond text-3xl font-bold">Login Timbangan Nasi</h1><label className="block text-sm font-medium">Username<input className="field mt-1" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required /></label><label className="block text-sm font-medium">Password<input className="field mt-1" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <p className="text-sm text-danger">{error}</p>}<button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Masuk...' : 'Masuk'}</button></form></main>;
}
