'use client';

import React, { useEffect } from 'react';
import { format, differenceInYears } from 'date-fns';

export interface PrintConsultationClientProps {
  consultation: any;
  patient: any;
}

export function PrintConsultationClient({ consultation, patient }: PrintConsultationClientProps) {
  useEffect(() => {
    // We delay the print prompt slightly to ensure images have a chance to load.
    // A more robust implementation would wait for image 'onload' events,
    // but a small timeout is sufficient for an MVP.
    const timer = setTimeout(() => {
      window.print();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const age = patient.dob ? differenceInYears(new Date(), new Date(patient.dob)) : null;
  const visitDate = format(new Date(consultation.created_at), 'dd MMM yyyy, hh:mm a');
  
  return (
    <div className="print-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', background: '#fff', color: '#000', minHeight: '100vh' }}>
      
      {/* ── Letterhead Header ── */}
      <header style={{ borderBottom: '2px solid #1A6B8A', paddingBottom: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1A6B8A' }}>
            {process.env.NEXT_PUBLIC_DOCTOR_NAME || 'Dr. Snehal Korade'}
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#4a5568' }}>
            MBBS, MD (Medicine)<br/>
            Reg. No: MAH-12345
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#4a5568' }}>
          <p style={{ margin: 0 }}><strong>Clinic Address:</strong></p>
          <p style={{ margin: 0 }}>123 Healthway Street</p>
          <p style={{ margin: 0 }}>Pune, Maharashtra 411001</p>
          <p style={{ margin: 0 }}>Ph: +91 98765 43210</p>
        </div>
      </header>

      {/* ── Patient Info Block ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '1rem', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#2d3748' }}>
            {patient.full_name}
          </h2>
          <div style={{ fontSize: '0.9rem', color: '#4a5568', display: 'flex', gap: '1rem' }}>
            <span>{patient.gender || 'Gender Unspecified'}</span>
            {age !== null && <span>• Age: {age}</span>}
            {patient.phone && <span>• Ph: {patient.phone}</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a5568' }}><strong>Date:</strong> {visitDate}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a5568' }}><strong>Type:</strong> {consultation.visit_type === 'new' ? 'New Case' : 'Follow Up'}</p>
        </div>
      </div>

      {/* ── Vitals Grid ── */}
      {consultation.vitals && Object.keys(consultation.vitals).length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600, color: '#1A6B8A', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>
            Vitals
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem' }}>
            {consultation.vitals.bp && <div><strong style={{ color: '#718096' }}>BP:</strong> {consultation.vitals.bp}</div>}
            {consultation.vitals.pulse && <div><strong style={{ color: '#718096' }}>Pulse:</strong> {consultation.vitals.pulse} bpm</div>}
            {consultation.vitals.temp && <div><strong style={{ color: '#718096' }}>Temp:</strong> {consultation.vitals.temp} °F</div>}
            {consultation.vitals.weight && <div><strong style={{ color: '#718096' }}>Wt:</strong> {consultation.vitals.weight} kg</div>}
            {consultation.vitals.height && <div><strong style={{ color: '#718096' }}>Ht:</strong> {consultation.vitals.height} cm</div>}
            {consultation.vitals.bmi && <div><strong style={{ color: '#718096' }}>BMI:</strong> {consultation.vitals.bmi}</div>}
            {consultation.vitals.spo2 && <div><strong style={{ color: '#718096' }}>SpO2:</strong> {consultation.vitals.spo2}%</div>}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── Text Sections ── */}
        {consultation.chief_complaint && (
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: '#1A6B8A', textTransform: 'uppercase' }}>Chief Complaint</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: '#2d3748' }}>{consultation.chief_complaint}</p>
          </div>
        )}

        {consultation.history && (
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: '#1A6B8A', textTransform: 'uppercase' }}>History</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: '#2d3748' }}>{consultation.history}</p>
          </div>
        )}

        {consultation.examination_findings && (
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: '#1A6B8A', textTransform: 'uppercase' }}>Examination</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: '#2d3748' }}>{consultation.examination_findings}</p>
          </div>
        )}

        {consultation.diagnosis && (
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: '#1A6B8A', textTransform: 'uppercase' }}>Diagnosis</h3>
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'pre-wrap', color: '#2d3748' }}>{consultation.diagnosis}</p>
          </div>
        )}

        {consultation.prescription_items && consultation.prescription_items.length > 0 ? (
          <div style={{ marginTop: '0.5rem', breakInside: 'avoid' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 700, color: '#1A6B8A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontFamily: 'serif', fontStyle: 'italic', fontWeight: 600 }}>Rx</span>
              Prescription
            </h3>
            <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              {consultation.prescription_items.map((item: any, idx: number) => (
                <div key={idx} style={{ marginBottom: idx < consultation.prescription_items.length - 1 ? '0.75rem' : 0, paddingBottom: idx < consultation.prescription_items.length - 1 ? '0.75rem' : 0, borderBottom: idx < consultation.prescription_items.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ color: '#2d3748', fontSize: '1rem' }}>{item.drug_name}</strong>
                    <span style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 500 }}>
                      {item.duration}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '0.25rem' }}>
                    {item.dosage && <span>{item.dosage}</span>}
                    {item.dosage && item.frequency && <span> • </span>}
                    {item.frequency && <span>{item.frequency}</span>}
                  </div>
                  {item.instructions && (
                    <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.25rem', fontStyle: 'italic' }}>
                      Note: {item.instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : consultation.prescription_text ? (
          <div style={{ marginTop: '0.5rem', breakInside: 'avoid' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 700, color: '#1A6B8A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontFamily: 'serif', fontStyle: 'italic', fontWeight: 600 }}>Rx</span>
              Prescription (Legacy)
            </h3>
            <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#1a202c', fontWeight: 500 }}>{consultation.prescription_text}</p>
            </div>
          </div>
        ) : null}

        {consultation.advice && (
          <div style={{ breakInside: 'avoid' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: '#1A6B8A', textTransform: 'uppercase' }}>Advice / Investigations</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: '#2d3748' }}>{consultation.advice}</p>
          </div>
        )}

        {/* ── Follow-up ── */}
        {consultation.follow_up_date && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', breakInside: 'avoid' }}>
            <p style={{ margin: 0, fontSize: '1rem', color: '#2d3748' }}>
              <strong>Next Follow-up:</strong> {format(new Date(consultation.follow_up_date), 'dd MMM yyyy')}
              {consultation.follow_up_time ? ` at ${consultation.follow_up_time.slice(0,5)}` : ''}
            </p>
          </div>
        )}
        
      </div>

      {/* ── Clinical Images ── */}
      {consultation.images && consultation.images.length > 0 && (
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px dashed #e2e8f0', breakInside: 'avoid' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#718096', textTransform: 'uppercase' }}>
            Attached Clinical Images
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {consultation.images.map((img: any) => (
              <div key={img.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt="Clinical" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer style={{ marginTop: '4rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.85rem', color: '#a0aec0' }}>
        <p style={{ margin: 0 }}>Generated by Dr. Snehal Korade CaseBook on {format(new Date(), 'dd MMM yyyy, hh:mm a')}</p>
        <p style={{ margin: '0.25rem 0 0' }}>This is a system-generated document.</p>
      </footer>
    </div>
  );
}
