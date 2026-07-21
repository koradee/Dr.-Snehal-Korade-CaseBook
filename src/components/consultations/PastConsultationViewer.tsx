import React, { useState } from 'react';
import { ClockIcon, PrinterIcon } from '@heroicons/react/24/outline';

interface PrescriptionItem {
  drug_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Consultation {
  id: string;
  created_at: string;
  visit_type: string;
  vitals?: any;
  chief_complaint?: string;
  history?: string;
  examination_findings?: string;
  diagnosis?: string;
  prescription_text?: string;
  prescription_items?: PrescriptionItem[];
  advice?: string;
  follow_up_date?: string;
  follow_up_time?: string;
  clinical_images?: any[];
}

interface PastConsultationViewerProps {
  consultations: Consultation[];
}

export function PastConsultationViewer({ consultations }: PastConsultationViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!consultations || consultations.length === 0) return null;

  const consultation = consultations[selectedIndex];
  const dateStr = new Date(consultation.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-default)' }}>
      {/* Header & Selector */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-surface-2)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClockIcon width={20} height={20} style={{ color: 'var(--color-primary)' }} />
          Past Consultation Reference
        </h3>
        {consultations.length > 1 ? (
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border-strong)',
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem'
            }}
          >
            {consultations.map((c, idx) => (
              <option key={c.id} value={idx}>
                {new Date(c.created_at).toLocaleDateString()} - {c.diagnosis || 'No diagnosis'}
              </option>
            ))}
          </select>
        ) : (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <strong>{dateStr}</strong> - {consultation.diagnosis || 'No diagnosis recorded'}
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Vitals */}
        {consultation.vitals && Object.keys(consultation.vitals).length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vitals</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '1rem', background: 'var(--bg-surface-2)', padding: '1rem', borderRadius: '8px' }}>
              {consultation.vitals.bp && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BP</div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{consultation.vitals.bp}</div></div>}
              {consultation.vitals.pulse && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pulse</div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{consultation.vitals.pulse}</div></div>}
              {consultation.vitals.temp && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temp</div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{consultation.vitals.temp}</div></div>}
              {consultation.vitals.weight && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight</div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{consultation.vitals.weight}</div></div>}
            </div>
          </div>
        )}

        {/* Text fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {consultation.chief_complaint && (
            <div>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chief Complaint</h4>
              <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>{consultation.chief_complaint}</p>
            </div>
          )}
          {consultation.history && (
            <div>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>History</h4>
              <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>{consultation.history}</p>
            </div>
          )}
          {consultation.examination_findings && (
            <div>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Examination</h4>
              <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>{consultation.examination_findings}</p>
            </div>
          )}
          
          {/* Structured Prescription Rendering */}
          {consultation.prescription_items && consultation.prescription_items.length > 0 ? (
            <div style={{ background: 'var(--color-primary-light)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prescription</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {consultation.prescription_items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', paddingBottom: idx < consultation.prescription_items!.length - 1 ? '0.75rem' : 0, borderBottom: idx < consultation.prescription_items!.length - 1 ? '1px solid rgba(26,107,138,0.2)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{item.drug_name}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {item.duration}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {item.dosage && <span>{item.dosage}</span>}
                      {item.dosage && item.frequency && <span> • </span>}
                      {item.frequency && <span>{item.frequency}</span>}
                    </div>
                    {item.instructions && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                        Note: {item.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : consultation.prescription_text ? (
            <div style={{ background: 'var(--color-primary-light)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prescription (Legacy)</h4>
              <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>{consultation.prescription_text}</p>
            </div>
          ) : null}

          {consultation.advice && (
            <div>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Advice</h4>
              <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>{consultation.advice}</p>
            </div>
          )}
        </div>

        {/* Clinical Images */}
        {consultation.clinical_images && consultation.clinical_images.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Images</h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {consultation.clinical_images.map((img: any) => (
                <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                  <img src={img.image_url} alt="Clinical" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
