import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';

interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
}

export async function POST(request: Request) {
  try {
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
      // Constant-time-like response to prevent username enumeration
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
    if (err.code === 'ECONNREFUSED') {
      console.error('Reason: The database server is completely unreachable (connection refused).');
      console.error('Fix: Ensure PostgreSQL is installed and actively running on your machine, and the DATABASE_URL in .env.local is correct.');
      return NextResponse.json(
        { error: 'Cannot connect to the database. Please ensure PostgreSQL is running.' },
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
