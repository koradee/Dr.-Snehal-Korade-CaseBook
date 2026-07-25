import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patient = await queryOne(`
      SELECT p.*, 
             (SELECT COALESCE(json_agg(tag_name), '[]') FROM patient_tags WHERE patient_id = p.id) as tags
      FROM patients p 
      WHERE p.id = $1 AND p.is_archived = false
    `, [resolvedParams.id]);

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('[patient/GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
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
      UPDATE patients SET
        full_name = $1,
        dob = $2,
        gender = $3,
        phone = $4,
        address = $5,
        blood_group = $6,
        allergies = $7,
        emergency_contact = $8,
        photo_url = $9,
        updated_at = NOW()
      WHERE id = $10 AND is_archived = false
      RETURNING *
    `, [
      full_name, 
      dob || null, 
      gender || null, 
      phone || null, 
      address || null, 
      blood_group || null, 
      allergies || null, 
      emergency_contact || null, 
      photo_url || null,
      resolvedParams.id
    ]);

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    if (data.tags && Array.isArray(data.tags)) {
      await queryOne(`DELETE FROM patient_tags WHERE patient_id = $1`, [patient.id]);
      for (const tag of data.tags) {
        if (tag.trim() !== '') {
          await queryOne(`INSERT INTO patient_tags (patient_id, tag_name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [patient.id, tag.trim()]);
        }
      }
    }

    patient.tags = data.tags || [];

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('[patient/PUT] Error:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { supabaseAdmin } = await import('@/lib/supabase');
    const { query } = await import('@/lib/db');

    // 1. Get all clinical images for this patient's consultations
    const images = await query(`
      SELECT ci.image_url 
      FROM clinical_images ci
      JOIN consultations c ON c.id = ci.consultation_id
      WHERE c.patient_id = $1
    `, [resolvedParams.id]);

    // 2. Get all documents for this patient
    const docs = await query(`
      SELECT document_url 
      FROM documents
      WHERE patient_id = $1
    `, [resolvedParams.id]);

    // 3. Delete S3 files
    const imagePaths = images
      .map((img: any) => img.image_url.split('/clinical-images/').pop())
      .filter(Boolean);
      
    if (imagePaths.length > 0) {
      const { error } = await supabaseAdmin.storage.from('clinical-images').remove(imagePaths);
      if (error) console.error('Error deleting clinical images:', error);
    }

    const docPaths = docs
      .map((doc: any) => doc.document_url.split('/documents/').pop())
      .filter(Boolean);

    if (docPaths.length > 0) {
      const { error } = await supabaseAdmin.storage.from('documents').remove(docPaths);
      if (error) console.error('Error deleting documents:', error);
    }

    // 4. Delete patient (cascades to consultations, prescriptions, images, documents, tags in Postgres)
    await query(`DELETE FROM patients WHERE id = $1`, [resolvedParams.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[patient/DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
