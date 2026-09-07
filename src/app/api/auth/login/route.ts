import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';

interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitData>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();

    const rateLimit = rateLimitMap.get(ip);
    if (rateLimit) {
      if (now > rateLimit.resetTime) {
        rateLimitMap.delete(ip);
      } else if (rateLimit.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Too many failed login attempts. Please try again in 15 minutes.' },
          { status: 429 }
        );
      }
    }

    const recordFailure = () => {
      const current = rateLimitMap.get(ip);
      if (!current || now > current.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
      } else {
        current.count += 1;
      }
    };

    const body = await request.json();
    const { username, password } = body as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Fetch admin user from database
    const user = await queryOne<AdminUser>(
      'SELECT id, username, password_hash, display_name FROM admin_user WHERE username = $1',
      [username.trim().toLowerCase()]
    );

    if (!user) {
      recordFailure();
      // Constant-time-like response to prevent username enumeration
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      recordFailure();
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Clear rate limit on successful login
    rateLimitMap.delete(ip);

    // Update last_login_at
    await queryOne(
      'UPDATE admin_user SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Issue JWT and set httpOnly session cookie
    const token = signToken({ sub: user.id, username: user.username });
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
      },
    });
  } catch (err: any) {
    console.error('\n❌ [auth/login] Critical Error:');
    console.error('Message:', err.message);
    
    const isDbConnectionError = 
      err.code === 'ECONNREFUSED' || 
      err.code === 'ENOTFOUND' || 
      (err.code === 'XX000' && err.message?.includes('tenant/user'));

    if (isDbConnectionError) {
      console.error('Reason: The database server is unreachable or the connection details are invalid.');
      console.error('Fix: Ensure your DATABASE_URL in .env.local is correct and the database is actively running.');
      return NextResponse.json(
        { error: 'Cannot connect to the database. Please verify your connection settings and ensure the database is running.' },
        { status: 503 }
      );
    }
    
    console.error(err);
    
    return NextResponse.json(
      { error: 'An internal server error occurred while trying to log in.' },
      { status: 500 }
    );
  }
}
