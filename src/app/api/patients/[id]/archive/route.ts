import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { is_archived } = body;

    if (typeof is_archived !== 'boolean') {
      return NextResponse.json({ error: 'Invalid is_archived value' }, { status: 400 });
    }

    await query(
      `UPDATE patients SET is_archived = $1, updated_at = NOW() WHERE id = $2`,
      [is_archived, resolvedParams.id]
    );

    return NextResponse.json({ success: true, is_archived });
  } catch (error) {
    console.error('[patient/archive/PUT] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
