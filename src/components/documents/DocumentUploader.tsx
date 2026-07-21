'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { ArrowUpTrayIcon, DocumentTextIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface DocumentUploaderProps {
  patientId: string;
}

export function DocumentUploader({ patientId }: DocumentUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('lab_report');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setError('');
      
      if (selectedFile.type.startsWith('image/')) {
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1500,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(selectedFile, options);
          setFile(compressedFile);
        } catch (error) {
          console.error('Error compressing image:', error);
          setFile(selectedFile);
        }
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Upload file using FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'documents');
      formData.append('patientId', patientId);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload file');
      const { publicUrl } = await res.json();

      // 3. Save Document Metadata to DB
      const dbRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          type,
          file_url: publicUrl,
          file_name: file.name,
        }),
      });

      if (!dbRes.ok) throw new Error('Failed to save document metadata');

      // Success
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      router.refresh(); // Refresh page to show new document
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="card-elevated" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
        Upload Document
      </h3>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Document Type</label>
        <select 
          className="input-field" 
          value={type} 
          onChange={(e) => setType(e.target.value)}
        >
          <option value="lab_report">Lab Report</option>
          <option value="scan">Scan (X-Ray, MRI, etc)</option>
          <option value="other">Other Document</option>
        </select>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        style={{ 
          border: '2px dashed var(--border-strong)', 
          borderRadius: '8px', 
          padding: '2rem 1rem', 
          textAlign: 'center', 
          cursor: 'pointer',
          background: 'var(--bg-surface-2)',
          marginBottom: '1.5rem'
        }}
        className="hover:border-primary hover:text-primary transition-colors"
      >
        <ArrowUpTrayIcon width={32} height={32} style={{ margin: '0 auto 0.5rem', color: file ? 'var(--color-primary)' : 'var(--text-muted)' }} />
        {file ? (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>{file.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
        ) : (
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Click to browse or drag file here</span>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          style={{ display: 'none' }} 
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading || !file} style={{ width: '100%', padding: '0.75rem' }}>
        {loading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
}
