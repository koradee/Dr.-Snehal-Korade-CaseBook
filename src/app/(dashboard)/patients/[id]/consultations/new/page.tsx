import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne, query } from '@/lib/db';
import { ConsultationForm } from '@/components/consultations/ConsultationForm';

export const metadata: Metadata = {
  title: 'New Consultation',
};

export default async function NewConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Verify patient exists
  const patient = await queryOne(`
    SELECT id FROM patients WHERE id = $1 AND is_archived = false
  `, [resolvedParams.id]);

  if (!patient) {
    notFound();
  }

  // Fetch all past consultations
  const pastConsultations = await query(`
    SELECT * FROM consultations 
    WHERE patient_id = $1 
    ORDER BY created_at DESC 
  `, [resolvedParams.id]);

  if (pastConsultations.length > 0) {
    // Fetch prescription items for these consultations
    const consultationIds = pastConsultations.map((c: any) => c.id);
    
    // Postgres ANY requires an array parameter
    const items = await query(`
      SELECT consultation_id, drug_name, dosage, frequency, duration, instructions 
      FROM prescription_items 
      WHERE consultation_id = ANY($1::uuid[]) 
      ORDER BY sort_order ASC
    `, [consultationIds]);

    // Group items by consultation_id
    const itemsByConsultation = items.reduce((acc: any, item: any) => {
      if (!acc[item.consultation_id]) acc[item.consultation_id] = [];
      acc[item.consultation_id].push(item);
      return acc;
    }, {});

    // Attach items to their respective consultations
    pastConsultations.forEach((c: any) => {
      c.prescription_items = itemsByConsultation[c.id] || [];
    });
  }

  // We can still pass the most recent one specifically for the pre-fill logic
  // or we can just pass the array and let the client component handle it.
  // We'll pass the whole array.
  
  return (
    <div style={{ padding: '2rem' }}>
      <ConsultationForm 
        patientId={resolvedParams.id} 
        pastConsultations={pastConsultations} 
      />
    </div>
  );
}
