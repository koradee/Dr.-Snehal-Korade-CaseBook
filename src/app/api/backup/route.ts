import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all core tables
    const patients = await query('SELECT * FROM patients');
    const patientTags = await query('SELECT * FROM patient_tags');
    const consultations = await query('SELECT * FROM consultations');
    const prescriptionItems = await query('SELECT * FROM prescription_items');
    const clinicalImages = await query('SELECT * FROM clinical_images');
    const documents = await query('SELECT * FROM documents');
    const drugLibrary = await query('SELECT * FROM drug_library');

    const backupData = {
      export_date: new Date().toISOString(),
      version: "1.0",
      data: {
        patients,
        patient_tags: patientTags,
        consultations,
        prescription_items: prescriptionItems,
        clinical_images: clinicalImages,
        documents,
        drug_library: drugLibrary
      }
    };

    const fileName = `casebook_backup_${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('[backup] Error:', error);
    return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 });
  }
}
