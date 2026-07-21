import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne, query } from '@/lib/db';
import { PrintFullRecordClient } from './PrintFullRecordClient';
import { differenceInYears } from 'date-fns';

export const metadata: Metadata = {
  title: 'Print Full Patient Record',
};

function calculateAge(dob: string) {
  if (!dob) return null;
  return differenceInYears(new Date(), new Date(dob));
}

export default async function PrintFullRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const patientId = resolvedParams.id;
  
  // 1. Fetch patient
  const patient = await queryOne(`
    SELECT * FROM patients WHERE id = $1
  `, [patientId]) as any;

  if (!patient) {
    notFound();
  }
  
  patient.age = calculateAge(patient.dob);

  // 2. Fetch all consultations for this patient (Newest First)
  // Fetching with subqueries for images and prescriptions to avoid explosion
  const consultations = await query(`
    SELECT 
      c.*,
      (
        SELECT COALESCE(json_agg(json_build_object('id', ci.id, 'image_url', ci.image_url)), '[]')
        FROM clinical_images ci WHERE ci.consultation_id = c.id
      ) as images,
      (
        SELECT COALESCE(json_agg(json_build_object(
          'drug_name', pi.drug_name, 
          'dosage', pi.dosage, 
          'frequency', pi.frequency, 
          'duration', pi.duration, 
          'instructions', pi.instructions
        ) ORDER BY pi.sort_order ASC), '[]')
        FROM prescription_items pi WHERE pi.consultation_id = c.id
      ) as prescription_items
    FROM consultations c
    WHERE c.patient_id = $1
    ORDER BY c.created_at DESC
  `, [patientId]);

  return <PrintFullRecordClient patient={patient} consultations={consultations || []} />;
}
