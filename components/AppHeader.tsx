'use client';

export interface SessionUser {
  displayName: string;
  role: 'admin' | 'user';
}

interface AppHeaderProps {
  user: SessionUser | null;
  batchCount: number;
  onOpenSettings: () => void;
  onOpenReport: () => void;
}

export default function AppHeader({ user, batchCount, onOpenSettings, onOpenReport }: AppHeaderProps) {
  return (
    <header className="border-b border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div>
          <h1 className="font-cond text-3xl font-bold leading-none tracking-tight">Timbangan Nasi</h1>
          <p className="mt-1 text-sm text-muted">
            {user ? `Petugas: ${user.displayName}${user.role === 'admin' ? ' (admin)' : ''}` : '\u00a0'}
          </p>
        </div>
        <nav aria-label="Menu utama" className="flex gap-2">
          <button type="button" className="btn btn-sm" onClick={onOpenReport}>
            Rekap WA{batchCount > 0 ? ` (${batchCount})` : ''}
          </button>
          <button type="button" className="btn btn-sm" onClick={onOpenSettings}>
            Pengaturan
          </button>
          {user?.role === 'admin' && (
            <a className="btn btn-sm" href="/users">
              User
            </a>
          )}
          <button type="button" className="btn btn-sm" onClick={() => { fetch('/api/auth/logout', { method: 'POST' }).then(() => { location.href = '/login'; }); }}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
