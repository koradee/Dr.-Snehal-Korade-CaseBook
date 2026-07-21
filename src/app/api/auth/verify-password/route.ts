import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { queryOne } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

interface AdminUser {
  password_hash: string;
}

/**
 * POST /api/auth/verify-password
 * Used by the inactivity lock screen to verify the password without issuing a new cookie.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { password } = await request.json() as { password?: string };
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const user = await queryOne<AdminUser>(
      'SELECT password_hash FROM admin_user WHERE id = $1',
      [session.sub]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      // Add slight delay to prevent brute-force
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[verify-password]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
