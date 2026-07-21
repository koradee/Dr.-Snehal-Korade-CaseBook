import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { query, queryOne } from '@/lib/db';
import { 
  UserCircleIcon, 
  PencilSquareIcon,
  PhoneIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { format, differenceInYears } from 'date-fns';

import { ConsultationTimeline, ConsultationRecord } from '@/components/consultations/ConsultationTimeline';
import { ClientProfileTabs } from './ClientProfileTabs';
import { PatientActions } from './PatientActions';

export const metadata: Metadata = {
  title: 'Patient Profile',
};

function calculateAge(dob: Date | string) {
  if (!dob) return null;
  return differenceInYears(new Date(), new Date(dob));
}

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const patient = await queryOne(`
    SELECT p.*,
           (SELECT COALESCE(json_agg(tag_name), '[]') FROM patient_tags WHERE patient_id = p.id) as tags
    FROM patients p 
    WHERE p.id = $1
  `, [resolvedParams.id]) as any;

  if (!patient) {
    notFound();
  }

  // Fetch Consultations with their images and structured prescriptions
  const consultations = await query<ConsultationRecord>(`
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
  `, [patient.id]);

  // Fetch Documents
  const documents = await query(`
    SELECT * FROM documents WHERE patient_id = $1 ORDER BY uploaded_at DESC
  `, [patient.id]);

  const age = calculateAge(patient.dob);
  const formattedDob = patient.dob ? format(new Date(patient.dob), 'dd MMM yyyy') : null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      {/* Archived Banner */}
      {patient.is_archived && (
        <div style={{ 
          background: 'var(--bg-surface-2)', 
          border: '1px solid var(--border-strong)',
          borderRadius: '8px', 
          padding: '1rem 1.5rem', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ArchiveBoxIcon width={24} height={24} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>This patient is archived</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Their records are hidden from normal search and dashboards.</p>
            </div>
          </div>
        </div>
      )}

      {/* Allergies Banner */}
      {patient.allergies && (
        <div style={{ 
          background: 'rgba(239,68,68,0.1)', 
          border: '1px solid rgba(239,68,68,0.3)',
          borderLeft: '4px solid var(--color-danger)',
          borderRadius: '8px', 
          padding: '1rem 1.5rem', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <ExclamationTriangleIcon width={24} height={24} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <div>
            <h3 style={{ color: 'var(--color-danger)', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Allergies Alert</h3>
            <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{patient.allergies}</p>
          </div>
        </div>
      )}

      {/* Patient Header Card */}
      <div className="card-elevated" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {patient.photo_url ? (
              <img 
                src={patient.photo_url} 
                alt={patient.full_name} 
                style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--bg-surface-2)', filter: patient.is_archived ? 'grayscale(100%)' : 'none' }} 
              />
            ) : (
              <UserCircleIcon width={96} height={96} style={{ color: 'var(--text-disabled)' }} />
            )}
            
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {patient.full_name}
              </h1>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '0.75rem' }}>
                <span>{patient.gender || 'Gender Unspecified'}</span>
                {age !== null && <span>• {age} years ({formattedDob})</span>}
                {patient.blood_group && <span>• Blood: <strong style={{ color: 'var(--color-danger)' }}>{patient.blood_group}</strong></span>}
              </div>

              {patient.tags && patient.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {patient.tags.map((tag: string, idx: number) => (
                    <span key={idx} style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(26,107,138,0.2)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {patient.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <PhoneIcon width={16} height={16} />
                    {patient.phone}
                  </div>
                )}
                {patient.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <MapPinIcon width={16} height={16} />
                    {patient.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href={`/print/patient/${patient.id}`} target="_blank" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                Export
              </Link>
              <Link href={`/patients/${patient.id}/edit`} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PencilSquareIcon width={18} height={18} />
                Edit
              </Link>
            </div>
            <PatientActions patientId={patient.id} patientName={patient.full_name} isArchived={patient.is_archived} />
          </div>
        </div>

        {patient.emergency_contact && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Emergency Contact</span>
            <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginTop: '0.25rem' }}>{patient.emergency_contact}</p>
          </div>
        )}
      </div>

      <ClientProfileTabs patientId={patient.id} consultations={consultations} documents={documents || []} />

    </div>
  );
}
