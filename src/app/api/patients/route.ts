import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { full_name, dob, gender, phone, address, blood_group, allergies, emergency_contact, photo_url } = data;

    if (!full_name) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const patient = await queryOne(`
      INSERT INTO patients (
        full_name, dob, gender, phone, address, blood_group, allergies, emergency_contact, photo_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *
    `, [
      full_name, 
      dob || null, 
      gender || null, 
      phone || null, 
      address || null, 
      blood_group || null, 
      allergies || null, 
      emergency_contact || null, 
      photo_url || null
    ]);

    if (patient && data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
      for (const tag of data.tags) {
        await queryOne(`INSERT INTO patient_tags (patient_id, tag_name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [patient.id, tag]);
      }
    }

    // Attach tags to response
    if (patient) {
      patient.tags = data.tags || [];
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('[patients/POST] Error:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patients = await query(`
      SELECT 
        id, full_name, dob, gender, phone, photo_url, created_at, updated_at,
        (SELECT COALESCE(json_agg(tag_name), '[]') FROM patient_tags WHERE patient_id = patients.id) as tags
      FROM patients
      WHERE is_archived = false
      ORDER BY updated_at DESC
      LIMIT 20
    `);
    
    return NextResponse.json({ patients });
  } catch (error) {
    console.error('[patients/GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
