'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  UserGroupIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArchiveBoxIcon,
  TrashIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { getInitials, getAvatarColor } from '@/lib/utils';

type Patient = {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  dob: string | null;
  gender: string | null;
  photo_url: string | null;
  is_archived: boolean;
};

interface PatientsClientProps {
  initialPatients: Patient[];
}

type SortField = 'name' | 'added_on';
type SortOrder = 'asc' | 'desc';

export function PatientsClient({ initialPatients }: PatientsClientProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('added_on');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  
  // Modals state
  const [archiveModal, setArchiveModal] = useState<{ isOpen: boolean; patient: Patient | null }>({ isOpen: false, patient: null });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; patient: Patient | null }>({ isOpen: false, patient: null });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const itemsPerPage = 20;

  const calculateAge = (dob: string | null) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'added_on' ? 'desc' : 'asc');
    }
  };

  const filteredPatients = useMemo(() => {
    return initialPatients.filter(p => p.is_archived === showArchived);
  }, [initialPatients, showArchived]);

  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.full_name.localeCompare(b.full_name);
      } else if (sortField === 'added_on') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredPatients, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const paginatedPatients = sortedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' 
      ? <ChevronUpIcon width={14} height={14} style={{ display: 'inline', marginLeft: '4px' }} />
      : <ChevronDownIcon width={14} height={14} style={{ display: 'inline', marginLeft: '4px' }} />;
  };

  const toggleArchiveStatus = async (patientId: string, archiveStatus: boolean) => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/patients/${patientId}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: archiveStatus })
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
      setArchiveModal({ isOpen: false, patient: null });
    }
  };

  const permanentlyDeletePatient = async () => {
    if (!deleteModal.patient) return;
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/patients/${deleteModal.patient.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
      setDeleteModal({ isOpen: false, patient: null });
      setDeleteConfirmText('');
    }
  };

  return (
    <div style={{ padding: '2.5rem 1.75rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserGroupIcon width={32} height={32} style={{ color: 'var(--color-primary)' }} />
          All Patients
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showArchived} 
              onChange={(e) => {
                setShowArchived(e.target.checked);
                setCurrentPage(1);
              }} 
              style={{ accentColor: 'var(--color-primary)' }}
            />
            Show archived patients
          </label>
          <Link href="/patients/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', borderRadius: '999px' }}>
            <PlusIcon width={18} height={18} />
            Add Patient
          </Link>
        </div>
      </div>

      <div className="card-elevated" style={{ overflow: 'hidden' }}>
        {filteredPatients.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No {showArchived ? 'archived ' : ''}patients found.
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-default)', background: 'var(--bg-surface-2)' }}>
                    <th 
                      onClick={() => handleSort('name')}
                      style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
                    >
                      Name <SortIcon field="name" />
                    </th>
                    <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Gender</th>
                    <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Age</th>
                    <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone</th>
                    <th 
                      onClick={() => handleSort('added_on')}
                      style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
                    >
                      Added On <SortIcon field="added_on" />
                    </th>
                    <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((patient) => (
                    <tr key={patient.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background 0.2s ease', opacity: patient.is_archived ? 0.7 : 1 }} className="hover:bg-surface-2">
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', 
                            flexShrink: 0, background: patient.is_archived ? 'var(--bg-surface-3)' : getAvatarColor(patient.full_name),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: patient.is_archived ? 'var(--text-secondary)' : 'white', fontWeight: 700, fontSize: '0.875rem'
                          }}>
                            {patient.photo_url ? (
                              <img src={patient.photo_url} alt={patient.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: patient.is_archived ? 'grayscale(100%)' : 'none' }} />
                            ) : (
                              getInitials(patient.full_name)
                            )}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
                            {patient.full_name}
                            {patient.is_archived && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '2px 6px', background: 'var(--bg-surface-3)', borderRadius: '4px', color: 'var(--text-secondary)' }}>Archived</span>}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {patient.gender ? <span style={{ textTransform: 'capitalize' }}>{patient.gender}</span> : '-'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {calculateAge(patient.dob)}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{patient.phone || '-'}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {new Date(patient.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          {patient.is_archived ? (
                            <>
                              <button onClick={() => toggleArchiveStatus(patient.id, false)} className="btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <ArrowUturnLeftIcon width={14} height={14} /> Unarchive
                              </button>
                              <button onClick={() => setDeleteModal({ isOpen: true, patient })} className="btn-ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', borderRadius: '999px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <TrashIcon width={14} height={14} /> Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <Link 
                                href={`/patients/${patient.id}`} 
                                className="btn-primary" 
                                style={{ padding: '0.375rem 1rem', fontSize: '0.875rem', borderRadius: '999px' }}
                              >
                                View Profile
                              </Link>
                              <button onClick={() => setArchiveModal({ isOpen: true, patient })} className="btn-ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', borderRadius: '999px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }} title="Archive Patient">
                                <ArchiveBoxIcon width={18} height={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface-2)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedPatients.length)} of {sortedPatients.length} patients
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary"
                    style={{ padding: '0.375rem 1rem', fontSize: '0.875rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary"
                    style={{ padding: '0.375rem 1rem', fontSize: '0.875rem', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Archive Modal */}
      {archiveModal.isOpen && archiveModal.patient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card-elevated" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Archive Patient?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to archive <strong>{archiveModal.patient.full_name}</strong>? Their records will be hidden from the main list and dashboard, but not deleted. They can be restored later.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setArchiveModal({ isOpen: false, patient: null })}
                className="btn-ghost"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={() => toggleArchiveStatus(archiveModal.patient!.id, true)}
                className="btn-primary"
                disabled={isProcessing}
                style={{ background: 'var(--text-secondary)' }} // Neutral styling
              >
                {isProcessing ? 'Archiving...' : 'Yes, Archive Patient'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && deleteModal.patient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card-elevated" style={{ maxWidth: '450px', width: '100%', padding: '2rem', borderTop: '4px solid #ef4444' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrashIcon width={24} height={24} style={{ color: '#ef4444' }} />
              Permanently Delete Patient
            </h3>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              <strong>WARNING:</strong> This action cannot be undone. This will permanently remove <strong>{deleteModal.patient.full_name}</strong> and all of their consultations, clinical images, and documents from the database and storage.
            </div>
            
            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Type <strong>{deleteModal.patient.full_name}</strong> to confirm:
              </span>
              <input 
                type="text" 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input-field"
                placeholder={deleteModal.patient.full_name}
              />
            </label>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setDeleteModal({ isOpen: false, patient: null }); setDeleteConfirmText(''); }}
                className="btn-ghost"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={permanentlyDeletePatient}
                disabled={isProcessing || deleteConfirmText !== deleteModal.patient.full_name}
                className="btn-primary"
                style={{ 
                  background: '#ef4444', 
                  opacity: (isProcessing || deleteConfirmText !== deleteModal.patient.full_name) ? 0.5 : 1,
                  cursor: (isProcessing || deleteConfirmText !== deleteModal.patient.full_name) ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
