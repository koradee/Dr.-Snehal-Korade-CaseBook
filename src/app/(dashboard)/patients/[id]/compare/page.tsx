import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne, query } from '@/lib/db';
import { ImageCompareClient } from './ImageCompareClient';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Compare Clinical Images',
};

export default async function CompareImagesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const patientId = resolvedParams.id;

  const patient = await queryOne(`SELECT full_name FROM patients WHERE id = $1`, [patientId]) as any;
  if (!patient) notFound();

  // Fetch only consultations that actually have images
  const consultationsWithImages = await query(`
    SELECT 
      c.id, c.created_at, c.diagnosis,
      (
        SELECT COALESCE(json_agg(json_build_object('id', ci.id, 'image_url', ci.image_url)), '[]')
        FROM clinical_images ci WHERE ci.consultation_id = c.id
      ) as images
    FROM consultations c
    WHERE c.patient_id = $1 
      AND EXISTS (SELECT 1 FROM clinical_images ci WHERE ci.consultation_id = c.id)
    ORDER BY c.created_at DESC
  `, [patientId]) as any;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href={`/patients/${patientId}`} className="btn-ghost" style={{ padding: '0.5rem' }}>
          <ArrowLeftIcon width={20} height={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Compare Clinical Images
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>{patient.full_name}</p>
        </div>
      </div>

      <ImageCompareClient consultations={consultationsWithImages || []} />
    </div>
  );
}
