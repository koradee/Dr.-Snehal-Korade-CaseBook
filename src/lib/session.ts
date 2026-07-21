import { cookies } from 'next/headers';
import { verifyToken, type JWTPayload } from './auth';

export const SESSION_COOKIE = 'casebook_session';
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

// ─── Cookie management (server-side) ─────────────────────────────────────────

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

// ─── Session validation ───────────────────────────────────────────────────────

export async function getSession(): Promise<JWTPayload | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized: no valid session');
  }
  return session;
}
