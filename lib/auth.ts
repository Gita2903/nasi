import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';

const COOKIE = 'timbangan_session';
const SESSION_DAYS = 7;

type User = { id: number; username: string; displayName: string; role: 'admin' | 'user' };

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected || expected.length !== 128) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [rows] = await pool.query<any[]>(
    'SELECT u.id, u.username, u.display_name, u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at > NOW() AND u.is_active=1 LIMIT 1',
    [crypto.createHash('sha256').update(token).digest('hex')]
  );
  const u = rows[0];
  return u ? { id: u.id, username: u.username, displayName: u.display_name, role: u.role } : null;
}

export async function requireUser(role?: 'admin') {
  const user = await currentUser();
  if (!user || (role && user.role !== role)) throw new Error('UNAUTHORIZED');
  return user;
}

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString('hex');
  await pool.query('INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL ? DAY))', [userId, crypto.createHash('sha256').update(token).digest('hex'), SESSION_DAYS]);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_DAYS * 86400 });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await pool.query('DELETE FROM sessions WHERE token_hash=?', [crypto.createHash('sha256').update(token).digest('hex')]);
  jar.delete(COOKIE);
}
