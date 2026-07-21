'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface CompareConsultation {
  id: string;
  created_at: string;
  diagnosis: string | null;
  images: { id: string, image_url: string }[];
}

export function ImageCompareClient({ consultations }: { consultations: CompareConsultation[] }) {
  const [leftId, setLeftId] = useState<string>(consultations[0]?.id || '');
  const [rightId, setRightId] = useState<string>(consultations.length > 1 ? consultations[1].id : consultations[0]?.id || '');

  if (consultations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-surface-2)', borderRadius: '12px', border: '1px dashed var(--border-strong)' }}>
        <PhotoIcon width={48} height={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Images Found</h3>
        <p style={{ color: 'var(--text-muted)' }}>This patient does not have any clinical images to compare.</p>
      </div>
    );
  }

  const leftCon = consultations.find(c => c.id === leftId);
  const rightCon = consultations.find(c => c.id === rightId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      
      {/* Left Column */}
      <div className="card-elevated" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>View Date</label>
          <select className="input-field" value={leftId} onChange={(e) => setLeftId(e.target.value)} style={{ fontSize: '1rem', padding: '0.75rem' }}>
            {consultations.map(c => (
              <option key={c.id} value={c.id}>
                {format(new Date(c.created_at), 'dd MMM yyyy, HH:mm')} 
                {c.diagnosis ? ` - ${c.diagnosis}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, background: 'var(--bg-surface-2)', borderRadius: '8px', padding: '1rem', overflowY: 'auto' }}>
          {leftCon?.images.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {leftCon.images.map(img => (
                <img key={img.id} src={img.image_url} alt="Clinical" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-default)', objectFit: 'contain' }} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No images for this date</div>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="card-elevated" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Compare With Date</label>
          <select className="input-field" value={rightId} onChange={(e) => setRightId(e.target.value)} style={{ fontSize: '1rem', padding: '0.75rem' }}>
            {consultations.map(c => (
              <option key={c.id} value={c.id}>
                {format(new Date(c.created_at), 'dd MMM yyyy, HH:mm')} 
                {c.diagnosis ? ` - ${c.diagnosis}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, background: 'var(--bg-surface-2)', borderRadius: '8px', padding: '1rem', overflowY: 'auto' }}>
          {rightCon?.images.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rightCon.images.map(img => (
                <img key={img.id} src={img.image_url} alt="Clinical" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-default)', objectFit: 'contain' }} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No images for this date</div>
          )}
        </div>
      </div>

    </div>
  );
}
