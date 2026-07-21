import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { getSession } from '@/lib/session';
import { queryOne } from '@/lib/db';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard',
};

interface AdminUser {
  display_name: string;
  last_login_at: string | null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await queryOne<AdminUser>(
    'SELECT display_name, last_login_at FROM admin_user WHERE id = $1',
    [session.sub]
  ).catch(() => null);

  return (
    <AppShell doctorName={user?.display_name || 'Dr. Snehal Korade'}>
      {children}
    </AppShell>
  );
}
