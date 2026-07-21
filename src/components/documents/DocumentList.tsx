'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { DocumentTextIcon, PhotoIcon, EllipsisHorizontalCircleIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';

interface DocumentRecord {
  id: string;
  type: 'lab_report' | 'scan' | 'other';
  file_url: string;
  file_name: string;
  uploaded_at: string;
  consultation_id: string | null;
}

export function DocumentList({ initialDocuments }: { initialDocuments: DocumentRecord[] }) {
  const [filter, setFilter] = useState<'all' | 'lab_report' | 'scan' | 'other'>('all');

  const filteredDocs = filter === 'all' 
    ? initialDocuments 
    : initialDocuments.filter(d => d.type === filter);

  const getIcon = (type: string, file_url: string) => {
    if (file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return <PhotoIcon width={24} height={24} style={{ color: 'var(--color-primary)' }} />;
    }
    if (type === 'lab_report') {
      return <DocumentTextIcon width={24} height={24} style={{ color: 'var(--color-primary)' }} />;
    }
    return <DocumentTextIcon width={24} height={24} style={{ color: 'var(--text-secondary)' }} />;
  };

  const getLabel = (type: string) => {
    switch(type) {
      case 'lab_report': return 'Lab Report';
      case 'scan': return 'Scan';
      default: return 'Other';
    }
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {['all', 'lab_report', 'scan', 'other'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            style={{
              padding: '0.375rem 1rem',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: filter === f ? 'none' : '1px solid var(--border-default)',
              background: filter === f ? 'var(--color-primary)' : 'var(--bg-surface)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {f === 'all' ? 'All Documents' : getLabel(f)}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredDocs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-surface-2)', borderRadius: '8px', border: '1px dashed var(--border-strong)', color: 'var(--text-muted)' }}>
          No documents found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredDocs.map(doc => (
            <div key={doc.id} className="card-elevated" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: 'var(--bg-surface-2)', padding: '0.5rem', borderRadius: '8px' }}>
                    {getIcon(doc.type, doc.file_url)}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={doc.file_name}>
                      {doc.file_name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-surface-2)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                      {getLabel(doc.type)}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Uploaded: {format(new Date(doc.uploaded_at), 'dd MMM yyyy, HH:mm')}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <EyeIcon width={16} height={16} /> View
                </a>
                <a href={doc.file_url} download className="btn-ghost" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <ArrowDownTrayIcon width={16} height={16} /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
