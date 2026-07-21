'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDownIcon, ChevronUpIcon, PrinterIcon } from '@heroicons/react/24/outline';

interface ClinicalImage {
  id: string;
  image_url: string;
}

export interface ConsultationRecord {
  id: string;
  visit_date: string;
  visit_type: string;
  vitals: any;
  chief_complaint: string | null;
  history: string | null;
  examination_findings: string | null;
  diagnosis: string | null;
  prescription_text: string | null;
  prescription_items?: any[];
  advice: string | null;
  follow_up_date: string | null;
  follow_up_time: string | null;
  created_at: string;
  images?: ClinicalImage[];
}

export function ConsultationTimeline({ consultations }: { consultations: ConsultationRecord[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!consultations || consultations.length === 0) {
    return null; // The empty state will be handled by the parent page
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {consultations.map((consultation) => {
        const isExpanded = expandedId === consultation.id;
        const formattedDate = format(new Date(consultation.created_at), 'dd MMM yyyy, hh:mm a');
        const followUpDisplay = consultation.follow_up_date 
          ? format(new Date(consultation.follow_up_date), 'dd MMM yyyy') + (consultation.follow_up_time ? `, ${consultation.follow_up_time.slice(0,5)}` : '')
          : null;

        return (
          <div key={consultation.id} className="card-elevated" style={{ overflow: 'hidden', padding: 0 }}>
            {/* Collapsed Header / Toggle */}
            <div 
              onClick={() => toggleExpand(consultation.id)}
              style={{ 
                padding: '1.5rem', 
                cursor: 'pointer', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: isExpanded ? 'var(--bg-surface-2)' : 'var(--bg-surface)',
                transition: 'background 150ms ease'
              }}
            >
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1 }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    {consultation.visit_type === 'new' ? 'New Case' : 'Follow Up'}
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formattedDate}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {consultation.diagnosis || 'No diagnosis recorded'}
                  </div>
                </div>

                {followUpDisplay && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Follow-up</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-primary)' }}>{followUpDisplay}</div>
                  </div>
                )}
              </div>

              <div style={{ marginLeft: '1.5rem', color: 'var(--text-muted)' }}>
                {isExpanded ? <ChevronUpIcon width={24} height={24} /> : <ChevronDownIcon width={24} height={24} />}
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Vitals */}
                {consultation.vitals && Object.keys(consultation.vitals).length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Vitals</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', background: 'var(--bg-surface-2)', padding: '1rem', borderRadius: '8px' }}>
                      {consultation.vitals.bp && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BP</div><div style={{ fontWeight: 600 }}>{consultation.vitals.bp}</div></div>}
                      {consultation.vitals.pulse && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pulse</div><div style={{ fontWeight: 600 }}>{consultation.vitals.pulse}</div></div>}
                      {consultation.vitals.temp && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temp (°F)</div><div style={{ fontWeight: 600 }}>{consultation.vitals.temp}</div></div>}
                      {consultation.vitals.weight && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight (kg)</div><div style={{ fontWeight: 600 }}>{consultation.vitals.weight}</div></div>}
                      {consultation.vitals.height && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Height (cm)</div><div style={{ fontWeight: 600 }}>{consultation.vitals.height}</div></div>}
                      {consultation.vitals.spo2 && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SpO2 (%)</div><div style={{ fontWeight: 600 }}>{consultation.vitals.spo2}</div></div>}
                      {consultation.vitals.bmi && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BMI</div><div style={{ fontWeight: 600 }}>{consultation.vitals.bmi}</div></div>}
                    </div>
                  </div>
                )}

                {/* Text fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  {consultation.chief_complaint && (
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Chief Complaint</h4>
                      <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{consultation.chief_complaint}</p>
                    </div>
                  )}
                  {consultation.history && (
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>History</h4>
                      <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{consultation.history}</p>
                    </div>
                  )}
                  {consultation.examination_findings && (
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Examination Findings</h4>
                      <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{consultation.examination_findings}</p>
                    </div>
                  )}
                  {/* Structured Prescription Rendering */}
                  {consultation.prescription_items && consultation.prescription_items.length > 0 ? (
                    <div style={{ background: 'var(--color-primary-light)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Prescription</h4>
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
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Prescription (Legacy)</h4>
                      <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{consultation.prescription_text}</p>
                    </div>
                  ) : null}
                  {consultation.advice && (
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Advice / Investigations</h4>
                      <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{consultation.advice}</p>
                    </div>
                  )}
                </div>

                {/* Clinical Images */}
                {consultation.images && consultation.images.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Clinical Images</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {consultation.images.map((img) => (
                        <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                          <img src={img.image_url} alt="Clinical" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Print Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-default)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                  <a 
                    href={`/print/consultation/${consultation.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                  >
                    <PrinterIcon width={18} height={18} />
                    Print Prescription
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
