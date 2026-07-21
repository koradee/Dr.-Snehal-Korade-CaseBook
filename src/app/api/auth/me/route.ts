import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { queryOne } from '@/lib/db';

interface AdminUser {
  id: string;
  username: string;
  display_name: string;
  last_login_at: string | null;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await queryOne<AdminUser>(
    'SELECT id, username, display_name, last_login_at FROM admin_user WHERE id = $1',
    [session.sub]
  );

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    lastLoginAt: user.last_login_at,
  });
}
