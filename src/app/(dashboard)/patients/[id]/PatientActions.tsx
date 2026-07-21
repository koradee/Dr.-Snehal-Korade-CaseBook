'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArchiveBoxIcon, ArrowUturnLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

interface PatientActionsProps {
  patientId: string;
  patientName: string;
  isArchived: boolean;
}

export function PatientActions({ patientId, patientName, isArchived }: PatientActionsProps) {
  const router = useRouter();
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleArchiveStatus = async (archiveStatus: boolean) => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/patients/${patientId}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: archiveStatus })
      });
      if (res.ok) {
        setArchiveModalOpen(false);
        router.push('/patients'); // Redirect to patients list after archiving
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  const permanentlyDeletePatient = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/patients');
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isArchived ? (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => toggleArchiveStatus(false)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUturnLeftIcon width={18} height={18} />
            Unarchive Patient
          </button>
          <button onClick={() => setDeleteModalOpen(true)} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
            <TrashIcon width={18} height={18} />
            Permanently Delete
          </button>
        </div>
      ) : (
        <button onClick={() => setArchiveModalOpen(true)} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <ArchiveBoxIcon width={18} height={18} />
          Archive Patient
        </button>
      )}

      {/* Archive Modal */}
      {archiveModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card-elevated" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Archive Patient?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to archive <strong>{patientName}</strong>? Their records will be hidden from the main list and dashboard, but not deleted. They can be restored later.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setArchiveModalOpen(false)}
                className="btn-ghost"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={() => toggleArchiveStatus(true)}
                className="btn-primary"
                disabled={isProcessing}
                style={{ background: 'var(--text-secondary)' }}
              >
                {isProcessing ? 'Archiving...' : 'Yes, Archive Patient'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card-elevated" style={{ maxWidth: '450px', width: '100%', padding: '2rem', borderTop: '4px solid #ef4444' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrashIcon width={24} height={24} style={{ color: '#ef4444' }} />
              Permanently Delete Patient
            </h3>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              <strong>WARNING:</strong> This action cannot be undone. This will permanently remove <strong>{patientName}</strong> and all of their consultations, clinical images, and documents from the database and storage.
            </div>
            
            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Type <strong>{patientName}</strong> to confirm:
              </span>
              <input 
                type="text" 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input-field"
                placeholder={patientName}
              />
            </label>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setDeleteModalOpen(false); setDeleteConfirmText(''); }}
                className="btn-ghost"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={permanentlyDeletePatient}
                disabled={isProcessing || deleteConfirmText !== patientName}
                className="btn-primary"
                style={{ 
                  background: '#ef4444', 
                  opacity: (isProcessing || deleteConfirmText !== patientName) ? 0.5 : 1,
                  cursor: (isProcessing || deleteConfirmText !== patientName) ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
