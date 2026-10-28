import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const hasSession = Boolean(req.cookies.get('timbangan_session')?.value);
  const publicPath = path === '/login' || path === '/setup' || path.startsWith('/api/auth');
  if (!hasSession && !publicPath) {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (hasSession && path === '/login') return NextResponse.redirect(new URL('/', req.url));
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
