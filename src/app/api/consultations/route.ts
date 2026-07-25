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
    const {
      patient_id,
      visit_type,
      vitals,
      chief_complaint,
      history,
      examination_findings,
      diagnosis,
      prescription_text,
      advice,
      follow_up_date,
      follow_up_time,
      clinical_images, // Array of URLs
    } = data;

    if (!patient_id || !visit_type) {
      return NextResponse.json({ error: 'patient_id and visit_type are required' }, { status: 400 });
    }

    // 1. Insert Consultation
    const consultation = await queryOne(`
      INSERT INTO consultations (
        patient_id, visit_type, vitals, chief_complaint, history,
        examination_findings, diagnosis, prescription_text, advice,
        follow_up_date, follow_up_time
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `, [
      patient_id,
      visit_type,
      vitals ? JSON.stringify(vitals) : null,
      chief_complaint || null,
      history || null,
      examination_findings || null,
      diagnosis || null,
      prescription_text || null,
      advice || null,
      follow_up_date || null,
      follow_up_time || null,
    ]);

    if (!consultation) {
      throw new Error('Failed to create consultation record');
    }

    // 2. Insert Clinical Images if any
    if (clinical_images && Array.isArray(clinical_images) && clinical_images.length > 0) {
      // Build bulk insert query
      const values = clinical_images.map((url, i) => `($1, $${i + 2})`).join(', ');
      const params = [consultation.id, ...clinical_images];
      
      await query(`
        INSERT INTO clinical_images (consultation_id, image_url)
        VALUES ${values}
      `, params);
    }

    // 3. Insert Prescription Items if any, and auto-learn new drugs
    const { prescription_items } = data;
    if (prescription_items && Array.isArray(prescription_items) && prescription_items.length > 0) {
      for (let i = 0; i < prescription_items.length; i++) {
        const item = prescription_items[i];
        if (!item.drug_name) continue;
        
        await query(`
          INSERT INTO prescription_items (consultation_id, drug_name, dosage, frequency, duration, instructions, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          consultation.id,
          item.drug_name,
          item.dosage || null,
          item.frequency || null,
          item.duration || null,
          item.instructions || null,
          i
        ]);

        // Auto-learn drug
        await query(`
          INSERT INTO drug_library (drug_name, default_dosage, default_frequency)
          VALUES ($1, $2, $3)
          ON CONFLICT (drug_name) DO NOTHING
        `, [
          item.drug_name,
          item.dosage || null,
          item.frequency || null
        ]);
      }
    }

    // 3. Update patient's updated_at timestamp to bubble them up in Recent Patients
    await queryOne(`UPDATE patients SET updated_at = NOW() WHERE id = $1 RETURNING id`, [patient_id]);

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error('[consultations/POST] Error:', error);
    return NextResponse.json({ error: 'Failed to create consultation' }, { status: 500 });
  }
}
