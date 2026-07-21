'use client';

import React, { useEffect } from 'react';
import { format } from 'date-fns';

interface PrintFullRecordClientProps {
  patient: any;
  consultations: any[];
}

export function PrintFullRecordClient({ patient, consultations }: PrintFullRecordClientProps) {
  useEffect(() => {
    // Automatically trigger print dialog when page loads
    // Adding a small timeout to ensure images are loaded (ideally we'd track image loads)
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', minHeight: '100vh', padding: '2rem 3rem' }}>
      
      {/* 1. Header (Letterhead) */}
      <header style={{ borderBottom: '2px solid #2b6cb0', paddingBottom: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 800, color: '#2b6cb0', letterSpacing: '-0.5px' }}>
          Dr. Snehal Korade
        </h1>
        <p style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: '#4a5568', fontWeight: 500 }}>
          MBBS, MD (Medicine) • Reg No: 12345
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#718096' }}>
          CaseBook Clinic, 123 Health Avenue, Medical District
        </p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#718096' }}>
          Phone: +91 98765 43210
        </p>
      </header>

      {/* 2. Patient Demographics Block */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '1rem', 
        background: '#f7fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#2d3748' }}>
            {patient.full_name}
          </h2>
          <div style={{ fontSize: '0.95rem', color: '#4a5568', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div><strong>Gender:</strong> {patient.gender || 'Not specified'}</div>
            {patient.age !== null && <div><strong>Age:</strong> {patient.age} years</div>}
            {patient.blood_group && <div><strong>Blood Group:</strong> {patient.blood_group}</div>}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.95rem', color: '#4a5568', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontWeight: 600, color: '#2b6cb0', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
            Full Medical Record
          </div>
          <div>Generated: {format(new Date(), 'dd MMM yyyy')}</div>
        </div>
      </div>

      {patient.allergies && (
        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #fed7d7', background: '#fff5f5', color: '#c53030', borderRadius: '8px' }}>
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>ALLERGIES ALERT:</strong>
          {patient.allergies}
        </div>
      )}

      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
        Consultation History
      </h2>

      {consultations.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#718096', fontStyle: 'italic', padding: '2rem' }}>No consultations found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {consultations.map((consultation, index) => (
            <div key={consultation.id} style={{ breakInside: 'avoid', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              
              {/* Date & Type Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#2b6cb0' }}>
                  {format(new Date(consultation.created_at), 'dd MMM yyyy')}
                </h3>
                <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: consultation.visit_type === 'new' ? '#38a169' : '#805ad5', background: consultation.visit_type === 'new' ? '#f0fff4' : '#faf5ff', padding: '4px 12px', borderRadius: '16px' }}>
                  {consultation.visit_type === 'new' ? 'New Case' : 'Follow Up'}
                </span>
              </div>

              {/* Grid for sections */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                
                {/* Vitals */}
                {consultation.vitals && (
                  <div style={{ breakInside: 'avoid' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>Vitals</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#f7fafc', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                      {consultation.vitals.bp && <div><span style={{ color: '#718096', fontSize: '0.85rem', marginRight: '4px' }}>BP</span><strong>{consultation.vitals.bp}</strong></div>}
                      {consultation.vitals.pulse && <div><span style={{ color: '#718096', fontSize: '0.85rem', marginRight: '4px' }}>PR</span><strong>{consultation.vitals.pulse}</strong></div>}
                      {consultation.vitals.temp && <div><span style={{ color: '#718096', fontSize: '0.85rem', marginRight: '4px' }}>Temp</span><strong>{consultation.vitals.temp}°F</strong></div>}
                      {consultation.vitals.weight && <div><span style={{ color: '#718096', fontSize: '0.85rem', marginRight: '4px' }}>Wt</span><strong>{consultation.vitals.weight}kg</strong></div>}
                      {consultation.vitals.spo2 && <div><span style={{ color: '#718096', fontSize: '0.85rem', marginRight: '4px' }}>SpO2</span><strong>{consultation.vitals.spo2}%</strong></div>}
                    </div>
                  </div>
                )}

                {/* Text fields */}
                {consultation.chief_complaint && (
                  <div style={{ breakInside: 'avoid' }}>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>Chief Complaint</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: '#2d3748' }}>{consultation.chief_complaint}</p>
                  </div>
                )}

                {consultation.history && (
                  <div style={{ breakInside: 'avoid' }}>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>History</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: '#2d3748', whiteSpace: 'pre-wrap' }}>{consultation.history}</p>
                  </div>
                )}

                {consultation.examination_findings && (
                  <div style={{ breakInside: 'avoid' }}>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>Examination Findings</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: '#2d3748', whiteSpace: 'pre-wrap' }}>{consultation.examination_findings}</p>
                  </div>
                )}

                {consultation.diagnosis && (
                  <div style={{ breakInside: 'avoid' }}>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>Diagnosis</h4>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#e53e3e' }}>{consultation.diagnosis}</p>
                  </div>
                )}

                {/* Prescription */}
                {consultation.prescription_items && consultation.prescription_items.length > 0 ? (
                  <div style={{ breakInside: 'avoid' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 700, color: '#1A6B8A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem', fontFamily: 'serif', fontStyle: 'italic', fontWeight: 600 }}>Rx</span>
                      Prescription
                    </h4>
                    <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      {consultation.prescription_items.map((item: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: idx < consultation.prescription_items.length - 1 ? '0.75rem' : 0, paddingBottom: idx < consultation.prescription_items.length - 1 ? '0.75rem' : 0, borderBottom: idx < consultation.prescription_items.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <strong style={{ color: '#2d3748', fontSize: '1rem' }}>{item.drug_name}</strong>
                            <span style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 500 }}>{item.duration}</span>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '0.25rem' }}>
                            {item.dosage && <span>{item.dosage}</span>}
                            {item.dosage && item.frequency && <span> • </span>}
                            {item.frequency && <span>{item.frequency}</span>}
                          </div>
                          {item.instructions && (
                            <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.25rem', fontStyle: 'italic' }}>Note: {item.instructions}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : consultation.prescription_text ? (
                  <div style={{ breakInside: 'avoid' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 700, color: '#1A6B8A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem', fontFamily: 'serif', fontStyle: 'italic', fontWeight: 600 }}>Rx</span>
                      Prescription (Legacy)
                    </h4>
                    <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#1a202c', fontWeight: 500 }}>{consultation.prescription_text}</p>
                    </div>
                  </div>
                ) : null}

                {/* Advice */}
                {consultation.advice && (
                  <div style={{ breakInside: 'avoid' }}>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>Advice / Investigations</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: '#2d3748', whiteSpace: 'pre-wrap' }}>{consultation.advice}</p>
                  </div>
                )}
                
                {/* Images */}
                {consultation.images && consultation.images.length > 0 && (
                  <div style={{ breakInside: 'avoid' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>Clinical Images</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {consultation.images.map((img: any) => (
                        <div key={img.id} style={{ width: '150px', height: '150px', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                          <img src={img.image_url} alt="Clinical" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.85rem', color: '#a0aec0' }}>
        End of Medical Record • Generated by CaseBook EMR
      </footer>
    </div>
  );
}
