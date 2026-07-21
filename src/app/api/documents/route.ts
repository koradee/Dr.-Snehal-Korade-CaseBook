import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { patient_id, consultation_id, type, file_url, file_name } = data;

    if (!patient_id || !type || !file_url) {
      return NextResponse.json({ error: 'patient_id, type, and file_url are required' }, { status: 400 });
    }

    const document = await queryOne(`
      INSERT INTO documents (patient_id, consultation_id, type, file_url, file_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [patient_id, consultation_id || null, type, file_url, file_name || 'Document']);

    // Update patient's updated_at timestamp
    await queryOne(`UPDATE patients SET updated_at = NOW() WHERE id = $1 RETURNING id`, [patient_id]);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('[documents/POST] Error:', error);
    return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
  }
}
