import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ patients: [] });
  }

  const searchTerm = `%${q}%`;

  try {
    // Search patients by name, phone, or a diagnosis in their consultations
    const patients = await query(`
      SELECT DISTINCT p.id, p.full_name, p.phone, p.photo_url, p.gender, p.dob
      FROM patients p
      LEFT JOIN consultations c ON c.patient_id = p.id
      LEFT JOIN patient_tags pt ON pt.patient_id = p.id
      WHERE p.is_archived = false
        AND (
          p.full_name ILIKE $1 
          OR p.phone ILIKE $1
          OR c.diagnosis ILIKE $1
          OR pt.tag_name ILIKE $1
        )
      ORDER BY p.full_name ASC
      LIMIT 10
    `, [searchTerm]);

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('[search] Error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
