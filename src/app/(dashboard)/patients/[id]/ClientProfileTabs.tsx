'use client';

import React, { useState } from 'react';
import { ConsultationTimeline, ConsultationRecord } from '@/components/consultations/ConsultationTimeline';
import { PlusIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { DocumentList } from '@/components/documents/DocumentList';

interface ClientProfileTabsProps {
  patientId: string;
  consultations: ConsultationRecord[];
  documents: any[];
}

export function ClientProfileTabs({ patientId, consultations, documents }: ClientProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'consultations' | 'documents'>('consultations');

  return (
    <div>
      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-default)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('consultations')}
          style={{ 
            background: 'none', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer',
            fontSize: '1.0625rem', fontWeight: 600,
            color: activeTab === 'consultations' ? 'var(--color-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'consultations' ? '3px solid var(--color-primary)' : '3px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Consultations
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          style={{ 
            background: 'none', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer',
            fontSize: '1.0625rem', fontWeight: 600,
            color: activeTab === 'documents' ? 'var(--color-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'documents' ? '3px solid var(--color-primary)' : '3px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Documents
        </button>
      </div>

      {/* Tabs Content */}
      {activeTab === 'consultations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Consultation Timeline</h2>
              {consultations.length > 1 && (
                <Link href={`/patients/${patientId}/compare`} className="btn-ghost" style={{ fontSize: '0.875rem' }}>
                  Compare Images
                </Link>
              )}
            </div>
            <Link href={`/patients/${patientId}/consultations/new`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <PlusIcon width={18} height={18} />
              Start Consultation
            </Link>
          </div>

          {consultations.length > 0 ? (
            <ConsultationTimeline consultations={consultations} />
          ) : (
            <div style={{ 
              background: 'var(--bg-surface-2)', border: '1px dashed var(--border-strong)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <DocumentPlusIcon width={32} height={32} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Consultations Yet</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 2rem' }}>This patient doesn't have any clinical history recorded.</p>
              <Link href={`/patients/${patientId}/consultations/new`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                <PlusIcon width={20} height={20} /> Start First Consultation
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          <div>
            <DocumentUploader patientId={patientId} />
          </div>
          <div>
            <DocumentList initialDocuments={documents} />
          </div>
        </div>
      )}
    </div>
  );
}
