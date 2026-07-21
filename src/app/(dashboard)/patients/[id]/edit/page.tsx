import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne } from '@/lib/db';
import { PatientForm } from '@/components/patients/PatientForm';

export const metadata: Metadata = {
  title: 'Edit Patient',
};

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const patient = await queryOne(`
    SELECT * FROM patients WHERE id = $1 AND is_archived = false
  `, [resolvedParams.id]);

  if (!patient) {
    notFound();
  }

  return (
    <div style={{ padding: '2rem' }}>
      <PatientForm initialData={patient as any} isEdit={true} />
    </div>
  );
}
