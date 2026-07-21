import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne, query } from '@/lib/db';
import { PrintConsultationClient } from './PrintConsultationClient';

export const metadata: Metadata = {
  title: 'Print Prescription',
};

export default async function PrintConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const consultationId = resolvedParams.id;
  
  // 1. Fetch consultation
  const consultation = await queryOne(`
    SELECT * FROM consultations WHERE id = $1
  `, [consultationId]);

  if (!consultation) {
    notFound();
  }

  // 2. Fetch associated patient
  const patient = await queryOne(`
    SELECT * FROM patients WHERE id = $1
  `, [consultation.patient_id]);

  if (!patient) {
    notFound();
  }

  // 3. Fetch clinical images
  const images = await query(`
    SELECT id, image_url FROM clinical_images WHERE consultation_id = $1
  `, [consultationId]);

  // 4. Fetch prescription items
  const prescriptionItems = await query(`
    SELECT drug_name, dosage, frequency, duration, instructions 
    FROM prescription_items 
    WHERE consultation_id = $1 
    ORDER BY sort_order ASC
  `, [consultationId]);

  const fullConsultation = {
    ...consultation,
    images: images || [],
    prescription_items: prescriptionItems || [],
  };

  return <PrintConsultationClient consultation={fullConsultation} patient={patient} />;
}
